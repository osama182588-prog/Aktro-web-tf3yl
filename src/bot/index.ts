import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, GuildMember, ButtonInteraction } from 'discord.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

// Environment variables
const GUILD_ID = process.env.DISCORD_GUILD_ID!
const ROLE_ACTIVATED = process.env.DISCORD_ROLE_ACTIVATED!
const ROLE_SUPER_ADMIN = process.env.DISCORD_ROLE_SUPER_ADMIN!
const ROLE_ACTIVATION_ADMIN = process.env.DISCORD_ROLE_ACTIVATION_ADMIN!
const CHANNEL_ADMIN_NOTIFICATIONS = process.env.DISCORD_CHANNEL_ADMIN_NOTIFICATIONS!
const CHANNEL_LOGS = process.env.DISCORD_CHANNEL_LOGS!
const CHANNEL_DASHBOARD = process.env.DISCORD_CHANNEL_ACTIVATION_DASHBOARD!

// Bot ready event
client.once('ready', async () => {
  console.log(`🤖 Bot logged in as ${client.user?.tag}`)
  
  // Setup dashboard message
  await setupDashboard()
})

// Setup the activation dashboard in the designated channel
async function setupDashboard() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID)
    const channel = await guild.channels.fetch(CHANNEL_DASHBOARD) as TextChannel
    
    if (!channel) {
      console.error('Dashboard channel not found')
      return
    }

    // Check if dashboard message already exists
    const messages = await channel.messages.fetch({ limit: 10 })
    const existingDashboard = messages.find(m => m.author.id === client.user?.id)
    
    const embed = new EmbedBuilder()
      .setColor(0x3B82F6)
      .setTitle('🎮 Secret CFW - نظام التفعيل')
      .setDescription(`
مرحباً بك في نظام التفعيل الخاص بـ Secret CFW!

**📋 للتفعيل:**
1. قم بزيارة موقعنا
2. سجل دخولك بحساب Discord
3. املأ نموذج التفعيل
4. انتظر مراجعة الإدارة

**🔍 لمعرفة حالة طلبك:**
اضغط على الزر أدناه
      `)
      .setThumbnail(guild.iconURL() || '')
      .setFooter({ text: 'Secret CFW - نظام التفعيل' })
      .setTimestamp()

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('check_status')
          .setLabel('معرفة حالة طلبي')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔍'),
        new ButtonBuilder()
          .setLabel('تقديم طلب جديد')
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.NEXTAUTH_URL || 'http://localhost:3000')
      )

    if (existingDashboard) {
      await existingDashboard.edit({ embeds: [embed], components: [row] })
    } else {
      await channel.send({ embeds: [embed], components: [row] })
    }

    console.log('✅ Dashboard setup complete')
  } catch (error) {
    console.error('Error setting up dashboard:', error)
  }
}

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return

  if (interaction.customId === 'check_status') {
    await handleCheckStatus(interaction)
  } else if (interaction.customId.startsWith('admin_')) {
    await handleAdminAction(interaction)
  }
})

