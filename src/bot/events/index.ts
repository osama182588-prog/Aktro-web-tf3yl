import { 
  Client, 
  Events, 
  GuildMember, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  TextChannel,
  Interaction
} from 'discord.js'
import prisma from '@/lib/prisma'

export function setupEvents(client: Client) {
  // Ready event
  client.on(Events.ClientReady, async (c) => {
    console.log(`✅ Bot ready! Logged in as ${c.user.tag}`)
    
    // Setup dashboard message
    await setupDashboardMessage(c)
  })

  // Member join - sync roles
  client.on(Events.GuildMemberAdd, async (member) => {
    await syncMemberRoles(member)
  })

  // Member update - sync roles when roles change
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
      await syncMemberRoles(newMember)
    }
  })

  // Button interactions
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return

    if (interaction.customId === 'check_status') {
      await handleStatusCheck(interaction)
    } else if (interaction.customId.startsWith('admin_')) {
      await handleAdminAction(interaction)
    }
  })
}

async function setupDashboardMessage(client: Client) {
  const channelId = process.env.DISCORD_DASHBOARD_CHANNEL_ID
  if (!channelId) return

  try {
    const channel = await client.channels.fetch(channelId) as TextChannel
    if (!channel) return

    const embed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle('🎮 Secret CFW - نظام التفعيل')
      .setDescription([
        '**مرحباً بك في نظام التفعيل!**',
        '',
        '🔹 للتفعيل، قم بزيارة موقعنا وأكمل نموذج التفعيل',
        '🔹 سيتم مراجعة طلبك من قبل فريق الإدارة',
        '🔹 ستحصل على رتبة التفعيل عند القبول',
        '',
        '📌 **روابط مهمة:**',
        `🌐 [الموقع الرسمي](${process.env.NEXTAUTH_URL || 'http://localhost:3000'})`,
        '',
        '⬇️ اضغط على الزر أدناه لمعرفة حالة طلبك'
      ].join('\n'))
      .setThumbnail(client.user?.displayAvatarURL() || '')
      .setFooter({ text: 'Secret CFW - نظام التفعيل' })
      .setTimestamp()

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('check_status')
          .setLabel('معرفة حالة التفعيل')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔍')
      )

    // Check if there's already a dashboard message
    const messages = await channel.messages.fetch({ limit: 10 })
    const existingMessage = messages.find(m => 
      m.author.id === client.user?.id && 
      m.embeds[0]?.title?.includes('نظام التفعيل')
    )

    if (existingMessage) {
      await existingMessage.edit({ embeds: [embed], components: [row] })
    } else {
      await channel.send({ embeds: [embed], components: [row] })
    }

    console.log('✅ Dashboard message setup complete')
  } catch (error) {
    console.error('Failed to setup dashboard message:', error)
  }
}

async function handleStatusCheck(interaction: Interaction) {
  if (!interaction.isButton()) return

  await interaction.deferReply({ ephemeral: true })

  try {
    const user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id },
      include: {
        activationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      await interaction.editReply({
        content: '❌ لم يتم العثور على حسابك. يرجى تسجيل الدخول من الموقع أولاً.'
      })
      return
    }

    const request = user.activationRequests[0]
    
    const statusEmoji = {
      NOT_ACTIVATED: '⚪',
      PENDING: '🟡',
      ACTIVATED: '🟢',
      REJECTED: '🔴'
    }

    const statusText = {
      NOT_ACTIVATED: 'غير مفعل',
      PENDING: 'قيد المراجعة',
      ACTIVATED: 'مفعل ✓',
      REJECTED: 'مرفوض'
    }

    const embed = new EmbedBuilder()
      .setColor(user.activationStatus === 'ACTIVATED' ? 0x10b981 : 
                user.activationStatus === 'PENDING' ? 0xf59e0b : 
                user.activationStatus === 'REJECTED' ? 0xef4444 : 0x6b7280)
      .setTitle('📊 حالة التفعيل')
      .addFields(
        { 
          name: 'الحالة', 
          value: `${statusEmoji[user.activationStatus]} ${statusText[user.activationStatus]}`, 
          inline: true 
        },
        { 
          name: 'اسم الشخصية', 
          value: request?.characterName || 'لا يوجد', 
          inline: true 
        }
      )
      .setFooter({ text: `Discord ID: ${interaction.user.id}` })
      .setTimestamp()

    if (request?.submittedAt) {
      embed.addFields({
        name: 'تاريخ التقديم',
        value: new Date(request.submittedAt).toLocaleDateString('ar-SA'),
        inline: true
      })
    }

    if (request?.adminNotes) {
      embed.addFields({
        name: 'ملاحظات الإدارة',
        value: request.adminNotes,
        inline: false
      })
    }

    if (request?.rejectionReason) {
      embed.addFields({
        name: 'سبب الرفض',
        value: request.rejectionReason,
        inline: false
      })
    }

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Failed to check status:', error)
    await interaction.editReply({
      content: '❌ حدث خطأ أثناء جلب حالة التفعيل'
    })
  }
}

