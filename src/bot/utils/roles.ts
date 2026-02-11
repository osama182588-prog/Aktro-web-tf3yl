import { Client, GuildMember, TextChannel } from 'discord.js'

const ACTIVATED_ROLE_ID = process.env.DISCORD_ACTIVATED_ROLE_ID || ''

export async function syncUserRole(
  client: Client,
  discordId: string,
  action: 'add' | 'remove'
): Promise<boolean> {
  try {
    const guildId = process.env.DISCORD_GUILD_ID
    if (!guildId || !ACTIVATED_ROLE_ID) return false

    const guild = await client.guilds.fetch(guildId)
    if (!guild) return false

    const member = await guild.members.fetch(discordId).catch(() => null)
    if (!member) return false

    if (action === 'add') {
      await member.roles.add(ACTIVATED_ROLE_ID)
      console.log(`✅ Added activation role to ${member.user.tag}`)
    } else {
      await member.roles.remove(ACTIVATED_ROLE_ID)
      console.log(`✅ Removed activation role from ${member.user.tag}`)
    }

    return true
  } catch (error) {
    console.error('Error syncing user role:', error)
    return false
  }
}

export async function sendDirectMessage(
  client: Client,
  discordId: string,
  message: { title: string; description: string; color: number }
): Promise<boolean> {
  try {
    const user = await client.users.fetch(discordId).catch(() => null)
    if (!user) return false

    await user.send({
      embeds: [{
        color: message.color,
        title: message.title,
        description: message.description,
        footer: { text: 'Secret CFW Bot' },
        timestamp: new Date().toISOString(),
      }],
    })

    console.log(`✅ Sent DM to ${user.tag}`)
    return true
  } catch (error) {
    console.error('Error sending DM:', error)
    return false
  }
}

export async function logAction(
  client: Client,
  action: {
    type: string
    adminId?: string
    targetId?: string
    details: string
  }
): Promise<void> {
  try {
    const channelId = process.env.DISCORD_LOGS_CHANNEL_ID
    if (!channelId) return

    const channel = await client.channels.fetch(channelId)
    if (!channel || !channel.isTextBased()) return

    const textChannel = channel as TextChannel

    const colorMap: Record<string, number> = {
      APPLICATION_APPROVED: 0x22C55E,
      APPLICATION_REJECTED: 0xEF4444,
      APPLICATION_MODIFICATION_REQUESTED: 0xF97316,
      QUESTION_CREATED: 0x3B82F6,
      QUESTION_UPDATED: 0x8B5CF6,
      QUESTION_DELETED: 0xEF4444,
      SETTINGS_UPDATED: 0x6B7280,
    }

    await textChannel.send({
      embeds: [{
        color: colorMap[action.type] || 0x6B7280,
        title: `📋 ${getActionTitle(action.type)}`,
        description: action.details,
        fields: [
          ...(action.adminId ? [{ name: 'الإداري', value: `<@${action.adminId}>`, inline: true }] : []),
          ...(action.targetId ? [{ name: 'المستهدف', value: `<@${action.targetId}>`, inline: true }] : []),
        ],
        timestamp: new Date().toISOString(),
      }],
    })
  } catch (error) {
    console.error('Error logging action:', error)
  }
}

function getActionTitle(type: string): string {
  const titles: Record<string, string> = {
    APPLICATION_APPROVED: 'قبول طلب تفعيل',
    APPLICATION_REJECTED: 'رفض طلب تفعيل',
    APPLICATION_MODIFICATION_REQUESTED: 'طلب تعديل',
    QUESTION_CREATED: 'إضافة سؤال',
    QUESTION_UPDATED: 'تعديل سؤال',
    QUESTION_DELETED: 'حذف سؤال',
    SETTINGS_UPDATED: 'تحديث الإعدادات',
    MAINTENANCE_TOGGLED: 'تبديل وضع الصيانة',
    ROLE_SYNCED: 'مزامنة الرتب',
    BACKUP_CREATED: 'إنشاء نسخة احتياطية',
  }
  return titles[type] || type
}

export async function checkMemberExists(client: Client, discordId: string): Promise<boolean> {
  try {
    const guildId = process.env.DISCORD_GUILD_ID
    if (!guildId) return false

    const guild = await client.guilds.fetch(guildId)
    if (!guild) return false

    const member = await guild.members.fetch(discordId).catch(() => null)
    return !!member
  } catch (error) {
    return false
  }
}

export async function getMemberRoles(client: Client, discordId: string): Promise<string[]> {
  try {
    const guildId = process.env.DISCORD_GUILD_ID
    if (!guildId) return []

    const guild = await client.guilds.fetch(guildId)
    if (!guild) return []

    const member = await guild.members.fetch(discordId).catch(() => null)
    if (!member) return []

    return member.roles.cache.map(r => r.id)
  } catch (error) {
    return []
  }
}
