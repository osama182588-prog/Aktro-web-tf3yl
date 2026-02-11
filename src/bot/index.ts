import { 
  Client, 
  GatewayIntentBits, 
  Events,
  Collection,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  GuildMember
} from 'discord.js';
import { prisma } from '../lib/prisma';

// تعريف الـ Client مع الصلاحيات المطلوبة
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// تخزين الأوامر
const commands = new Collection<string, {
  data: { name: string; description: string };
  execute: (interaction: unknown) => Promise<void>;
}>();

// عند تشغيل البوت
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ بوت Discord جاهز! مسجل كـ ${readyClient.user.tag}`);
  
  // تسجيل الأوامر
  await registerCommands();
  
  // إرسال داشبورد التفعيل
  await sendActivationDashboard();
});

// تسجيل الأوامر
async function registerCommands() {
  const commandsData = [
    {
      name: 'status',
      description: 'عرض حالة التفعيل الخاصة بك'
    },
    {
      name: 'help',
      description: 'عرض قائمة الأوامر المتاحة'
    }
  ];

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);
    
    console.log('🔄 جاري تسجيل أوامر Slash...');
    
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.DISCORD_GUILD_ID!
      ),
      { body: commandsData }
    );
    
    console.log('✅ تم تسجيل الأوامر بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في تسجيل الأوامر:', error);
  }
}

// إرسال داشبورد التفعيل
async function sendActivationDashboard() {
  const channelId = process.env.DISCORD_ACTIVATION_DASHBOARD_CHANNEL_ID;
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId) as TextChannel;
    if (!channel) return;

    // حذف الرسائل القديمة من البوت
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(m => m.author.id === client.user?.id);
    for (const msg of botMessages.values()) {
      await msg.delete();
    }

    // إنشاء الـ Embed
    const embed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle('🛡️ نظام التفعيل - Secret CFW')
      .setDescription(`
        **مرحباً بك في نظام التفعيل!**
        
        للانضمام إلى السيرفر، يجب عليك إكمال عملية التفعيل عبر موقعنا الرسمي.
        
        📋 **خطوات التفعيل:**
        1️⃣ سجل الدخول عبر Discord
        2️⃣ أكمل المعلومات المطلوبة
        3️⃣ أجب على أسئلة الاختبار
        4️⃣ انتظر مراجعة الإدارة
        
        🌐 **رابط التفعيل:**
        ${process.env.NEXTAUTH_URL}/activation
      `)
      .setImage('https://via.placeholder.com/600x200/1e293b/3b82f6?text=Secret+CFW')
      .setFooter({ text: 'Secret CFW | نظام التفعيل' })
      .setTimestamp();

    // إنشاء الأزرار
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('check_status')
          .setLabel('معرفة حالتي')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔍'),
        new ButtonBuilder()
          .setLabel('ابدأ التفعيل')
          .setStyle(ButtonStyle.Link)
          .setURL(`${process.env.NEXTAUTH_URL}/activation`)
          .setEmoji('🚀')
      );

    await channel.send({ embeds: [embed], components: [row] });
    console.log('✅ تم إرسال داشبورد التفعيل!');
  } catch (error) {
    console.error('❌ خطأ في إرسال داشبورد التفعيل:', error);
  }
}

// معالجة التفاعلات
client.on(Events.InteractionCreate, async (interaction) => {
  // أوامر Slash
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'status') {
      await handleStatusCommand(interaction);
    } else if (interaction.commandName === 'help') {
      await handleHelpCommand(interaction);
    }
  }
  
  // الأزرار
  if (interaction.isButton()) {
    if (interaction.customId === 'check_status') {
      await handleCheckStatusButton(interaction);
    } else if (interaction.customId.startsWith('admin_')) {
      await handleAdminButton(interaction);
    }
  }
});

// أمر معرفة الحالة
async function handleStatusCommand(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id },
      include: { activationRequest: true }
    });

    if (!user) {
      await interaction.editReply({
        content: '❌ لم يتم العثور على حسابك. يرجى تسجيل الدخول عبر الموقع أولاً.'
      });
      return;
    }

    const request = user.activationRequest;
    let statusEmoji, statusText, statusColor;

    switch (request?.status) {
      case 'ACTIVATED':
        statusEmoji = '✅';
        statusText = 'مفعل';
        statusColor = 0x22c55e;
        break;
      case 'PENDING_REVIEW':
        statusEmoji = '⏳';
        statusText = 'قيد المراجعة';
        statusColor = 0xeab308;
        break;
      case 'REJECTED':
        statusEmoji = '❌';
        statusText = 'مرفوض';
        statusColor = 0xef4444;
        break;
      case 'MODIFICATION_REQUESTED':
        statusEmoji = '📝';
        statusText = 'طلب تعديل';
        statusColor = 0xf97316;
        break;
      default:
        statusEmoji = '⚪';
        statusText = 'غير مفعل';
        statusColor = 0x6b7280;
    }

    const embed = new EmbedBuilder()
      .setColor(statusColor)
      .setTitle(`${statusEmoji} حالة التفعيل`)
      .addFields(
        { name: 'الحالة', value: statusText, inline: true },
        { name: 'اسم الشخصية', value: request?.characterName || 'غير محدد', inline: true }
      );

    if (request?.publicNotes) {
      embed.addFields({ name: '📋 ملاحظات الإدارة', value: request.publicNotes });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in status command:', error);
    await interaction.editReply({
      content: '❌ حدث خطأ. يرجى المحاولة لاحقاً.'
    });
  }
}

// أمر المساعدة
async function handleHelpCommand(interaction: any) {
  const embed = new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle('📖 قائمة الأوامر')
    .setDescription('فيما يلي الأوامر المتاحة:')
    .addFields(
      { name: '/status', value: 'عرض حالة التفعيل الخاصة بك' },
      { name: '/help', value: 'عرض هذه القائمة' }
    )
    .setFooter({ text: 'Secret CFW Bot' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// زر معرفة الحالة
async function handleCheckStatusButton(interaction: any) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id },
      include: { activationRequest: true }
    });

    if (!user) {
      await interaction.editReply({
        content: '❌ لم يتم العثور على حسابك.\n\n' +
                 '🌐 يرجى تسجيل الدخول عبر الموقع أولاً:\n' +
                 `${process.env.NEXTAUTH_URL}`
      });
      return;
    }

    const request = user.activationRequest;
    let statusEmoji, statusText, statusColor;

    switch (request?.status) {
      case 'ACTIVATED':
        statusEmoji = '✅';
        statusText = 'مفعل';
        statusColor = 0x22c55e;
        break;
      case 'PENDING_REVIEW':
        statusEmoji = '⏳';
        statusText = 'قيد المراجعة';
        statusColor = 0xeab308;
        break;
      case 'REJECTED':
        statusEmoji = '❌';
        statusText = 'مرفوض';
        statusColor = 0xef4444;
        break;
      case 'MODIFICATION_REQUESTED':
        statusEmoji = '📝';
        statusText = 'طلب تعديل';
        statusColor = 0xf97316;
        break;
      default:
        statusEmoji = '⚪';
        statusText = 'غير مفعل';
        statusColor = 0x6b7280;
    }

    const embed = new EmbedBuilder()
      .setColor(statusColor)
      .setTitle(`${statusEmoji} حالة التفعيل`)
      .addFields(
        { name: 'الحالة', value: statusText, inline: true }
      );

    if (request) {
      embed.addFields(
        { name: 'اسم الشخصية', value: request.characterName, inline: true },
        { name: 'تاريخ التقديم', value: request.createdAt.toLocaleDateString('ar-SA'), inline: true }
      );

      if (request.publicNotes) {
        embed.addFields({ name: '📋 ملاحظات الإدارة', value: request.publicNotes });
      }
    } else {
      embed.setDescription('لم تقم بالتفعيل بعد. قم بزيارة الموقع لبدء التفعيل.');
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error in check status button:', error);
    await interaction.editReply({
      content: '❌ حدث خطأ. يرجى المحاولة لاحقاً.'
    });
  }
}

// أزرار الإدارة
async function handleAdminButton(interaction: any) {
  const [, action, requestId] = interaction.customId.split('_');
  
  // التحقق من صلاحية الإدارة
  const member = interaction.member as GuildMember;
  const adminRoles = [
    process.env.DISCORD_ROLE_SENIOR_ADMIN,
    process.env.DISCORD_ROLE_ACTIVATION_ADMIN
  ].filter(Boolean);

  const hasAdminRole = member.roles.cache.some(role => adminRoles.includes(role.id));
  
  if (!hasAdminRole) {
    await interaction.reply({
      content: '❌ ليس لديك صلاحية لتنفيذ هذا الإجراء.',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // جلب الطلب
    const request = await prisma.activationRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) {
      await interaction.editReply({ content: '❌ الطلب غير موجود.' });
      return;
    }

    // تحديد الحالة الجديدة
    let newStatus: string;
    let statusText: string;
    
    switch (action) {
      case 'approve':
        newStatus = 'ACTIVATED';
        statusText = 'قبول';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        statusText = 'رفض';
        break;
      case 'modify':
        newStatus = 'MODIFICATION_REQUESTED';
        statusText = 'طلب تعديل';
        break;
      default:
        await interaction.editReply({ content: '❌ إجراء غير صالح.' });
        return;
    }

    // تحديث الطلب
    await prisma.activationRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        reviewedBy: interaction.user.id,
        reviewedAt: new Date()
      }
    });

    // إدارة الرتب
    if (newStatus === 'ACTIVATED') {
      await addActivatedRole(request.user.discordId);
    }

    // تسجيل العملية
    const adminUser = await prisma.user.findUnique({
      where: { discordId: interaction.user.id }
    });

    if (adminUser) {
      await prisma.adminLog.create({
        data: {
          action: `ACTIVATION_${action.toUpperCase()}`,
          details: `${statusText} طلب تفعيل - ${request.characterName} (من Discord)`,
          adminId: adminUser.id,
          targetId: request.userId
        }
      });
    }

    await interaction.editReply({
      content: `✅ تم ${statusText} الطلب بنجاح!`
    });

    // إرسال إشعار للعضو
    await sendMemberNotification(request.user.discordId, newStatus, request.characterName);

  } catch (error) {
    console.error('Error in admin button:', error);
    await interaction.editReply({
      content: '❌ حدث خطأ. يرجى المحاولة لاحقاً.'
    });
  }
}

// إضافة رتبة المفعل
async function addActivatedRole(discordId: string) {
  const roleId = process.env.DISCORD_ROLE_ACTIVATED;
  const guildId = process.env.DISCORD_GUILD_ID;
  
  if (!roleId || !guildId) return;

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(discordId);
    await member.roles.add(roleId);
    console.log(`✅ تمت إضافة رتبة المفعل للعضو ${discordId}`);
  } catch (error) {
    console.error('Error adding activated role:', error);
  }
}

// سحب رتبة المفعل
export async function removeActivatedRole(discordId: string) {
  const roleId = process.env.DISCORD_ROLE_ACTIVATED;
  const guildId = process.env.DISCORD_GUILD_ID;
  
  if (!roleId || !guildId) return;

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(discordId);
    await member.roles.remove(roleId);
    console.log(`✅ تم سحب رتبة المفعل من العضو ${discordId}`);
  } catch (error) {
    console.error('Error removing activated role:', error);
  }
}

// إرسال إشعار للعضو
async function sendMemberNotification(discordId: string, status: string, characterName: string) {
  try {
    const user = await client.users.fetch(discordId);
    
    let embed: EmbedBuilder;
    
    switch (status) {
      case 'ACTIVATED':
        embed = new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle('🎉 تم قبول طلب التفعيل!')
          .setDescription(`مبروك! تم قبول طلب تفعيلك للشخصية **${characterName}**.\n\nيمكنك الآن الدخول للسيرفر والاستمتاع باللعب!`)
          .setFooter({ text: 'Secret CFW' })
          .setTimestamp();
        break;
      case 'REJECTED':
        embed = new EmbedBuilder()
          .setColor(0xef4444)
          .setTitle('❌ تم رفض طلب التفعيل')
          .setDescription(`للأسف، تم رفض طلب تفعيلك للشخصية **${characterName}**.\n\nيمكنك إعادة التقديم بعد مراجعة ملاحظات الإدارة.`)
          .setFooter({ text: 'Secret CFW' })
          .setTimestamp();
        break;
      case 'MODIFICATION_REQUESTED':
        embed = new EmbedBuilder()
          .setColor(0xf97316)
          .setTitle('📝 طلب تعديل')
          .setDescription(`تم طلب تعديل على طلب تفعيلك للشخصية **${characterName}**.\n\nيرجى زيارة الموقع لمراجعة ملاحظات الإدارة وتعديل طلبك.`)
          .setFooter({ text: 'Secret CFW' })
          .setTimestamp();
        break;
      default:
        return;
    }

    await user.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending member notification:', error);
  }
}

// إرسال إشعار للإدارة عند تقديم طلب جديد
export async function sendAdminNotification(request: {
  id: string;
  characterName: string;
  realName: string;
  isPriority: boolean;
  user: { discordId: string; username: string };
}) {
  const channelId = process.env.DISCORD_ADMIN_NOTIFICATION_CHANNEL_ID;
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(request.isPriority ? 0xeab308 : 0x3b82f6)
      .setTitle(`${request.isPriority ? '⭐ ' : ''}📋 طلب تفعيل جديد`)
      .addFields(
        { name: 'المستخدم', value: `${request.user.username}\n<@${request.user.discordId}>`, inline: true },
        { name: 'الاسم الحقيقي', value: request.realName, inline: true },
        { name: 'اسم الشخصية', value: request.characterName, inline: true }
      )
      .setFooter({ text: `معرف الطلب: ${request.id}` })
      .setTimestamp();

    if (request.isPriority) {
      embed.setDescription('⚡ **هذا طلب ذو أولوية!**');
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`admin_approve_${request.id}`)
          .setLabel('قبول')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`admin_reject_${request.id}`)
          .setLabel('رفض')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setCustomId(`admin_modify_${request.id}`)
          .setLabel('طلب تعديل')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📝'),
        new ButtonBuilder()
          .setLabel('فتح في الموقع')
          .setStyle(ButtonStyle.Link)
          .setURL(`${process.env.NEXTAUTH_URL}/admin/requests`)
          .setEmoji('🌐')
      );

    await channel.send({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// تشغيل البوت
export async function startBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  
  if (!token) {
    console.log('⚠️ لم يتم العثور على توكن البوت. البوت معطل.');
    return;
  }

  try {
    await client.login(token);
  } catch (error) {
    console.error('❌ خطأ في تسجيل دخول البوت:', error);
  }
}
