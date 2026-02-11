import { 
  Client, 
  REST, 
  Routes, 
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder
} from 'discord.js'
import prisma from '@/lib/prisma'

const commands = [
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('عرض حالة التفعيل الخاصة بك')
    .toJSON(),
  
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('عرض قائمة الأوامر المتاحة')
    .toJSON(),
  
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('عرض إحصائيات النظام (للإدارة فقط)')
    .toJSON()
]

export async function setupCommands(client: Client) {
  const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!)

  try {
    console.log('🔄 Registering slash commands...')

    await rest.put(
      Routes.applicationGuildCommands(
        client.user!.id,
        process.env.DISCORD_GUILD_ID!
      ),
      { body: commands }
    )

    console.log('✅ Slash commands registered')

    // Handle command interactions
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return

      switch (interaction.commandName) {
        case 'status':
          await handleStatusCommand(interaction)
          break
        case 'help':
          await handleHelpCommand(interaction)
          break
        case 'stats':
          await handleStatsCommand(interaction)
          break
      }
    })
  } catch (error) {
    console.error('Failed to register commands:', error)
  }
}

async function handleStatusCommand(interaction: CommandInteraction) {
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
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { 
          name: 'الحالة', 
          value: `${statusEmoji[user.activationStatus]} ${statusText[user.activationStatus]}`, 
          inline: true 
        }
      )
      .setFooter({ text: 'Secret CFW - نظام التفعيل' })
      .setTimestamp()

    if (request?.characterName) {
      embed.addFields({ name: 'اسم الشخصية', value: request.characterName, inline: true })
    }

    if (request?.submittedAt) {
      embed.addFields({
        name: 'تاريخ التقديم',
        value: new Date(request.submittedAt).toLocaleDateString('ar-SA'),
        inline: true
      })
    }

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Failed to get status:', error)
    await interaction.editReply({
      content: '❌ حدث خطأ أثناء جلب حالة التفعيل'
    })
  }
}

async function handleHelpCommand(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle('📖 الأوامر المتاحة')
    .addFields(
      { name: '/status', value: 'عرض حالة التفعيل الخاصة بك' },
      { name: '/help', value: 'عرض قائمة الأوامر المتاحة' },
      { name: '/stats', value: 'عرض إحصائيات النظام (للإدارة فقط)' }
    )
    .setFooter({ text: 'Secret CFW Bot' })
    .setTimestamp()

  await interaction.reply({ embeds: [embed], ephemeral: true })
}

async function handleStatsCommand(interaction: CommandInteraction) {
  // Check if user is admin
  const adminRoleIds = [
    process.env.DISCORD_HIGH_ADMIN_ROLE_ID,
    process.env.DISCORD_ACTIVATION_ADMIN_ROLE_ID,
    process.env.DISCORD_GENERAL_ADMIN_ROLE_ID
  ].filter(Boolean)

  const member = interaction.member as { roles: { cache: { some: (fn: (role: { id: string }) => boolean) => boolean } } }
  const hasAdminRole = member?.roles?.cache?.some(
    (role: { id: string }) => adminRoleIds.includes(role.id)
  )

  if (!hasAdminRole) {
    await interaction.reply({
      content: '❌ هذا الأمر متاح للإدارة فقط',
      ephemeral: true
    })
    return
  }

  await interaction.deferReply({ ephemeral: true })

  try {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.activationRequest.count(),
      prisma.activationRequest.count({ where: { status: 'PENDING' } }),
      prisma.activationRequest.count({ where: { status: 'ACTIVATED' } }),
      prisma.activationRequest.count({ where: { status: 'REJECTED' } })
    ])

    const embed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle('📊 إحصائيات النظام')
      .addFields(
        { name: '📝 إجمالي الطلبات', value: total.toString(), inline: true },
        { name: '🟡 قيد المراجعة', value: pending.toString(), inline: true },
        { name: '🟢 مقبولة', value: approved.toString(), inline: true },
        { name: '🔴 مرفوضة', value: rejected.toString(), inline: true },
        { 
          name: '📈 نسبة القبول', 
          value: `${total > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0}%`, 
          inline: true 
        }
      )
      .setFooter({ text: 'Secret CFW - لوحة التحكم' })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  } catch (error) {
    console.error('Failed to get stats:', error)
    await interaction.editReply({
      content: '❌ حدث خطأ أثناء جلب الإحصائيات'
    })
  }
}
