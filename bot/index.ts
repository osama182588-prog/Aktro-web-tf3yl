import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, TextChannel } from 'discord.js'
import { PrismaClient, ActivationStatus } from '@prisma/client'

// Initialize Prisma
const prisma = new PrismaClient()

// Bot configuration
const config = {
  token: process.env.DISCORD_BOT_TOKEN || '',
  guildId: process.env.DISCORD_GUILD_ID || '',
  
  // Channels
  activationChannelId: process.env.DISCORD_ACTIVATION_CHANNEL_ID || '',
  adminNotificationsChannelId: process.env.DISCORD_ADMIN_NOTIFICATIONS_CHANNEL_ID || '',
  logsChannelId: process.env.DISCORD_LOGS_CHANNEL_ID || '',
  
  // Roles
  highAdminRoleId: process.env.DISCORD_HIGH_ADMIN_ROLE_ID || '',
  activationAdminRoleId: process.env.DISCORD_ACTIVATION_ADMIN_ROLE_ID || '',
  generalAdminRoleId: process.env.DISCORD_GENERAL_ADMIN_ROLE_ID || '',
  priorityRoleId: process.env.DISCORD_PRIORITY_ROLE_ID || '',
  activatedRoleId: process.env.DISCORD_ACTIVATED_ROLE_ID || '',
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
})

// Status labels in Arabic
const statusLabels: Record<string, string> = {
  NOT_ACTIVATED: '❌ غير مفعل',
  PENDING: '⏳ قيد المراجعة',
  ACTIVATED: '✅ مفعل',
  REJECTED: '❌ مرفوض',
  EDIT_REQUESTED: '📝 مطلوب تعديل',
}

// Create activation dashboard embed
function createDashboardEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3B82F6)
    .setTitle('🎮 Secret CFW - نظام التفعيل')
    .setDescription(`
مرحباً بك في نظام تفعيل سيرفر Secret CFW!

للتقديم على التفعيل، يرجى زيارة موقعنا الرسمي.

**خطوات التفعيل:**
1️⃣ سجل دخولك عبر Discord على الموقع
2️⃣ اقرأ الشروط والأحكام
3️⃣ أكمل نموذج التفعيل والاختبار
4️⃣ انتظر مراجعة طلبك من الإدارة

**ملاحظات:**
• يجب أن يكون عمرك 18 سنة على الأقل
• اقرأ الشروط بعناية قبل التقديم
• الإجابات الجيدة تزيد فرص القبول
    `)
    .setImage('https://via.placeholder.com/600x200/1E293B/3B82F6?text=Secret+CFW')
    .setFooter({ text: 'Secret CFW - تجربة رول بلاي احترافية' })
    .setTimestamp()
}

// Create status button
function createStatusButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('check_status')
        .setLabel('🔍 معرفة حالة التفعيل')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('🌐 التقديم على التفعيل')
        .setStyle(ButtonStyle.Link)
        .setURL(process.env.NEXTAUTH_URL || 'http://localhost:3000')
    )
}

// Get user activation status
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

// Send admin notification
async function sendAdminNotification(
  type: 'new_request' | 'approved' | 'rejected' | 'edit_requested',
  data: {
    discordId: string
    discordUsername: string
    realName?: string
    characterName?: string
    reviewedBy?: string
  }
) {
  const channel = client.channels.cache.get(config.adminNotificationsChannelId) as TextChannel
  if (!channel) return

  const colors = {
    new_request: 0xF59E0B,
    approved: 0x10B981,
    rejected: 0xEF4444,
    edit_requested: 0x3B82F6,
  }

  const titles = {
    new_request: '📥 طلب تفعيل جديد',
    approved: '✅ تم قبول طلب',
    rejected: '❌ تم رفض طلب',
    edit_requested: '📝 طلب تعديل',
  }

  const embed = new EmbedBuilder()
    .setColor(colors[type])
    .setTitle(titles[type])
    .addFields(
      { name: 'المستخدم', value: `<@${data.discordId}>`, inline: true },
      { name: 'اسم Discord', value: data.discordUsername, inline: true }
    )
    .setTimestamp()

  if (data.realName) {
    embed.addFields({ name: 'الاسم الحقيقي', value: data.realName, inline: true })
  }

  if (data.characterName) {
    embed.addFields({ name: 'الشخصية', value: data.characterName, inline: true })
  }

  if (data.reviewedBy) {
    embed.addFields({ name: 'بواسطة', value: data.reviewedBy, inline: true })
  }

  // Add action buttons for new requests
  if (type === 'new_request') {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${data.discordId}`)
          .setLabel('✅ قبول')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${data.discordId}`)
          .setLabel('❌ رفض')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`edit_${data.discordId}`)
          .setLabel('📝 طلب تعديل')
          .setStyle(ButtonStyle.Primary)
      )

    await channel.send({ embeds: [embed], components: [row] })
  } else {
    await channel.send({ embeds: [embed] })
  }
}

// Log action
async function logAction(message: string) {
  const channel = client.channels.cache.get(config.logsChannelId) as TextChannel
  if (!channel) return

  const embed = new EmbedBuilder()
    .setColor(0x6B7280)
    .setDescription(message)
    .setTimestamp()

  await channel.send({ embeds: [embed] })
}