async function handleAdminAction(interaction: Interaction) {
  if (!interaction.isButton()) return

  const [, action, requestId] = interaction.customId.split('_')
  
  // Check if user has admin role
  const member = interaction.member as GuildMember
  const adminRoleIds = [
    process.env.DISCORD_HIGH_ADMIN_ROLE_ID,
    process.env.DISCORD_ACTIVATION_ADMIN_ROLE_ID
  ].filter(Boolean)

  const hasAdminRole = member.roles.cache.some(role => adminRoleIds.includes(role.id))
  
  if (!hasAdminRole) {
    await interaction.reply({
      content: '❌ ليس لديك صلاحية لإجراء هذا الإجراء',
      ephemeral: true
    })
    return
  }

  // Handle action...
  await interaction.deferReply({ ephemeral: true })
  await interaction.editReply({
    content: `تم تنفيذ الإجراء: ${action} للطلب ${requestId}`
  })
}

async function syncMemberRoles(member: GuildMember) {
  try {
    const user = await prisma.user.findUnique({
      where: { discordId: member.id }
    })

    if (!user) return

    const roleIds = {
      highAdmin: process.env.DISCORD_HIGH_ADMIN_ROLE_ID,
      activationAdmin: process.env.DISCORD_ACTIVATION_ADMIN_ROLE_ID,
      generalAdmin: process.env.DISCORD_GENERAL_ADMIN_ROLE_ID,
      priority: process.env.DISCORD_PRIORITY_ROLE_ID
    }

    const updateData: Record<string, boolean> = {
      isHighAdmin: roleIds.highAdmin ? member.roles.cache.has(roleIds.highAdmin) : false,
      isActivationAdmin: roleIds.activationAdmin ? member.roles.cache.has(roleIds.activationAdmin) : false,
      isGeneralAdmin: roleIds.generalAdmin ? member.roles.cache.has(roleIds.generalAdmin) : false,
      hasPriority: roleIds.priority ? member.roles.cache.has(roleIds.priority) : false
    }

    await prisma.user.update({
      where: { discordId: member.id },
      data: updateData
    })

    console.log(`✅ Synced roles for ${member.user.tag}`)
  } catch (error) {
    console.error('Failed to sync member roles:', error)
  }
}

export async function notifyAdminChannel(
  client: Client,
  type: 'new_request' | 'approved' | 'rejected' | 'modification',
  data: {
    userId: string
    username: string
    characterName: string
    requestId: string
    adminNote?: string
  }
) {
  const channelId = process.env.DISCORD_ADMIN_NOTIFICATIONS_CHANNEL_ID
  if (!channelId) return

  try {
    const channel = await client.channels.fetch(channelId) as TextChannel
    if (!channel) return

    const colors = {
      new_request: 0x3b82f6,
      approved: 0x10b981,
      rejected: 0xef4444,
      modification: 0xf59e0b
    }

    const titles = {
      new_request: '📝 طلب تفعيل جديد',
      approved: '✅ تم قبول طلب',
      rejected: '❌ تم رفض طلب',
      modification: '✏️ طلب تعديل'
    }

    const embed = new EmbedBuilder()
      .setColor(colors[type])
      .setTitle(titles[type])
      .addFields(
        { name: 'المستخدم', value: `<@${data.userId}>`, inline: true },
        { name: 'اسم الشخصية', value: data.characterName, inline: true }
      )
      .setTimestamp()

    if (data.adminNote) {
      embed.addFields({ name: 'ملاحظة', value: data.adminNote })
    }

    if (type === 'new_request') {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`admin_approve_${data.requestId}`)
            .setLabel('قبول')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId(`admin_reject_${data.requestId}`)
            .setLabel('رفض')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌'),
          new ButtonBuilder()
            .setCustomId(`admin_modify_${data.requestId}`)
            .setLabel('طلب تعديل')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('✏️')
        )

      await channel.send({ embeds: [embed], components: [row] })
    } else {
      await channel.send({ embeds: [embed] })
    }
  } catch (error) {
    console.error('Failed to notify admin channel:', error)
  }
}

export async function giveActivatedRole(client: Client, discordId: string) {
  const guildId = process.env.DISCORD_GUILD_ID
  const roleId = process.env.DISCORD_ACTIVATED_ROLE_ID
  
  if (!guildId || !roleId) return

  try {
    const guild = await client.guilds.fetch(guildId)
    const member = await guild.members.fetch(discordId)
    await member.roles.add(roleId)
    console.log(`✅ Added activated role to ${member.user.tag}`)
  } catch (error) {
    console.error('Failed to give activated role:', error)
  }
}

export async function removeActivatedRole(client: Client, discordId: string) {
  const guildId = process.env.DISCORD_GUILD_ID
  const roleId = process.env.DISCORD_ACTIVATED_ROLE_ID
  
  if (!guildId || !roleId) return

  try {
    const guild = await client.guilds.fetch(guildId)
    const member = await guild.members.fetch(discordId)
    await member.roles.remove(roleId)
    console.log(`✅ Removed activated role from ${member.user.tag}`)
  } catch (error) {
    console.error('Failed to remove activated role:', error)
  }
}
