require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

// Express server for API endpoints
const app = express();
app.use(express.json());

const PORT = process.env.BOT_PORT || 3001;

// Bot configuration
const config = {
  guildId: process.env.DISCORD_GUILD_ID,
  activationChannelId: process.env.DISCORD_ACTIVATION_CHANNEL_ID,
  adminNotificationsChannelId: process.env.DISCORD_ADMIN_NOTIFICATIONS_CHANNEL_ID,
  logsChannelId: process.env.DISCORD_LOGS_CHANNEL_ID,
  activatedRoleId: process.env.DISCORD_ACTIVATED_ROLE_ID,
  superAdminRoleId: process.env.DISCORD_SUPER_ADMIN_ROLE_ID,
  activationAdminRoleId: process.env.DISCORD_ACTIVATION_ADMIN_ROLE_ID,
};

// Bot ready event
client.once('ready', async () => {
  console.log(`🤖 Bot logged in as ${client.user.tag}`);
  
  // Register slash commands
  await registerCommands();
  
  // Setup activation dashboard
  await setupActivationDashboard();
});

// Register slash commands
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('status')
      .setDescription('معرفة حالة طلب التفعيل الخاص بك'),
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('عرض المساعدة'),
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.guildId),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Setup activation dashboard message
async function setupActivationDashboard() {
  if (!config.activationChannelId) return;

  try {
    const channel = await client.channels.fetch(config.activationChannelId);
    if (!channel) return;

    // Check if dashboard message exists
    const messages = await channel.messages.fetch({ limit: 10 });
    const existingDashboard = messages.find(m => 
      m.author.id === client.user.id && 
      m.embeds.length > 0 && 
      m.embeds[0].title?.includes('نظام التفعيل')
    );

    if (!existingDashboard) {
      const embed = new EmbedBuilder()
        .setTitle('🎮 نظام التفعيل - Secret CFW')
        .setDescription(`
مرحباً بك في نظام التفعيل!

للانضمام إلى السيرفر، يجب عليك التقديم للتفعيل عبر موقعنا.

**خطوات التفعيل:**
1️⃣ اقرأ الشروط والأحكام بعناية
2️⃣ سجل دخول عبر Discord
3️⃣ أكمل نموذج التقديم
4️⃣ انتظر مراجعة الإدارة

**رابط التفعيل:**
${process.env.NEXTAUTH_URL}/activation

اضغط على الزر أدناه لمعرفة حالة طلبك.
        `)
        .setColor(0x3b82f6)
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: 'Secret CFW - نظام التفعيل' })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('check_status')
            .setLabel('معرفة حالة طلبي')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📋'),
          new ButtonBuilder()
            .setLabel('التقديم للتفعيل')
            .setStyle(ButtonStyle.Link)
            .setURL(`${process.env.NEXTAUTH_URL}/activation`)
            .setEmoji('🚀')
        );

      await channel.send({ embeds: [embed], components: [row] });
      console.log('✅ Activation dashboard created');
    }
  } catch (error) {
    console.error('Error setting up dashboard:', error);
  }
}

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'status') {
      await handleStatusCommand(interaction);
    } else if (interaction.commandName === 'help') {
      await handleHelpCommand(interaction);
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'check_status') {
      await handleStatusButton(interaction);
    } else if (interaction.customId.startsWith('admin_')) {
      await handleAdminButton(interaction);
    }
  }
});

