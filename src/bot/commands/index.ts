import { 
  Client, 
  REST, 
  Routes, 
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js'
import { getApplicationStatus, updateApplicationStatus } from '../utils/api'

// Command definitions
const commands = [
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('معرفة حالة طلب التفعيل الخاص بك')
    .toJSON(),
  
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض قائمة الأوامر المتاحة')
    .toJSON(),
]

export async function registerCommands(client: Client) {
  if (!client.user) return

  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)
  const guildId = process.env.DISCORD_GUILD_ID

  try {
    console.log('Started refreshing application (/) commands.')

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commands }
      )
    } else {
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      )
    }

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error('Error registering commands:', error)
  }

  // Handle interactions
  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction)
    } else if (interaction.isButton()) {
      await handleButton(interaction)
    }
  })
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const { commandName, user } = interaction

  switch (commandName) {
    case 'status':
      await handleStatusCommand(interaction)
      break
    case 'help':
      await handleHelpCommand(interaction)
      break
    default:
      await interaction.reply({ content: 'أمر غير معروف', ephemeral: true })
  }
}

async function handleStatusCommand(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const status = await getApplicationStatus(interaction.user.id)

    const embed = new EmbedBuilder()
      .setColor(getStatusColor(status?.status))
      .setTitle('🔍 حالة طلب التفعيل')
      .setTimestamp()

    if (!status) {
      embed.setDescription('لم تقم بالتقديم على التفعيل بعد.\n\n[قدم الآن على الموقع](' + process.env.NEXTAUTH_URL + '/activation)')
    } else {
      embed.addFields(
        { name: '📋 الحالة', value: getStatusLabel(status.status), inline: true },
        { name: '📅 تاريخ التقديم', value: formatDate(status.createdAt), inline: true },
      )

      if (status.isPriority) {
        embed.addFields({ name: '⭐ الأولوية', value: 'طلب ذو أولوية', inline: true })
      }

      if (status.adminNotes) {
        embed.addFields({ name: '📝 ملاحظات الإدارة', value: status.adminNotes })
      }

      if (status.status === 'REJECTED' || status.status === 'MODIFICATION_REQUESTED') {
        embed.addFields({ 
          name: '🔄 إعادة التقديم', 
          value: '[يمكنك إعادة التقديم من هنا](' + process.env.NEXTAUTH_URL + '/activation)' 
        })
      }
    }

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Error fetching status:', error)
    await interaction.editReply({ content: '❌ حدث خطأ أثناء جلب الحالة. يرجى المحاولة لاحقاً.' })
  }
}

async function handleHelpCommand(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x3B82F6)
    .setTitle('📚 قائمة الأوامر')
    .setDescription('إليك قائمة الأوامر المتاحة:')
    .addFields(
      { name: '/status', value: 'معرفة حالة طلب التفعيل الخاص بك' },
      { name: '/help', value: 'عرض قائمة الأوامر المتاحة' },
    )
    .setFooter({ text: 'Secret CFW Bot' })
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function handleButton(interaction: ButtonInteraction) {
  const [action, ...args] = interaction.customId.split(':')

  switch (action) {
    case 'check_status':
      await handleCheckStatusButton(interaction)
      break
    case 'approve':
    case 'reject':
    case 'modify':
      await handleAdminActionButton(interaction, action, args[0])
      break
    default:
      await interaction.reply({ content: 'إجراء غير معروف', ephemeral: true })
  }
}

async function handleCheckStatusButton(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const status = await getApplicationStatus(interaction.user.id)

    const embed = new EmbedBuilder()
      .setColor(getStatusColor(status?.status))
      .setTitle('🔍 حالة طلب التفعيل')
      .setTimestamp()

    if (!status) {
      embed.setDescription('لم تقم بالتقديم على التفعيل بعد.\n\n[قدم الآن على الموقع](' + process.env.NEXTAUTH_URL + '/activation)')
    } else {
      embed.setDescription(getStatusDescription(status.status))
      embed.addFields(
        { name: '📋 الحالة', value: getStatusLabel(status.status), inline: true },
        { name: '📅 تاريخ التقديم', value: formatDate(status.createdAt), inline: true },
      )

      if (status.adminNotes) {
        embed.addFields({ name: '📝 ملاحظات الإدارة', value: status.adminNotes })
      }
    }

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Error fetching status:', error)
    await interaction.editReply({ content: '❌ حدث خطأ أثناء جلب الحالة' })
  }
}

