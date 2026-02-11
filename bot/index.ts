// بوت Discord - Secret CFW
// ========================

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  ChannelType,
  TextChannel,
  GuildMember,
} from "discord.js";
import { PrismaClient } from "@prisma/client";

// إنشاء عميل Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// إنشاء عميل Prisma
const prisma = new PrismaClient();

// متغيرات البيئة
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const ADMIN_NOTIFICATIONS_CHANNEL_ID = process.env.ADMIN_NOTIFICATIONS_CHANNEL_ID;
const DASHBOARD_CHANNEL_ID = process.env.DASHBOARD_CHANNEL_ID;
const ACTIVATION_LOG_CHANNEL_ID = process.env.ACTIVATION_LOG_CHANNEL_ID;
const ACTIVATED_ROLE_ID = process.env.ACTIVATED_ROLE_ID;
const SUPER_ADMIN_ROLE_ID = process.env.SUPER_ADMIN_ROLE_ID;
const ACTIVATION_ADMIN_ROLE_ID = process.env.ACTIVATION_ADMIN_ROLE_ID;

// ألوان الحالات
const STATUS_COLORS = {
  PENDING: 0xfbbf24,     // أصفر
  REVIEWING: 0x8b5cf6,   // بنفسجي
  APPROVED: 0x22c55e,    // أخضر
  REJECTED: 0xef4444,    // أحمر
  MODIFICATION_REQUIRED: 0xf97316, // برتقالي
};

// ترجمة الحالات
const STATUS_TEXT: Record<string, string> = {
  PENDING: "⏳ قيد الانتظار",
  REVIEWING: "🔍 قيد المراجعة",
  APPROVED: "✅ مقبول",
  REJECTED: "❌ مرفوض",
  MODIFICATION_REQUIRED: "📝 يتطلب تعديل",
};

// عند بدء تشغيل البوت
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ البوت متصل بنجاح: ${readyClient.user.tag}`);
  console.log(`📊 عدد السيرفرات: ${readyClient.guilds.cache.size}`);
  
  // إعداد داشبورد التفعيل
  setupDashboard();
});

// إعداد داشبورد التفعيل في قناة مخصصة
async function setupDashboard() {
  if (!DASHBOARD_CHANNEL_ID || !GUILD_ID) return;

  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const channel = guild.channels.cache.get(DASHBOARD_CHANNEL_ID) as TextChannel;
    if (!channel || channel.type !== ChannelType.GuildText) return;

    // حذف الرسائل السابقة للبوت في القناة
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessages = messages.filter(m => m.author.id === client.user?.id);
    for (const msg of botMessages.values()) {
      await msg.delete().catch(() => {});
    }

    // إنشاء Embed الداشبورد
    const embed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle("🎮 Secret CFW - نظام التفعيل")
      .setDescription(
        "مرحباً بك في نظام التفعيل الخاص بسيرفر Secret CFW!\n\n" +
        "**للتقديم على التفعيل:**\n" +
        "1️⃣ قم بزيارة موقعنا الإلكتروني\n" +
        "2️⃣ سجل دخولك عبر Discord\n" +
        "3️⃣ أكمل نموذج التفعيل\n" +
        "4️⃣ انتظر مراجعة طلبك\n\n" +
        "**معرفة حالة طلبك:**\n" +
        "اضغط على الزر أدناه لمعرفة حالة طلبك الحالية."
      )
      .setThumbnail(guild.iconURL() || "")
      .setFooter({ text: "Secret CFW - نظام التفعيل الاحترافي" })
      .setTimestamp();

    // زر معرفة الحالة
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("check_status")
        .setLabel("معرفة حالة طلبي")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🔍")
    );

    await channel.send({ embeds: [embed], components: [row] });
    console.log("✅ تم إعداد داشبورد التفعيل");
  } catch (error) {
    console.error("❌ خطأ في إعداد الداشبورد:", error);
  }
}

// التعامل مع الأزرار
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  // زر معرفة الحالة
  if (interaction.customId === "check_status") {
    await handleCheckStatus(interaction);
    return;
  }

  // أزرار القبول/الرفض/التعديل
  if (interaction.customId.startsWith("admin_")) {
    await handleAdminAction(interaction);
    return;
  }
});

// معالجة زر معرفة الحالة
async function handleCheckStatus(interaction: import("discord.js").ButtonInteraction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user || user.applications.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(0xfbbf24)
        .setTitle("📋 حالة طلبك")
        .setDescription(
          "لم يتم العثور على طلب تفعيل خاص بك.\n\n" +
          "**للتقديم على التفعيل:**\n" +
          "قم بزيارة موقعنا الإلكتروني وأكمل نموذج التفعيل."
        )
        .setFooter({ text: "Secret CFW" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const application = user.applications[0];
    const statusColor = STATUS_COLORS[application.status as keyof typeof STATUS_COLORS] || 0x6b7280;
    const statusText = STATUS_TEXT[application.status] || application.status;

    const embed = new EmbedBuilder()
      .setColor(statusColor)
      .setTitle("📋 حالة طلبك")
      .addFields(
        { name: "الحالة", value: statusText, inline: true },
        { name: "تاريخ التقديم", value: `<t:${Math.floor(new Date(application.createdAt).getTime() / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: "Secret CFW" })
      .setTimestamp();

    // إضافة ملاحظات الإدارة إذا وجدت
    if (application.rejectionReason) {
      embed.addFields({ name: "ملاحظات الإدارة", value: application.rejectionReason });
    } else if (application.adminNotes) {
      embed.addFields({ name: "ملاحظات الإدارة", value: application.adminNotes });
    }

    // رسالة إضافية حسب الحالة
    let description = "";
    switch (application.status) {
      case "PENDING":
        description = "طلبك في قائمة الانتظار وسيتم مراجعته قريباً.";
        break;
      case "REVIEWING":
        description = "يتم حالياً مراجعة طلبك من قبل الإدارة.";
        break;
      case "APPROVED":
        description = "🎉 مبروك! تم قبول طلبك ويمكنك الآن اللعب في السيرفر.";
        break;
      case "REJECTED":
        description = "للأسف تم رفض طلبك. يمكنك إعادة التقديم بعد مراجعة الملاحظات.";
        break;
      case "MODIFICATION_REQUIRED":
        description = "يرجى مراجعة الملاحظات وإعادة التقديم بعد التعديل.";
        break;
    }
    embed.setDescription(description);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("❌ خطأ في معرفة الحالة:", error);
    await interaction.editReply({ content: "❌ حدث خطأ أثناء جلب حالة طلبك." });
  }
}

