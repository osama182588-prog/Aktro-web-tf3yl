# 🎮 Secret CFW - منصة تفعيل اللاعبين

منصة تفعيل متكاملة لسيرفر FiveM تعتمد على موقع ويب وبوت ديسكورد.

## 🌟 المميزات

### الموقع
- ✅ تسجيل دخول عبر Discord
- ✅ نموذج تفعيل مع اختبار معرفة
- ✅ لوحة تحكم للعضو لمتابعة حالة الطلب
- ✅ لوحة إدارية شاملة
- ✅ إدارة بنك الأسئلة
- ✅ نظام أولوية للمراجعة
- ✅ تصميم متجاوب بهوية أزرق-رصاصي متحركة
- ✅ دعم RTL للعربية

### بوت الديسكورد
- ✅ مزامنة حالة التفعيل
- ✅ إدارة الرتب تلقائياً
- ✅ إشعارات للإدارة
- ✅ لوحة تفعيل داخل ديسكورد
- ✅ أوامر للتحقق من الحالة

### لوحة الإدارة
- ✅ إحصائيات شاملة
- ✅ مراجعة الطلبات
- ✅ قبول/رفض/طلب تعديل
- ✅ ملاحظات داخلية وعامة
- ✅ سجل النشاط الإداري
- ✅ إدارة بنك الأسئلة

## 🚀 التثبيت

### المتطلبات
- Node.js 18+
- PostgreSQL
- حساب Discord Developer

### الخطوات

1. **نسخ الملفات**
```bash
git clone <repository-url>
cd secret-cfw
```

2. **تثبيت الحزم**
```bash
npm install
```

3. **إعداد متغيرات البيئة**
```bash
cp .env.example .env
```
ثم عدّل الملف `.env` بالقيم المناسبة.

4. **إعداد قاعدة البيانات**
```bash
npm run db:push
```

5. **تشغيل التطوير**
```bash
# تشغيل الموقع
npm run dev

# تشغيل البوت (في نافذة أخرى)
npm run bot:dev
```

6. **البناء للإنتاج**
```bash
npm run build
npm run start
```

## ⚙️ الإعدادات

### متغيرات البيئة الأساسية

| المتغير | الوصف |
|---------|-------|
| `DATABASE_URL` | رابط قاعدة بيانات PostgreSQL |
| `NEXTAUTH_SECRET` | مفتاح سري لـ NextAuth |
| `DISCORD_CLIENT_ID` | معرف تطبيق Discord |
| `DISCORD_CLIENT_SECRET` | السر الخاص بتطبيق Discord |
| `DISCORD_BOT_TOKEN` | توكن البوت |
| `DISCORD_GUILD_ID` | معرف السيرفر |

### رتب Discord

| المتغير | الوصف |
|---------|-------|
| `DISCORD_HIGH_ADMIN_ROLE_ID` | رتبة الإدارة العليا |
| `DISCORD_ACTIVATION_ADMIN_ROLE_ID` | رتبة إدارة التفعيل |
| `DISCORD_GENERAL_ADMIN_ROLE_ID` | رتبة الإدارة العامة |
| `DISCORD_PRIORITY_ROLE_ID` | رتبة الأولوية |
| `DISCORD_ACTIVATED_ROLE_ID` | رتبة التفعيل |

### قنوات Discord

| المتغير | الوصف |
|---------|-------|
| `DISCORD_ACTIVATION_CHANNEL_ID` | قناة لوحة التفعيل |
| `DISCORD_ADMIN_NOTIFICATIONS_CHANNEL_ID` | قناة إشعارات الإدارة |
| `DISCORD_LOGS_CHANNEL_ID` | قناة السجلات |

## 📁 هيكل المشروع

```
secret-cfw/
├── bot/                    # بوت الديسكورد
│   └── index.ts
├── prisma/                 # قاعدة البيانات
│   └── schema.prisma
├── src/
│   ├── app/               # صفحات Next.js
│   │   ├── api/          # API Routes
│   │   ├── (admin)/      # صفحات الإدارة
│   │   ├── (auth)/       # صفحات التوثيق
│   │   └── (main)/       # الصفحات الرئيسية
│   ├── components/        # المكونات
│   ├── lib/              # المكتبات
│   ├── hooks/            # React Hooks
│   └── types/            # TypeScript Types
├── .env.example          # نموذج متغيرات البيئة
├── package.json
└── README.md
```

## 🔒 الأمان

- تسجيل الدخول عبر Discord OAuth فقط
- منع التقديم المتكرر الضار
- كشف الحسابات الجديدة جداً
- منع الإداري من مراجعة طلبه
- تسجيل جميع العمليات الإدارية

## 📝 الرخصة

هذا المشروع للاستخدام الخاص فقط.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى فتح Issue أو Pull Request.

---

صُنع بـ ❤️ لـ Secret CFW