async function handleAdminActionButton(interaction: ButtonInteraction, action: string, applicationId: string) {
  // Check if user has admin role
  const member = interaction.member
  if (!member) {
    await interaction.reply({ content: 'خطأ في التحقق من الصلاحيات', ephemeral: true })
    return
  }

  const adminRoles = [
    process.env.DISCORD_ADMIN_HIGH_ROLE_ID,
    process.env.DISCORD_ADMIN_ACTIVATION_ROLE_ID,
    process.env.DISCORD_ADMIN_GENERAL_ROLE_ID,
  ].filter(Boolean)

  const memberRoles = Array.isArray(member.roles) 
    ? member.roles 
    : member.roles.cache.map(r => r.id)

  const hasAdminRole = adminRoles.some(roleId => memberRoles.includes(roleId as string))

  if (!hasAdminRole) {
    await interaction.reply({ content: '❌ لا تملك صلاحية لهذا الإجراء', ephemeral: true })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  try {
    const result = await updateApplicationStatus(applicationId, action, interaction.user.id)
    
    if (result.success) {
      await interaction.editReply({ content: `✅ ${result.message}` })
      
      // Update the original message
      if (interaction.message.editable) {
        const newEmbed = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(action === 'approve' ? 0x22C55E : action === 'reject' ? 0xEF4444 : 0xEAB308)
          .setFooter({ text: `تم بواسطة ${interaction.user.tag}` })
        
        await interaction.message.edit({ embeds: [newEmbed], components: [] })
      }
    } else {
      await interaction.editReply({ content: `❌ ${result.message}` })
    }
  } catch (error) {
    console.error('Error performing admin action:', error)
    await interaction.editReply({ content: '❌ حدث خطأ أثناء تنفيذ الإجراء' })
  }
}

// Helper functions
function getStatusColor(status?: string): number {
  switch (status) {
    case 'APPROVED':
      return 0x22C55E // Green
    case 'REJECTED':
      return 0xEF4444 // Red
    case 'UNDER_REVIEW':
      return 0xEAB308 // Yellow
    case 'MODIFICATION_REQUESTED':
      return 0xF97316 // Orange
    default:
      return 0x6B7280 // Gray
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'APPROVED':
      return '✅ مفعّل'
    case 'REJECTED':
      return '❌ مرفوض'
    case 'UNDER_REVIEW':
      return '⏳ قيد المراجعة'
    case 'MODIFICATION_REQUESTED':
      return '📝 طلب تعديل'
    case 'PENDING':
      return '⏸️ في الانتظار'
    default:
      return status
  }
}

function getStatusDescription(status: string): string {
  switch (status) {
    case 'APPROVED':
      return '🎉 تهانينا! تم قبول طلبك. يمكنك الآن الانضمام للسيرفر.'
    case 'REJECTED':
      return '😔 للأسف، تم رفض طلبك. يمكنك إعادة التقديم.'
    case 'UNDER_REVIEW':
      return '⏳ طلبك قيد المراجعة من قبل فريق الإدارة.'
    case 'MODIFICATION_REQUESTED':
      return '📝 يرجى تعديل طلبك وإعادة التقديم.'
    case 'PENDING':
      return '⏸️ طلبك في انتظار المراجعة.'
    default:
      return ''
  }
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Export admin notification functions
export async function sendAdminNotification(
  client: Client,
  type: 'new_application' | 'approved' | 'rejected' | 'modification',
  data: {
    userId: string
    username: string
    applicationId: string
    characterName?: string
    reviewedBy?: string
  }
) {
  const channelId = process.env.DISCORD_ADMIN_NOTIFICATIONS_CHANNEL_ID
  if (!channelId) return

  const channel = await client.channels.fetch(channelId)
  if (!channel?.isTextBased() || !('send' in channel)) return

  const embed = new EmbedBuilder()
    .setTimestamp()

  switch (type) {
    case 'new_application':
      embed
        .setColor(0x3B82F6)
        .setTitle('📋 طلب تفعيل جديد')
        .setDescription(`تم تقديم طلب تفعيل جديد من <@${data.userId}>`)
        .addFields(
          { name: '👤 اسم المستخدم', value: data.username, inline: true },
          { name: '🎭 اسم الشخصية', value: data.characterName || 'غير محدد', inline: true },
        )
      break
    case 'approved':
      embed
        .setColor(0x22C55E)
        .setTitle('✅ تم قبول طلب')
        .setDescription(`تم قبول طلب <@${data.userId}> بواسطة <@${data.reviewedBy}>`)
      break
    case 'rejected':
      embed
        .setColor(0xEF4444)
        .setTitle('❌ تم رفض طلب')
        .setDescription(`تم رفض طلب <@${data.userId}> بواسطة <@${data.reviewedBy}>`)
      break
    case 'modification':
      embed
        .setColor(0xF97316)
        .setTitle('📝 طلب تعديل')
        .setDescription(`تم طلب تعديل على طلب <@${data.userId}> بواسطة <@${data.reviewedBy}>`)
      break
  }

  // Add action buttons for new applications
  if (type === 'new_application') {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`approve:${data.applicationId}`)
          .setLabel('قبول')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`modify:${data.applicationId}`)
          .setLabel('طلب تعديل')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📝'),
        new ButtonBuilder()
          .setCustomId(`reject:${data.applicationId}`)
          .setLabel('رفض')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setLabel('عرض على الموقع')
          .setStyle(ButtonStyle.Link)
          .setURL(`${process.env.NEXTAUTH_URL}/admin/applications?id=${data.applicationId}`)
          .setEmoji('🔗'),
      )

    await channel.send({ embeds: [embed], components: [row] })
  } else {
    await channel.send({ embeds: [embed] })
  }
}