// Handle check status button
async function handleCheckStatus(interaction: ButtonInteraction) {
  await interaction.deferReply({ ephemeral: true })

  try {
    const user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id },
      include: {
        applications: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user || user.applications.length === 0) {
      await interaction.editReply({
        content: '❌ لم يتم العثور على طلب تفعيل. يرجى تقديم طلب جديد من الموقع.',
      })
      return
    }

    const app = user.applications[0]
    const statusEmojis: Record<string, string> = {
      'NOT_SUBMITTED': '⚪',
      'PENDING': '🟡',
      'APPROVED': '🟢',
      'REJECTED': '🔴',
      'MODIFICATION': '🟠',
    }
    const statusTexts: Record<string, string> = {
      'NOT_SUBMITTED': 'غير مقدم',
      'PENDING': 'قيد المراجعة',
      'APPROVED': 'مفعل ✅',
      'REJECTED': 'مرفوض',
      'MODIFICATION': 'طلب تعديل',
    }

    const embed = new EmbedBuilder()
      .setColor(app.status === 'APPROVED' ? 0x22C55E : app.status === 'REJECTED' ? 0xEF4444 : 0xEAB308)
      .setTitle('📋 حالة طلب التفعيل')
      .addFields(
        { name: 'الحالة', value: `${statusEmojis[app.status]} ${statusTexts[app.status]}`, inline: true },
        { name: 'تاريخ التقديم', value: new Date(app.createdAt).toLocaleDateString('ar-SA'), inline: true },
        { name: 'آخر تحديث', value: new Date(app.updatedAt).toLocaleDateString('ar-SA'), inline: true }
      )
      .setFooter({ text: 'Secret CFW' })
      .setTimestamp()

    if (app.publicNotes) {
      embed.addFields({ name: 'ملاحظات الإدارة', value: app.publicNotes })
    }

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Error checking status:', error)
    await interaction.editReply({
      content: '❌ حدث خطأ أثناء جلب حالة الطلب. يرجى المحاولة مرة أخرى.',
    })
  }
}

// Handle admin actions from buttons
async function handleAdminAction(interaction: ButtonInteraction) {
  // Check if user has admin role
  const member = interaction.member as GuildMember
  const isAdmin = member.roles.cache.has(ROLE_SUPER_ADMIN) || 
                  member.roles.cache.has(ROLE_ACTIVATION_ADMIN)

  if (!isAdmin) {
    await interaction.reply({ content: '❌ ليس لديك صلاحية لهذا الإجراء', ephemeral: true })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  const [, action, appId] = interaction.customId.split('_')

  try {
    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: { user: true }
    })

    if (!application) {
      await interaction.editReply({ content: '❌ الطلب غير موجود' })
      return
    }

    let newStatus: 'APPROVED' | 'REJECTED' | 'MODIFICATION'
    switch (action) {
      case 'approve':
        newStatus = 'APPROVED'
        break
      case 'reject':
        newStatus = 'REJECTED'
        break
      case 'modify':
        newStatus = 'MODIFICATION'
        break
      default:
        await interaction.editReply({ content: '❌ إجراء غير معروف' })
        return
    }

    // Update application
    await prisma.application.update({
      where: { id: appId },
      data: {
        status: newStatus,
        reviewedBy: interaction.user.id,
        reviewedAt: new Date(),
      }
    })

    // Update Discord roles
    if (newStatus === 'APPROVED') {
      await grantActivatedRole(application.user.discordId)
    } else if (newStatus === 'REJECTED') {
      await revokeActivatedRole(application.user.discordId)
    }

    // Send notification to user
    await sendUserNotification(application.user.discordId, newStatus)

    // Log action
    await logAction(interaction.user.id, `${action}_application`, appId)

    await interaction.editReply({ 
      content: `✅ تم ${action === 'approve' ? 'قبول' : action === 'reject' ? 'رفض' : 'طلب تعديل'} الطلب بنجاح` 
    })

    // Update the original message
    const message = interaction.message
    const embed = EmbedBuilder.from(message.embeds[0])
      .setColor(newStatus === 'APPROVED' ? 0x22C55E : newStatus === 'REJECTED' ? 0xEF4444 : 0xEAB308)
      .setFooter({ text: `تمت المراجعة بواسطة ${interaction.user.tag}` })

    await message.edit({ embeds: [embed], components: [] })

  } catch (error) {
    console.error('Error handling admin action:', error)
    await interaction.editReply({ content: '❌ حدث خطأ أثناء معالجة الطلب' })
  }
}

// Grant activated role to user
async function grantActivatedRole(discordId: string) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID)
    const member = await guild.members.fetch(discordId)
    await member.roles.add(ROLE_ACTIVATED)
    console.log(`✅ Granted activated role to ${member.user.tag}`)
  } catch (error) {
    console.error('Error granting role:', error)
  }
}

