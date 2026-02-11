// صفحة الشروط والأحكام - Terms Page
// ==================================

import { FileText, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import Card from "@/components/ui/Card";

export default function TermsPage() {
  const sections = [
    {
      title: "الشروط العامة",
      icon: FileText,
      items: [
        "يجب أن يكون عمرك 13 سنة على الأقل للتقديم",
        "يجب أن يكون حساب Discord الخاص بك موثقًا",
        "يجب الالتزام بجميع قوانين السيرفر",
        "يمنع استخدام أي برامج غش أو هاكات",
        "يجب احترام جميع اللاعبين والإدارة",
      ],
    },
    {
      title: "شروط التفعيل",
      icon: CheckCircle,
      items: [
        "يجب ملء جميع الحقول المطلوبة بدقة",
        "يجب كتابة قصة شخصية مفصلة ومميزة",
        "يجب الإجابة على جميع الأسئلة بجدية",
        "يتم مراجعة الطلب خلال 24-72 ساعة",
        "يمكن إعادة التقديم بعد الرفض",
      ],
    },
    {
      title: "أسباب الرفض",
      icon: AlertTriangle,
      items: [
        "إجابات غير مكتملة أو عشوائية",
        "قصة شخصية قصيرة أو غير منطقية",
        "عدم الالتزام بالقوانين السابقة",
        "استخدام معلومات مزيفة",
        "سلوك سيء في السيرفرات الأخرى",
      ],
    },
    {
      title: "الخصوصية والأمان",
      icon: Shield,
      items: [
        "نحمي جميع بياناتك الشخصية",
        "لا نشارك معلوماتك مع أطراف ثالثة",
        "يمكنك طلب حذف بياناتك في أي وقت",
        "نستخدم تشفير متقدم لحماية البيانات",
        "نلتزم بمعايير الأمان العالية",
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 page-transition">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
          <FileText className="w-4 h-4" />
          يرجى قراءة الشروط بعناية
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          الشروط والأحكام
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          يرجى قراءة الشروط التالية بعناية قبل التقديم على التفعيل.
          بتقديمك على التفعيل، فإنك توافق على جميع الشروط المذكورة.
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {sections.map((section, index) => (
          <Card key={index} className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <section.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
            </div>
            <ul className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-3 text-gray-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Important Notice */}
      <Card className="max-w-5xl mx-auto mt-8 bg-yellow-500/5 border-yellow-500/20">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">تنبيه مهم</h3>
            <p className="text-gray-300">
              أي مخالفة للشروط المذكورة أعلاه قد تؤدي إلى رفض طلبك أو حظرك من السيرفر.
              نحتفظ بحق تعديل هذه الشروط في أي وقت دون إشعار مسبق.
            </p>
          </div>
        </div>
      </Card>

      {/* Last Updated */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        آخر تحديث: يناير 2024
      </div>
    </div>
  );
}