// معالجة أزرار الإدارة
async function handleAdminAction(interaction: import("discord.js").ButtonInteraction) {
  try {
    const member = interaction.member as GuildMember;
    const isAdmin = 
      member.roles.cache.has(SUPER_ADMIN_ROLE_ID || "") ||
      member.roles.cache.has(ACTIVATION_ADMIN_ROLE_ID || "");

    if (!isAdmin) {
      await interaction.reply({ content: "❌ ليس لديك صلاحية لهذا الإجراء.", ephemeral: true });
      return;
    }

    const [, action, applicationId] = interaction.customId.split("_");
    
    await interaction.deferReply({ ephemeral: true });

    // جلب الطلب
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      await interaction.editReply({ content: "❌ الطلب غير موجود." });
      return;
    }

    // التحقق من عدم مراجعة الطلب الشخصي
    if (application.user.discordId === interaction.user.id) {
      await interaction.editReply({ content: "❌ لا يمكنك مراجعة طلبك الخاص." });
      return;
    }

    // تحديد الحالة الجديدة
    let newStatus: "APPROVED" | "REJECTED" | "MODIFICATION_REQUIRED";
    switch (action) {
      case "approve":
        newStatus = "APPROVED";
        break;
      case "reject":
        newStatus = "REJECTED";
        break;
      case "modify":
        newStatus = "MODIFICATION_REQUIRED";
        break;
      default:
        await interaction.editReply({ content: "❌ إجراء غير صالح." });
        return;
    }

    // جلب المستخدم الإداري
    const adminUser = await prisma.user.findUnique({
      where: { discordId: interaction.user.id },
    });

    // تحديث الطلب
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        reviewedById: adminUser?.id,
        reviewedAt: new Date(),
      },
    });

    // تسجيل العملية
    if (adminUser) {
      await prisma.adminLog.create({
        data: {
          adminId: adminUser.id,
          action: `application_${action}`,
          targetType: "application",
          targetId: applicationId,
          details: { via: "discord" },
        },
      });
    }

    // إعطاء أو سحب الرتبة
    if (ACTIVATED_ROLE_ID && GUILD_ID) {
      try {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (guild) {
          const targetMember = await guild.members.fetch(application.user.discordId);
          if (targetMember) {
            if (newStatus === "APPROVED") {
              await targetMember.roles.add(ACTIVATED_ROLE_ID);
            } else if (newStatus === "REJECTED") {
              await targetMember.roles.remove(ACTIVATED_ROLE_ID).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error("❌ خطأ في تعديل الرتب:", err);
      }
    }

    // إرسال إشعار للعضو
    try {
      const targetUser = await client.users.fetch(application.user.discordId);
      const statusText = STATUS_TEXT[newStatus];
      
      const embed = new EmbedBuilder()
        .setColor(STATUS_COLORS[newStatus])
        .setTitle("📢 تحديث حالة طلبك")
        .setDescription(`تم تحديث حالة طلب التفعيل الخاص بك إلى: **${statusText}**`)
        .setFooter({ text: "Secret CFW" })
        .setTimestamp();

      await targetUser.send({ embeds: [embed] }).catch(() => {});
    } catch {
      // تجاهل إذا فشل الإرسال
    }

    // تحديث الرسالة الأصلية
    try {
      const originalMessage = interaction.message;
      const updatedEmbed = EmbedBuilder.from(originalMessage.embeds[0])
        .setColor(STATUS_COLORS[newStatus])
        .setFooter({ text: `${STATUS_TEXT[newStatus]} - بواسطة ${interaction.user.tag}` });

      await originalMessage.edit({ embeds: [updatedEmbed], components: [] });
    } catch {
      // تجاهل
    }

    await interaction.editReply({ content: `✅ تم تحديث الطلب بنجاح إلى: ${STATUS_TEXT[newStatus]}` });
  } catch (error) {
    console.error("❌ خطأ في معالجة الإجراء الإداري:", error);
    await interaction.editReply({ content: "❌ حدث خطأ أثناء تنفيذ الإجراء." });
  }
}

// إرسال إشعار طلب جديد للإدارة
export async function sendNewApplicationNotification(applicationId: string) {
  if (!ADMIN_NOTIFICATIONS_CHANNEL_ID || !GUILD_ID) return;

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) return;

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const channel = guild.channels.cache.get(ADMIN_NOTIFICATIONS_CHANNEL_ID) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle("📥 طلب تفعيل جديد")
      .addFields(
        { name: "الاسم الحقيقي", value: application.realName, inline: true },
        { name: "العمر", value: application.age.toString(), inline: true },
        { name: "اسم الشخصية", value: application.characterName, inline: true },
        { name: "المستخدم", value: `<@${application.user.discordId}>`, inline: true },
        { name: "الأولوية", value: application.isPriority ? "✨ نعم" : "لا", inline: true }
      )
      .setThumbnail(`https://cdn.discordapp.com/avatars/${application.user.discordId}/${application.user.avatar}.png`)
      .setFooter({ text: `ID: ${application.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`admin_approve_${application.id}`)
        .setLabel("قبول")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅"),
      new ButtonBuilder()
        .setCustomId(`admin_modify_${application.id}`)
        .setLabel("طلب تعديل")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("📝"),
      new ButtonBuilder()
        .setCustomId(`admin_reject_${application.id}`)
        .setLabel("رفض")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("❌")
    );

    await channel.send({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error("❌ خطأ في إرسال إشعار الطلب الجديد:", error);
  }
}

// تسجيل في قناة اللوق
export async function logActivationAction(
  action: string,
  applicationId: string,
  adminId?: string
) {
  if (!ACTIVATION_LOG_CHANNEL_ID || !GUILD_ID) return;

  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const channel = guild.channels.cache.get(ACTIVATION_LOG_CHANNEL_ID) as TextChannel;
    if (!channel) return;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true, reviewedBy: true },
    });

    if (!application) return;

    const actionText: Record<string, string> = {
      approved: "✅ تم قبول الطلب",
      rejected: "❌ تم رفض الطلب",
      modification: "📝 تم طلب تعديل",
      submitted: "📥 تم تقديم طلب جديد",
    };

    const embed = new EmbedBuilder()
      .setColor(
        action === "approved" ? 0x22c55e :
        action === "rejected" ? 0xef4444 :
        action === "modification" ? 0xf97316 :
        0x3b82f6
      )
      .setTitle(actionText[action] || action)
      .addFields(
        { name: "المتقدم", value: `<@${application.user.discordId}>`, inline: true },
        { name: "الاسم", value: application.realName, inline: true }
      )
      .setTimestamp();

    if (application.reviewedBy) {
      embed.addFields({ name: "بواسطة", value: application.reviewedBy.username, inline: true });
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("❌ خطأ في التسجيل:", error);
  }
}

// تشغيل البوت
export function startBot() {
  if (!BOT_TOKEN) {
    console.error("❌ لم يتم تحديد توكن البوت");
    return;
  }

  client.login(BOT_TOKEN).catch((error) => {
    console.error("❌ فشل تسجيل دخول البوت:", error);
  });
}

export { client };