// Update member role based on activation status
async function updateMemberRole(discordId: string, action: 'add' | 'remove') {
  const guild = client.guilds.cache.get(config.guildId)
  if (!guild) return

  try {
    const member = await guild.members.fetch(discordId)
    const role = guild.roles.cache.get(config.activatedRoleId)
    
    if (!member || !role) return

    if (action === 'add') {
      await member.roles.add(role)
      await logAction(`✅ تمت إضافة رتبة التفعيل لـ <@${discordId}>`)
    } else {
      await member.roles.remove(role)
      await logAction(`❌ تمت إزالة رتبة التفعيل من <@${discordId}>`)
    }
  } catch (error) {
    console.error('Error updating member role:', error)
  }
}

// Bot ready event
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`🤖 Discord bot logged in as ${readyClient.user.tag}`)
  
  // Set bot presence
  readyClient.user.setPresence({
    status: 'online',
    activities: [{ name: 'Secret CFW | تفعيل', type: 3 }],
  })
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
    // Check if user is admin
    const member = await interaction.guild?.members.fetch(user.id)
    if (!member) return

    const isAdmin = member.roles.cache.has(config.highAdminRoleId) ||
                   member.roles.cache.has(config.activationAdminRoleId)

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
      // Get target user
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

      // Map action to status
      const statusMap: Record<string, ActivationStatus> = {
        approve: 'ACTIVATED',
        reject: 'REJECTED',
        edit: 'EDIT_REQUESTED',
      }

      const newStatus = statusMap[action]

      // Update request
      await prisma.activationRequest.update({
        where: { id: request.id },
        data: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewedBy: adminUser?.id,
        },
      })

      // Log admin action
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

      // Send notification
      await sendAdminNotification(
        action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'edit_requested',
        {
          discordId: targetDiscordId,
          discordUsername: targetUser.discordUsername,
          reviewedBy: user.username,
        }
      )

      // DM the user
      try {
        const targetMember = await interaction.guild?.members.fetch(targetDiscordId)
        if (targetMember) {
          const dmEmbed = new EmbedBuilder()
            .setColor(action === 'approve' ? 0x10B981 : action === 'reject' ? 0xEF4444 : 0x3B82F6)
            .setTitle(
              action === 'approve' ? '✅ تم قبول طلبك!' :
              action === 'reject' ? '❌ تم رفض طلبك' :
              '📝 مطلوب تعديل على طلبك'
            )
            .setDescription(
              action === 'approve' ? 'تهانينا! تم قبول طلب التفعيل الخاص بك. يمكنك الآن الانضمام للسيرفر.' :
              action === 'reject' ? 'للأسف تم رفض طلب التفعيل. يمكنك إعادة التقديم مع تحسين إجاباتك.' :
              'يرجى مراجعة طلبك وإجراء التعديلات المطلوبة ثم إعادة الإرسال.'
            )
            .setFooter({ text: 'Secret CFW' })
            .setTimestamp()

          await targetMember.send({ embeds: [dmEmbed] })
        }
      } catch (dmError) {
        console.error('Could not DM user:', dmError)
      }

      await interaction.editReply({
        content: `✅ تم تنفيذ الإجراء بنجاح: ${
          action === 'approve' ? 'قبول' : action === 'reject' ? 'رفض' : 'طلب تعديل'
        }`,
      })

      // Update the original message
      await interaction.message.edit({
        components: [], // Remove buttons after action
      })
    } catch (error) {
      console.error('Error processing admin action:', error)
      await interaction.editReply({
        content: '❌ حدث خطأ أثناء تنفيذ الإجراء.',
      })
    }
  }
})

// Setup activation dashboard in channel
async function setupDashboard() {
  const channel = client.channels.cache.get(config.activationChannelId) as TextChannel
  if (!channel) {
    console.error('Activation channel not found!')
    return
  }

  // Check if dashboard message already exists
  const messages = await channel.messages.fetch({ limit: 10 })
  const dashboardMessage = messages.find(
    (m) => m.author.id === client.user?.id && m.embeds.length > 0
  )

  if (dashboardMessage) {
    // Update existing message
    await dashboardMessage.edit({
      embeds: [createDashboardEmbed()],
      components: [createStatusButton()],
    })
    console.log('📋 Dashboard message updated')
  } else {
    // Create new message
    await channel.send({
      embeds: [createDashboardEmbed()],
      components: [createStatusButton()],
    })
    console.log('📋 Dashboard message created')
  }
}

// Export functions for use in API routes
export {
  client,
  sendAdminNotification,
  updateMemberRole,
  logAction,
  setupDashboard,
}

// Start bot
async function startBot() {
  if (!config.token) {
    console.error('❌ DISCORD_BOT_TOKEN is not set!')
    return
  }

  try {
    await client.login(config.token)
    
    // Setup dashboard after bot is ready
    client.once(Events.ClientReady, async () => {
      setTimeout(setupDashboard, 2000) // Wait 2 seconds for cache
    })
  } catch (error) {
    console.error('❌ Failed to start bot:', error)
  }
}

// Run bot if this file is executed directly
startBot()
