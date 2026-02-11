# 🎮 Secret CFW - منصة تفعيل اللاعبين

<div dir="rtl">

منصة احترافية لإدارة تفعيل اللاعبين لسيرفر FiveM مع بوت Discord متكامل.

## 🌟 الميزات الرئيسية

### 🔐 نظام التفعيل
- نموذج تفعيل متكامل مع أسئلة اختبار
- حالات متعددة للطلبات (قيد المراجعة، مفعل، مرفوض، طلب تعديل)
- نظام أولوية للأعضاء المميزين
- إمكانية إعادة التقديم بعد الرفض

### �� نظام الإدارة
- **إدارة عليا**: صلاحيات كاملة للنظام
- **إدارة التفعيل**: مراجعة الطلبات واتخاذ القرارات
- **إدارة عامة**: إدارة بنك الأسئلة والإعدادات

### 🎯 لوحة التحكم الإدارية
- إحصائيات شاملة (طلبات اليوم، نسبة القبول، إلخ)
- نظام فلترة وبحث متقدم
- ملاحظات داخلية وعامة
- تقييم جودة الطلبات
- سجل نشاط إداري

### 🤖 بوت Discord
- مزامنة تلقائية مع الموقع
- إضافة/سحب الرتب تلقائياً
- إشعارات للأعضاء والإدارة
- لوحة تحكم تفاعلية داخل Discord
- أزرار مراجعة سريعة للإدارة

### 🛡️ نظام الأمان
- كشف الحسابات البديلة
- التحقق من عمر حساب Discord
- منع الإداري من مراجعة طلبه
- تسجيل جميع العمليات الإدارية
- وضع صيانة للتفعيل

### 🎨 التصميم
- هوية بصرية أزرق-رصاصي متحركة
- دعم RTL كامل للغة العربية
- متوافق مع الجوال والكمبيوتر
- تأثيرات وحركات ناعمة
- دعم تقليل الحركة

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- PostgreSQL
- حساب Discord Developer

### التثبيت

```bash
# استنساخ المستودع
git clone <repository-url>
cd secret-cfw

# تثبيت الحزم
npm install

# إعداد قاعدة البيانات
npx prisma migrate dev

# تشغيل المشروع
npm run dev
```

### إعداد Discord

1. أنشئ تطبيق جديد على [Discord Developer Portal](https://discord.com/developers/applications)
2. أضف Bot للتطبيق
3. فعّل OAuth2 وأضف Redirect URI: `http://localhost:3000/api/auth/callback/discord`
4. انسخ Client ID و Client Secret و Bot Token

### متغيرات البيئة

انسخ `.env.example` إلى `.env` وعدّل القيم:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/secretcfw"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Discord OAuth
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"

# Discord Bot
DISCORD_BOT_TOKEN="your-bot-token"
DISCORD_GUILD_ID="your-server-id"

# Discord Roles
DISCORD_ROLE_SUPER_ADMIN="role-id"
DISCORD_ROLE_ACTIVATION_ADMIN="role-id"
DISCORD_ROLE_GENERAL_ADMIN="role-id"
DISCORD_ROLE_PRIORITY="role-id"
DISCORD_ROLE_ACTIVATED="role-id"

# Discord Channels
DISCORD_CHANNEL_ADMIN_NOTIFICATIONS="channel-id"
DISCORD_CHANNEL_LOGS="channel-id"
DISCORD_CHANNEL_ACTIVATION_DASHBOARD="channel-id"
```

## 📁 هيكل المشروع

```
src/
├── app/                    # صفحات Next.js
│   ├── api/               # نقاط API
│   ├── admin/             # لوحة التحكم الإدارية
│   ├── activation/        # صفحة التفعيل
│   ├── dashboard/         # لوحة العضو
│   └── terms/             # الشروط والأحكام
├── components/            # المكونات
│   ├── ui/               # مكونات واجهة المستخدم
│   ├── layout/           # مكونات التخطيط
│   └── forms/            # نماذج الإدخال
├── lib/                   # المكتبات والأدوات
├── bot/                   # بوت Discord
└── types/                 # أنواع TypeScript
```

## �� التقنيات المستخدمة

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js with Discord OAuth
- **Bot**: discord.js
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📝 الرخصة

MIT License

</div>