// Revoke activated role from user
async function revokeActivatedRole(discordId: string) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID)
    const member = await guild.members.fetch(discordId)
    if (member.roles.cache.has(ROLE_ACTIVATED)) {
      await member.roles.remove(ROLE_ACTIVATED)
      console.log(`✅ Revoked activated role from ${member.user.tag}`)
    }
  } catch (error) {
    console.error('Error revoking role:', error)
  }
}

// Send notification to user
async function sendUserNotification(discordId: string, status: string) {
  try {
    const user = await client.users.fetch(discordId)
    
    const statusMessages: Record<string, string> = {
      'APPROVED': '🎉 تهانينا! تم قبول طلب التفعيل الخاص بك في Secret CFW!',
      'REJECTED': '❌ نأسف، تم رفض طلب التفعيل الخاص بك. يمكنك إعادة التقديم من الموقع.',
      'MODIFICATION': '📝 طُلب منك تعديل طلب التفعيل. يرجى زيارة الموقع وإعادة التقديم.',
    }

    const embed = new EmbedBuilder()
      .setColor(status === 'APPROVED' ? 0x22C55E : status === 'REJECTED' ? 0xEF4444 : 0xEAB308)
      .setTitle('📋 تحديث حالة طلب التفعيل')
      .setDescription(statusMessages[status] || 'تم تحديث حالة طلبك')
      .setFooter({ text: 'Secret CFW' })
      .setTimestamp()

    await user.send({ embeds: [embed] })
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

// Log admin action
async function logAction(adminId: string, action: string, targetId: string) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID)
    const channel = await guild.channels.fetch(CHANNEL_LOGS) as TextChannel
    
    if (!channel) return

    const embed = new EmbedBuilder()
      .setColor(0x3B82F6)
      .setTitle('📝 سجل العمليات')
      .addFields(
        { name: 'الإداري', value: `<@${adminId}>`, inline: true },
        { name: 'الإجراء', value: action, inline: true },
        { name: 'معرف الهدف', value: targetId, inline: true }
      )
      .setTimestamp()

    await channel.send({ embeds: [embed] })
  } catch (error) {
    console.error('Error logging action:', error)
  }
}

// Send admin notification for new application
interface ApplicationData {
  id: string
  realName: string
  age: number
  characterName: string
  priority: boolean
}

interface UserData {
  discordId: string
  avatar: string | null
}

export async function sendNewApplicationNotification(application: ApplicationData, user: UserData) {
  try {
    const guild = await client.guilds.fetch(GUILD_ID)
    const channel = await guild.channels.fetch(CHANNEL_ADMIN_NOTIFICATIONS) as TextChannel
    
    if (!channel) return

    const embed = new EmbedBuilder()
      .setColor(0x3B82F6)
      .setTitle('📥 طلب تفعيل جديد')
      .setThumbnail(`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`)
      .addFields(
        { name: 'الاسم', value: application.realName, inline: true },
        { name: 'العمر', value: `${application.age} سنة`, inline: true },
        { name: 'الشخصية', value: application.characterName, inline: true },
        { name: 'Discord', value: `<@${user.discordId}>`, inline: true },
        { name: 'أولوية', value: application.priority ? '⭐ نعم' : 'لا', inline: true }
      )
      .setFooter({ text: `معرف الطلب: ${application.id}` })
      .setTimestamp()

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`admin_approve_${application.id}`)
          .setLabel('قبول')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`admin_reject_${application.id}`)
          .setLabel('رفض')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setCustomId(`admin_modify_${application.id}`)
          .setLabel('طلب تعديل')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📝')
      )

    await channel.send({ embeds: [embed], components: [row] })
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}

// Sync user roles with database
export async function syncUserRoles(discordId: string): Promise<string[]> {
  try {
    const guild = await client.guilds.fetch(GUILD_ID)
    const member = await guild.members.fetch(discordId)
    return member.roles.cache.map(r => r.id)
  } catch (error) {
    console.error('Error syncing roles:', error)
    return []
  }
}

// Start the bot
export async function startBot() {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN not found')
    return
  }

  try {
    await client.login(token)
  } catch (error) {
    console.error('❌ Failed to start bot:', error)
  }
}

export default client
