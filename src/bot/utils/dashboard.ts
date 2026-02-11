import { 
  Client, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  TextChannel,
} from 'discord.js'

const DASHBOARD_MESSAGE_ID_KEY = 'dashboard_message_id'

export async function setupDashboard(client: Client, channelId: string) {
  try {
    const channel = await client.channels.fetch(channelId)
    
    if (!channel || !channel.isTextBased()) {
      console.error('Dashboard channel not found or not a text channel')
      return
    }

    const textChannel = channel as TextChannel

    // Create the dashboard embed
    const embed = new EmbedBuilder()
      .setColor(0x3B82F6)
      .setTitle('🎮 Secret CFW - نظام التفعيل')
      .setDescription(
        '**مرحباً بك في نظام التفعيل!**\n\n' +
        'للانضمام إلى السيرفر، يجب عليك إكمال عملية التفعيل.\n\n' +
        '**📋 خطوات التفعيل:**\n' +
        '1️⃣ اقرأ الشروط والأحكام\n' +
        '2️⃣ قدم طلب التفعيل على الموقع\n' +
        '3️⃣ أكمل الاختبار\n' +
        '4️⃣ انتظر مراجعة الإدارة\n\n' +
        '**🔗 روابط مفيدة:**\n' +
        `• [الموقع الرسمي](${process.env.NEXTAUTH_URL})\n` +
        `• [التقديم على التفعيل](${process.env.NEXTAUTH_URL}/activation)\n` +
        `• [الشروط والأحكام](${process.env.NEXTAUTH_URL}/terms)\n`
      )
      .setImage('https://i.imgur.com/placeholder.png') // Replace with actual server image
      .setThumbnail('https://i.imgur.com/placeholder.png') // Replace with actual logo
      .setFooter({ text: 'Secret CFW | نظام التفعيل الاحترافي' })
      .setTimestamp()

    // Create buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('check_status')
          .setLabel('معرفة حالة طلبي')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔍'),
        new ButtonBuilder()
          .setLabel('تقديم طلب التفعيل')
          .setStyle(ButtonStyle.Link)
          .setURL(`${process.env.NEXTAUTH_URL}/activation`)
          .setEmoji('📝'),
        new ButtonBuilder()
          .setLabel('الشروط والأحكام')
          .setStyle(ButtonStyle.Link)
          .setURL(`${process.env.NEXTAUTH_URL}/terms`)
          .setEmoji('📋'),
      )

    // Try to find existing dashboard message
    try {
      const messages = await textChannel.messages.fetch({ limit: 10 })
      const existingMessage = messages.find(
        (m) => m.author.id === client.user?.id && m.embeds.length > 0
      )

      if (existingMessage) {
        // Update existing message
        await existingMessage.edit({ embeds: [embed], components: [row] })
        console.log('✅ Dashboard message updated')
      } else {
        // Send new message
        await textChannel.send({ embeds: [embed], components: [row] })
        console.log('✅ Dashboard message created')
      }
    } catch (error) {
      // Send new message if can't find existing
      await textChannel.send({ embeds: [embed], components: [row] })
      console.log('✅ Dashboard message created')
    }
  } catch (error) {
    console.error('Error setting up dashboard:', error)
  }
}

export async function updateDashboardStats(client: Client, channelId: string, stats: {
  totalPlayers: number
  activatedToday: number
  pendingApplications: number
}) {
  // Optional: Update dashboard with live stats
  try {
    const channel = await client.channels.fetch(channelId)
    if (!channel || !channel.isTextBased()) return

    const textChannel = channel as TextChannel
    const messages = await textChannel.messages.fetch({ limit: 10 })
    const dashboardMessage = messages.find(
      (m) => m.author.id === client.user?.id && m.embeds.length > 0
    )

    if (dashboardMessage && dashboardMessage.editable) {
      const embed = EmbedBuilder.from(dashboardMessage.embeds[0])
        .setFields(
          { name: '👥 إجمالي اللاعبين المفعّلين', value: stats.totalPlayers.toString(), inline: true },
          { name: '✅ مفعّلين اليوم', value: stats.activatedToday.toString(), inline: true },
          { name: '⏳ طلبات منتظرة', value: stats.pendingApplications.toString(), inline: true },
        )

      await dashboardMessage.edit({ embeds: [embed] })
    }
  } catch (error) {
    console.error('Error updating dashboard stats:', error)
  }
}
