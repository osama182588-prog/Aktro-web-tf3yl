"use client"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"

export default function TermsPage() {
  const terms = [
    {
      title: "1. القواعد العامة",
      content: [
        "يجب احترام جميع اللاعبين والإداريين في السيرفر.",
        "يمنع استخدام أي نوع من أنواع الغش أو الهاكات.",
        "يجب الالتزام بقوانين الرول بلاي في جميع الأوقات.",
        "يمنع التحدث بأمور خارج الشخصية أثناء اللعب (OOC).",
        "يجب احترام قرارات الإدارة وعدم الجدال معها في السيرفر.",
      ],
    },
    {
      title: "2. قوانين الرول بلاي",
      content: [
        "يجب تمثيل شخصيتك بشكل واقعي ومنطقي.",
        "يمنع القتل العشوائي (RDM) أو التدخل العشوائي (VDM).",
        "يجب تقديم فرصة للطرف الآخر للتفاعل قبل أي مواجهة.",
        "يمنع الخروج من السيرفر أثناء الرول بلاي للهروب من الموقف.",
        "يجب الالتزام بقواعد FearRP و PowerGaming.",
      ],
    },
    {
      title: "3. قوانين التفعيل",
      content: [
        "يجب تقديم معلومات صحيحة ودقيقة عند التقديم.",
        "يجب أن يكون عمرك 18 سنة على الأقل.",
        "يجب قراءة وفهم جميع القوانين قبل التقديم.",
        "يحق للإدارة رفض أي طلب دون إبداء السبب.",
        "في حالة الرفض، يمكنك إعادة التقديم بعد تحسين طلبك.",
      ],
    },
    {
      title: "4. العقوبات",
      content: [
        "مخالفة القوانين البسيطة: تحذير شفهي.",
        "تكرار المخالفات: تحذير رسمي أو إيقاف مؤقت.",
        "المخالفات الجسيمة: إيقاف دائم من السيرفر.",
        "الغش أو الهاك: حظر دائم فوري.",
        "التهديد أو التحرش: حظر دائم.",
      ],
    },
    {
      title: "5. حقوق اللاعبين",
      content: [
        "الحق في تجربة لعب ممتعة وآمنة.",
        "الحق في الإبلاغ عن المخالفات.",
        "الحق في الاستئناف على القرارات الإدارية.",
        "الحق في الخصوصية وحماية البيانات الشخصية.",
        "الحق في المشاركة في فعاليات السيرفر.",
      ],
    },
    {
      title: "6. مسؤوليات اللاعبين",
      content: [
        "الحفاظ على بيئة إيجابية في السيرفر.",
        "الإبلاغ عن أي مخالفات أو مشاكل تقنية.",
        "مساعدة اللاعبين الجدد.",
        "الالتزام بتحديثات القوانين.",
        "احترام وقت الآخرين وتجربتهم.",
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              الشروط والأحكام
            </h1>
            <p className="text-gray-400">
              يرجى قراءة وفهم جميع الشروط والأحكام قبل التقديم للتفعيل
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-6">
            {terms.map((section, index) => (
              <div key={index} className="glass-card p-6 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <h2 className="text-xl font-bold text-blue-400 mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-gray-300">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Agreement Notice */}
          <div className="glass-card p-6 mt-8 border-blue-500/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">ملاحظة هامة</h3>
                <p className="text-gray-400 text-sm">
                  بتقديمك لطلب التفعيل، فإنك توافق على جميع الشروط والأحكام المذكورة أعلاه.
                  مخالفة أي من هذه القوانين قد يؤدي إلى إلغاء التفعيل أو الحظر من السيرفر.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/activation" className="btn-glow text-lg py-4 px-8 inline-block">
              قرأت وأوافق على الشروط - ابدأ التفعيل
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
