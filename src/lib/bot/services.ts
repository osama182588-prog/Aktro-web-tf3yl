// Bot Services
// خدمات البوت - إرسال الإشعارات، إدارة الأدوار، السجلات
// يمكن استدعاؤها من الموقع أو البوت مباشرة

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from 'discord.js'
import { client } from './client'
import { config } from '../config'

// Status labels in Arabic
export const statusLabels: Record<string, string> = {
  NOT_ACTIVATED: '❌ غير مفعل',
  PENDING: '⏳ قيد المراجعة',
  ACTIVATED: '✅ مفعل',
  REJECTED: '❌ مرفوض',
  EDIT_REQUESTED: '📝 مطلوب تعديل',
}

// Create activation dashboard embed
export function createDashboardEmbed(): EmbedBuilder {
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

// Create status check button
export function createStatusButton(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('check_status')
        .setLabel('🔍 معرفة حالة التفعيل')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('🌐 التقديم على التفعيل')
        .setStyle(ButtonStyle.Link)
        .setURL(config.app.url)
    )
}

// Send admin notification to Discord
export async function sendAdminNotification(
  type: 'new_request' | 'approved' | 'rejected' | 'edit_requested',
  data: {
    discordId: string
    discordUsername: string
    realName?: string
    characterName?: string
    reviewedBy?: string
  }
): Promise<void> {
  if (!client.isReady()) return

  const channel = client.channels.cache.get(config.bot.channels.adminNotifications) as TextChannel
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

// Log action to Discord channel
export async function logAction(message: string): Promise<void> {
  if (!client.isReady()) return

  const channel = client.channels.cache.get(config.bot.channels.logs) as TextChannel
  if (!channel) return

  const embed = new EmbedBuilder()
    .setColor(0x6B7280)
    .setDescription(message)
    .setTimestamp()

  await channel.send({ embeds: [embed] })
}

// Update member role based on activation status
export async function updateMemberRole(discordId: string, action: 'add' | 'remove'): Promise<void> {
  if (!client.isReady()) return

  const guild = client.guilds.cache.get(config.bot.guildId)
  if (!guild) return

  try {
    const member = await guild.members.fetch(discordId)
    const role = guild.roles.cache.get(config.bot.roles.activated)

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

// Send DM to user about their request status
export async function sendUserDM(
  discordId: string,
  action: 'approve' | 'reject' | 'edit'
): Promise<void> {
  if (!client.isReady()) return

  const guild = client.guilds.cache.get(config.bot.guildId)
  if (!guild) return

  try {
    const member = await guild.members.fetch(discordId)
    if (!member) return

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

    await member.send({ embeds: [dmEmbed] })
  } catch (error) {
    console.error('Could not DM user:', error)
  }
}

// Setup activation dashboard in channel
export async function setupDashboard(): Promise<void> {
  if (!client.isReady()) return

  const channel = client.channels.cache.get(config.bot.channels.activation) as TextChannel
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
    await dashboardMessage.edit({
      embeds: [createDashboardEmbed()],
      components: [createStatusButton()],
    })
    console.log('📋 Dashboard message updated')
  } else {
    await channel.send({
      embeds: [createDashboardEmbed()],
      components: [createStatusButton()],
    })
    console.log('📋 Dashboard message created')
  }
}

// Check if bot is connected and ready
export function isBotReady(): boolean {
  return client.isReady()
}
