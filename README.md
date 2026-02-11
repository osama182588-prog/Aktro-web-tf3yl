# 🔹 Secret CFW - منصة التفعيل

نظام احترافي لإدارة تفعيل اللاعبين لسيرفر FiveM يعتمد على موقع ويب متكامل وبوت ديسكورد وقاعدة بيانات ونظام صلاحيات مرتبط برتب ديسكورد.

## 🎯 المميزات

### الموقع
- ✅ تصميم عصري متحرك بالكامل (أزرق-رصاصي)
- ✅ دعم كامل للغة العربية و RTL
- ✅ تسجيل دخول عبر Discord
- ✅ نظام تفعيل متكامل مع اختبار
- ✅ لوحة تحكم للأعضاء
- ✅ لوحة تحكم إدارية شاملة
- ✅ بنك أسئلة قابل للإدارة
- ✅ نظام صلاحيات متعدد المستويات
- ✅ إحصائيات وسجلات النشاط

### بوت Discord
- ✅ مزامنة حالة التفعيل مع الموقع
- ✅ إعطاء وسحب الرتب تلقائياً
- ✅ إشعارات للأعضاء والإدارة
- ✅ داشبورد تفاعلي في روم مخصص
- ✅ أوامر للاستعلام عن الحالة

### الأمان
- ✅ منع التقديم المتكرر
- ✅ كشف الحسابات البديلة (Alt)
- ✅ منع الإداري من مراجعة طلبه
- ✅ تسجيل جميع العمليات

## 🛠 التقنيات المستخدمة

- **Frontend**: Next.js 16 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Next.js API Routes
- **Auth**: NextAuth.js (Discord OAuth)
- **Database**: PostgreSQL + Prisma
- **Bot**: discord.js v14

## 📦 التثبيت

### المتطلبات
- Node.js 18+
- PostgreSQL
- حساب Discord Developer

### الخطوات

1. **استنساخ المشروع**
```bash
git clone https://github.com/your-repo/secret-cfw.git
cd secret-cfw
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إعداد قاعدة البيانات**
```bash
# نسخ ملف البيئة
cp .env.example .env

# تعديل .env بالقيم الصحيحة

# تطبيق Schema
npm run db:push
```

4. **إعداد Discord OAuth**
- انتقل إلى [Discord Developer Portal](https://discord.com/developers/applications)
- أنشئ تطبيق جديد
- انسخ Client ID و Client Secret
- أضف Redirect URI: `http://localhost:3000/api/auth/callback/discord`

5. **إعداد Discord Bot**
- في نفس التطبيق، أنشئ Bot
- انسخ Bot Token
- فعّل الـ Intents المطلوبة:
  - GUILD_MEMBERS
  - GUILD_MESSAGES
  - MESSAGE_CONTENT

6. **تشغيل المشروع**
```bash
# تشغيل الموقع والبوت معاً
npm run dev:all

# أو كل واحد منفصل
npm run dev    # الموقع
npm run bot    # البوت
```

## 🔧 إعداد البيئة

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/secret_cfw"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Discord OAuth
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"

# Discord Bot
DISCORD_BOT_TOKEN="your-bot-token"
DISCORD_GUILD_ID="your-server-id"

# Role IDs
DISCORD_SUPER_ADMIN_ROLE_ID="role-id"
DISCORD_ACTIVATION_ADMIN_ROLE_ID="role-id"
DISCORD_GENERAL_ADMIN_ROLE_ID="role-id"
DISCORD_PRIORITY_ROLE_ID="role-id"
DISCORD_ACTIVATED_ROLE_ID="role-id"

# Channel IDs
DISCORD_ACTIVATION_CHANNEL_ID="channel-id"
DISCORD_ADMIN_NOTIFICATIONS_CHANNEL_ID="channel-id"
DISCORD_LOGS_CHANNEL_ID="channel-id"
```

## 📁 هيكل المشروع

```
├── bot/                    # بوت Discord
│   ├── index.js           # ملف البوت الرئيسي
│   └── package.json
├── prisma/
│   └── schema.prisma      # مخطط قاعدة البيانات
├── src/
│   ├── app/               # صفحات Next.js
│   │   ├── admin/         # لوحة التحكم الإدارية
│   │   ├── api/           # API Routes
│   │   ├── activation/    # صفحة التفعيل
│   │   ├── dashboard/     # لوحة العضو
│   │   └── terms/         # الشروط والأحكام
│   ├── components/        # مكونات React
│   │   ├── layout/        # Header, Footer
│   │   └── ui/            # Button, Card, Input
│   ├── lib/               # مكتبات مساعدة
│   └── types/             # TypeScript Types
└── public/                # ملفات ثابتة
```

## 👥 نظام الصلاحيات

| الرتبة | الصلاحيات |
|--------|----------|
| إدارة عليا | كل شيء |
| إدارة التفعيل | مراجعة الطلبات، قبول/رفض |
| إدارة عامة | بنك الأسئلة، بعض الإعدادات |
| عضو | التقديم، عرض الحالة |

## 📝 الترخيص

MIT License

## 🤝 المساهمة

نرحب بالمساهمات! يرجى فتح Issue أو Pull Request.
