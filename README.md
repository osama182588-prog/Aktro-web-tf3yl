# Secret CFW - منصة التفعيل الاحترافية

<div dir="rtl" align="right">

## 🎯 نظرة عامة

Secret CFW هي منصة احترافية لإدارة تفعيل اللاعبين لسيرفر FiveM. تتكون من موقع ويب متكامل وبوت ديسكورد مرتبطين بقاعدة بيانات موحدة.

## ✨ المميزات

- 🔐 تسجيل الدخول عبر Discord
- 📝 نظام تفعيل متكامل مع اختبارات
- 👥 لوحة تحكم إدارية متقدمة
- 🤖 بوت ديسكورد للإشعارات والإدارة
- 🎨 تصميم احترافي متحرك
- 📱 متوافق مع جميع الأجهزة
- 🌐 دعم كامل للغة العربية

## 🛠️ التقنيات المستخدمة

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 مع Discord OAuth
- **Bot**: discord.js
- **Animations**: Framer Motion

## 📦 التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/your-repo/secret-cfw.git
cd secret-cfw

# تثبيت التبعيات
npm install

# إعداد قاعدة البيانات
cp .env.example .env
# قم بتعديل المتغيرات في .env

# توليد Prisma Client
npx prisma generate

# تشغيل قاعدة البيانات
npx prisma db push

# تشغيل التطوير
npm run dev
```

## ⚙️ المتغيرات البيئية

انظر ملف `.env.example` للحصول على قائمة كاملة بالمتغيرات المطلوبة.

## 🚀 النشر

```bash
# بناء المشروع
npm run build

# تشغيل الإنتاج
npm start
```

## 📁 هيكل المشروع

```
src/
├── app/                 # صفحات Next.js
│   ├── (main)/         # الصفحات العامة
│   ├── admin/          # لوحة التحكم
│   └── api/            # API Routes
├── components/         # مكونات React
│   ├── ui/             # مكونات واجهة المستخدم
│   ├── layout/         # مكونات التخطيط
│   └── animations/     # مكونات الحركة
├── lib/                # المكتبات والأدوات
├── bot/                # بوت الديسكورد
├── types/              # أنواع TypeScript
└── styles/             # الأنماط
```

## 📄 الترخيص

هذا المشروع خاص بـ Secret CFW.

</div>