// Handle status command
async function handleStatusCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/bot/status?discordId=${interaction.user.id}`);
    const data = await response.json();

    if (!data.application) {
      const embed = new EmbedBuilder()
        .setTitle('📋 حالة التفعيل')
        .setDescription('لم تقدم طلب تفعيل بعد.\n\nقم بالتقديم عبر الموقع للانضمام!')
        .setColor(0x6b7280)
        .setFooter({ text: 'Secret CFW' });

      return interaction.editReply({ embeds: [embed] });
    }

    const statusColors = {
      PENDING: 0xf59e0b,
      APPROVED: 0x22c55e,
      REJECTED: 0xef4444,
      MODIFICATION_REQUESTED: 0xf97316,
    };

    const statusTexts = {
      PENDING: '⏳ قيد المراجعة',
      APPROVED: '✅ مفعل',
      REJECTED: '❌ مرفوض',
      MODIFICATION_REQUESTED: '📝 يتطلب تعديل',
    };

    const embed = new EmbedBuilder()
      .setTitle('📋 حالة التفعيل')
      .setColor(statusColors[data.application.status] || 0x3b82f6)
      .addFields(
        { name: 'الحالة', value: statusTexts[data.application.status] || 'غير معروف', inline: true },
        { name: 'اسم الشخصية', value: data.application.characterName, inline: true },
        { name: 'تاريخ التقديم', value: new Date(data.application.createdAt).toLocaleDateString('ar-SA'), inline: true }
      )
      .setFooter({ text: 'Secret CFW' })
      .setTimestamp();

    if (data.application.adminNotes || data.application.rejectionReason) {
      embed.addFields({
        name: 'ملاحظات الإدارة',
        value: data.application.adminNotes || data.application.rejectionReason,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error fetching status:', error);
    await interaction.editReply({ content: 'حدث خطأ. يرجى المحاولة لاحقاً.' });
  }
}

// Handle status button
async function handleStatusButton(interaction) {
  await handleStatusCommand(interaction);
}

// Handle help command
async function handleHelpCommand(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📚 المساعدة')
    .setDescription('مرحباً بك في Secret CFW!')
    .addFields(
      { name: '/status', value: 'معرفة حالة طلب التفعيل', inline: true },
      { name: '/help', value: 'عرض هذه الرسالة', inline: true },
    )
    .setColor(0x3b82f6)
    .setFooter({ text: 'Secret CFW' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Handle admin buttons
async function handleAdminButton(interaction) {
  // Check if user has admin role
  const member = interaction.member;
  const hasAdminRole = member.roles.cache.has(config.superAdminRoleId) ||
                       member.roles.cache.has(config.activationAdminRoleId);

  if (!hasAdminRole) {
    return interaction.reply({ content: '❌ ليس لديك صلاحية لهذا الإجراء.', ephemeral: true });
  }

  const [, action, applicationId] = interaction.customId.split('_');
  
  await interaction.deferReply({ ephemeral: true });

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/bot/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId,
        action,
        adminDiscordId: interaction.user.id,
      }),
    });

    if (response.ok) {
      await interaction.editReply({ content: '✅ تم تنفيذ الإجراء بنجاح!' });
      
      // Update the message to show it's been reviewed
      const originalEmbed = interaction.message.embeds[0];
      const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setColor(action === 'approve' ? 0x22c55e : action === 'reject' ? 0xef4444 : 0xf97316)
        .addFields({ name: 'تمت المراجعة بواسطة', value: `<@${interaction.user.id}>`, inline: true });

      await interaction.message.edit({ embeds: [updatedEmbed], components: [] });
    } else {
      const data = await response.json();
      await interaction.editReply({ content: `❌ ${data.error || 'حدث خطأ'}` });
    }
  } catch (error) {
    console.error('Error handling admin action:', error);
    await interaction.editReply({ content: '❌ حدث خطأ. يرجى المحاولة لاحقاً.' });
  }
}

// API Endpoints for website integration

// Sync roles
app.post('/api/roles', async (req, res) => {
  const { discordId, action, roleId } = req.body;

  try {
    const guild = await client.guilds.fetch(config.guildId);
    const member = await guild.members.fetch(discordId);

    if (action === 'add') {
      await member.roles.add(roleId);
    } else if (action === 'remove') {
      await member.roles.remove(roleId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error syncing roles:', error);
    res.status(500).json({ error: 'Failed to sync roles' });
  }
});

// Send notification
app.post('/api/notify', async (req, res) => {
  const { discordId, message, type } = req.body;

  try {
    const user = await client.users.fetch(discordId);
    
    const colors = {
      approval: 0x22c55e,
      rejection: 0xef4444,
      modification: 0xf97316,
      info: 0x3b82f6,
    };

    const embed = new EmbedBuilder()
      .setTitle('📬 إشعار من Secret CFW')
      .setDescription(message)
      .setColor(colors[type] || 0x3b82f6)
      .setTimestamp();

    await user.send({ embeds: [embed] });
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send admin alert
app.post('/api/admin-alert', async (req, res) => {
  const { applicationId, type } = req.body;

  try {
    if (!config.adminNotificationsChannelId) {
      return res.status(400).json({ error: 'Admin channel not configured' });
    }

    const channel = await client.channels.fetch(config.adminNotificationsChannelId);
    
    // Fetch application data
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/bot/application?id=${applicationId}`);
    const { application } = await response.json();

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const typeConfig = {
      new: { title: '📥 طلب تفعيل جديد', color: 0x3b82f6 },
      approved: { title: '✅ تم قبول طلب', color: 0x22c55e },
      rejected: { title: '❌ تم رفض طلب', color: 0xef4444 },
      modification: { title: '📝 طلب تعديل', color: 0xf97316 },
    };

    const config_type = typeConfig[type] || typeConfig.new;

    const embed = new EmbedBuilder()
      .setTitle(config_type.title)
      .setColor(config_type.color)
      .addFields(
        { name: 'اسم الشخصية', value: application.characterName, inline: true },
        { name: 'المستخدم', value: `<@${application.user.discordId}>`, inline: true },
        { name: application.isPriority ? '⭐ أولوية' : 'عادي', value: '\u200B', inline: true },
      )
      .setTimestamp();

    const components = [];

    if (type === 'new') {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`admin_approve_${applicationId}`)
            .setLabel('قبول')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId(`admin_reject_${applicationId}`)
            .setLabel('رفض')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌'),
          new ButtonBuilder()
            .setCustomId(`admin_modification_${applicationId}`)
            .setLabel('طلب تعديل')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📝'),
          new ButtonBuilder()
            .setLabel('عرض التفاصيل')
            .setStyle(ButtonStyle.Link)
            .setURL(`${process.env.NEXTAUTH_URL}/admin/applications?id=${applicationId}`)
            .setEmoji('🔗')
        );
      components.push(row);
    }

    await channel.send({ embeds: [embed], components });
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending admin alert:', error);
    res.status(500).json({ error: 'Failed to send admin alert' });
  }
});

// Log action
app.post('/api/log', async (req, res) => {
  const { action, userId, details } = req.body;

  try {
    if (!config.logsChannelId) {
      return res.json({ success: true });
    }

    const channel = await client.channels.fetch(config.logsChannelId);
    
    const embed = new EmbedBuilder()
      .setTitle('📝 سجل النظام')
      .setDescription(`**الإجراء:** ${action}\n**التفاصيل:** ${details}`)
      .setColor(0x6b7280)
      .setTimestamp();

    if (userId) {
      embed.addFields({ name: 'المستخدم', value: `<@${userId}>`, inline: true });
    }

    await channel.send({ embeds: [embed] });
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging:', error);
    res.status(500).json({ error: 'Failed to log' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: client.isReady() });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🌐 API server running on port ${PORT}`);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);
