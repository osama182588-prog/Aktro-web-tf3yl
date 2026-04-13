// Bot Event Handlers
// معالجات أحداث البوت - التفاعلات والأزرار

import { Events, EmbedBuilder } from 'discord.js'
import { ActivationStatus } from '@prisma/client'
import { client } from './client'
import { config } from '../config'
import { prisma } from '../prisma'
import { eventBus } from '../events'
import {
  statusLabels,
  sendAdminNotification,
  updateMemberRole,
  sendUserDM,
  setupDashboard,
} from './services'

// Get user activation status from shared database
async function getUserStatus(discordId: string) {
  const user = await prisma.user.findUnique({
    where: { discordId },
    include: {
      activationRequests: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!user || user.activationRequests.length === 0) {
    return {
      status: 'NOT_ACTIVATED',
      message: 'لم تقدم طلب تفعيل بعد',
      createdAt: null,
      updatedAt: null,
    }
  }

  const request = user.activationRequests[0]
  return {
    status: request.status,
    message: statusLabels[request.status] || request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    publicNotes: request.publicNotes,
  }
}

// Delay before setting up the dashboard (ms) - allows Discord cache to populate
const DASHBOARD_SETUP_DELAY_MS = 2000

// Register all bot event handlers
export function registerEventHandlers(): void {
  // Bot ready event
  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`🤖 Discord bot logged in as ${readyClient.user.tag}`)

    // Set bot presence
    readyClient.user.setPresence({
      status: 'online',
      activities: [{ name: 'Secret CFW | تفعيل', type: 3 }],
    })

    // Emit bot ready event for the system
    eventBus.emitEvent('bot:ready', { tag: readyClient.user.tag })

    // Setup dashboard after cache is populated
    setTimeout(setupDashboard, DASHBOARD_SETUP_DELAY_MS)
  })

  // Button interaction handler
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return

    const { customId, user } = interaction

    // Check status button
    if (customId === 'check_status') {
      await interaction.deferReply({ ephemeral: true })

      try {
        const status = await getUserStatus(user.id)

        const embed = new EmbedBuilder()
          .setColor(
            status.status === 'ACTIVATED' ? 0x10B981 :
            status.status === 'PENDING' ? 0xF59E0B :
            status.status === 'REJECTED' ? 0xEF4444 :
            0x6B7280
          )
          .setTitle('📋 حالة التفعيل الخاصة بك')
          .addFields(
            { name: 'الحالة', value: status.message, inline: true }
          )

        if (status.createdAt) {
          embed.addFields({
            name: 'تاريخ التقديم',
            value: new Date(status.createdAt).toLocaleDateString('ar-SA'),
            inline: true,
          })
        }

        if (status.updatedAt) {
          embed.addFields({
            name: 'آخر تحديث',
            value: new Date(status.updatedAt).toLocaleDateString('ar-SA'),
            inline: true,
          })
        }

        if (status.publicNotes) {
          embed.addFields({
            name: 'ملاحظات الإدارة',
            value: status.publicNotes,
          })
        }

        await interaction.editReply({ embeds: [embed] })
      } catch (error) {
        console.error('Error checking status:', error)
        await interaction.editReply({
          content: '❌ حدث خطأ أثناء جلب حالة التفعيل. يرجى المحاولة لاحقاً.',
        })
      }
    }

    // Admin action buttons
    if (customId.startsWith('approve_') || customId.startsWith('reject_') || customId.startsWith('edit_')) {
      const member = await interaction.guild?.members.fetch(user.id)
      if (!member) return

      const isAdmin = member.roles.cache.has(config.bot.roles.highAdmin) ||
                     member.roles.cache.has(config.bot.roles.activationAdmin)

      if (!isAdmin) {
        await interaction.reply({
          content: '❌ ليس لديك صلاحية لتنفيذ هذا الإجراء.',
          ephemeral: true,
        })
        return
      }

      const [action, targetDiscordId] = customId.split('_')

      await interaction.deferReply({ ephemeral: true })

      try {
        const targetUser = await prisma.user.findUnique({
          where: { discordId: targetDiscordId },
          include: {
            activationRequests: {
              where: { status: 'PENDING' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        })

        if (!targetUser || targetUser.activationRequests.length === 0) {
          await interaction.editReply({
            content: '❌ لم يتم العثور على طلب تفعيل معلق لهذا المستخدم.',
          })
          return
        }

        const request = targetUser.activationRequests[0]
        const adminUser = await prisma.user.findUnique({
          where: { discordId: user.id },
        })

        const statusMap: Record<string, ActivationStatus> = {
          approve: 'ACTIVATED',
          reject: 'REJECTED',
          edit: 'EDIT_REQUESTED',
        }

        const newStatus = statusMap[action]

        // Update request in shared database
        await prisma.activationRequest.update({
          where: { id: request.id },
          data: {
            status: newStatus,
            reviewedAt: new Date(),
            reviewedBy: adminUser?.id,
          },
        })

        // Log admin action in shared database
        if (adminUser) {
          await prisma.adminLog.create({
            data: {
              adminId: adminUser.id,
              targetId: targetUser.id,
              action: `DISCORD_${action.toUpperCase()}`,
              details: { requestId: request.id },
            },
          })
        }

        // Update role if approved
        if (action === 'approve') {
          await updateMemberRole(targetDiscordId, 'add')
        }

        // Send notification to admin channel
        await sendAdminNotification(
          action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'edit_requested',
          {
            discordId: targetDiscordId,
            discordUsername: targetUser.discordUsername,
            reviewedBy: user.username,
          }
        )

        // DM the user
        await sendUserDM(targetDiscordId, action as 'approve' | 'reject' | 'edit')

        // Emit event for website sync
        eventBus.emitEvent('bot:action', {
          action: `DISCORD_${action.toUpperCase()}`,
          discordId: targetDiscordId,
          adminId: user.id,
          requestId: request.id,
        })

        await interaction.editReply({
          content: `✅ تم تنفيذ الإجراء بنجاح: ${
            action === 'approve' ? 'قبول' : action === 'reject' ? 'رفض' : 'طلب تعديل'
          }`,
        })

        // Remove buttons from original message
        await interaction.message.edit({
          components: [],
        })
      } catch (error) {
        console.error('Error processing admin action:', error)
        await interaction.editReply({
          content: '❌ حدث خطأ أثناء تنفيذ الإجراء.',
        })
      }
    }
  })

  // Listen for system events from website
  eventBus.onEvent('activation:new_request', async (data) => {
    await sendAdminNotification('new_request', {
      discordId: data.discordId,
      discordUsername: data.discordUsername,
      realName: data.realName,
      characterName: data.characterName,
    })
  })

  eventBus.onEvent('activation:approved', async (data) => {
    await updateMemberRole(data.discordId, 'add')
    await sendUserDM(data.discordId, 'approve')
    await sendAdminNotification('approved', {
      discordId: data.discordId,
      discordUsername: data.discordUsername,
      reviewedBy: data.reviewedBy,
    })
  })

  eventBus.onEvent('activation:rejected', async (data) => {
    await sendUserDM(data.discordId, 'reject')
    await sendAdminNotification('rejected', {
      discordId: data.discordId,
      discordUsername: data.discordUsername,
      reviewedBy: data.reviewedBy,
    })
  })

  eventBus.onEvent('activation:edit_requested', async (data) => {
    await sendUserDM(data.discordId, 'edit')
    await sendAdminNotification('edit_requested', {
      discordId: data.discordId,
      discordUsername: data.discordUsername,
      reviewedBy: data.reviewedBy,
    })
  })
}
