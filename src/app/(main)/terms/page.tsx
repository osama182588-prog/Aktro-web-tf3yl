"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Scale
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground, LightLines } from "@/components/animations/ParticleBackground";

const sections = [
  {
    icon: Shield,
    title: "شروط التفعيل",
    items: [
      "يجب أن يكون عمرك 16 سنة أو أكثر",
      "يجب أن يكون لديك حساب Discord فعال",
      "يجب أن يكون حسابك في Discord قديماً (أكثر من 7 أيام)",
      "يجب الإجابة على جميع أسئلة الاختبار بشكل صحيح ومفصل",
      "يجب كتابة قصة شخصية واقعية ومفصلة"
    ]
  },
  {
    icon: Users,
    title: "قواعد السلوك",
    items: [
      "احترام جميع اللاعبين والإداريين",
      "عدم استخدام لغة مسيئة أو عنصرية",
      "عدم التحرش أو الإساءة لأي شخص",
      "الالتزام بقوانين الرول بلاي",
      "عدم استخدام برامج أو أدوات غير مشروعة"
    ]
  },
  {
    icon: AlertTriangle,
    title: "المحظورات",
    items: [
      "محظور استخدام أي نوع من الغش أو الهاكات",
      "محظور مشاركة معلومات حسابك مع الآخرين",
      "محظور انتحال شخصية إداري أو لاعب آخر",
      "محظور الإعلان عن سيرفرات أخرى",
      "محظور نشر محتوى غير لائق"
    ]
  },
  {
    icon: Scale,
    title: "العقوبات",
    items: [
      "مخالفة القوانين قد تؤدي إلى تحذير",
      "تكرار المخالفات يؤدي إلى حظر مؤقت",
      "المخالفات الجسيمة تؤدي إلى حظر دائم",
      "يحق للإدارة اتخاذ أي إجراء تراه مناسباً",
      "قرارات الإدارة نهائية وغير قابلة للنقاش"
    ]
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleBackground />
      <LightLines />
      <Header />
      
      <main className="flex-grow pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* العنوان */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="text-gradient">الشروط والأحكام</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              يرجى قراءة الشروط والأحكام التالية بعناية قبل التقديم على التفعيل. 
              بالتقديم أنت توافق على جميع هذه الشروط.
            </p>
          </motion.div>

          {/* الأقسام */}
          <div className="space-y-8">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                </div>
                
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <motion.li
                      key={itemIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* ملاحظة مهمة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/30"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">ملاحظة مهمة</h3>
                <p className="text-gray-300 text-sm">
                  تحتفظ إدارة Secret CFW بالحق في تعديل هذه الشروط في أي وقت. 
                  يتم إعلام اللاعبين بأي تغييرات جوهرية. 
                  الاستمرار في استخدام السيرفر يعني الموافقة على الشروط المحدثة.
                </p>
              </div>
            </div>
          </motion.div>

          {/* تاريخ التحديث */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-gray-500 text-sm"
          >
            آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
