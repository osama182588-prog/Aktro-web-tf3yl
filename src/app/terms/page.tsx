"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft,
  Shield,
  Users,
  Clock
} from "lucide-react"

export default function TermsPage() {
  const sections = [
    {
      icon: Shield,
      title: "الشروط العامة",
      items: [
        "يجب أن يكون عمرك 16 سنة أو أكثر للتقديم",
        "يجب أن يكون حساب Discord الخاص بك بعمر 7 أيام على الأقل",
        "يجب أن تكون عضواً في سيرفر Discord الخاص بنا",
        "يجب قراءة وفهم جميع القوانين قبل التقديم",
        "التقديم يعني موافقتك على جميع الشروط والأحكام",
      ],
    },
    {
      icon: Users,
      title: "شروط اللعب",
      items: [
        "الالتزام بقوانين اللعب (RP) في جميع الأوقات",
        "احترام جميع اللاعبين والإدارة",
        "عدم استخدام أي برامج أو أدوات خارجية",
        "عدم استغلال أي ثغرات في النظام",
        "الحفاظ على جودة تجربة اللعب للجميع",
      ],
    },
    {
      icon: Clock,
      title: "قواعد التفعيل",
      items: [
        "يجب ملء جميع الحقول بمعلومات صحيحة",
        "كتابة قصة شخصية واقعية ومناسبة",
        "الإجابة على جميع الأسئلة بشكل كامل",
        "عدم التقديم بحسابات متعددة",
        "في حال الرفض يمكنك إعادة التقديم بعد تعديل طلبك",
      ],
    },
  ]

  const forbidden = [
    "استخدام أي نوع من الغش أو الهاكات",
    "التحرش أو الإساءة لأي لاعب",
    "نشر محتوى غير لائق أو مخالف",
    "محاولة التلاعب بالنظام أو الأدمنية",
    "مشاركة معلومات حسابك مع الآخرين",
    "انتحال شخصية الإدارة أو اللاعبين",
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-6">
          <FileText className="w-4 h-4" />
          الشروط والأحكام
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
          شروط وأحكام الاستخدام
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          يرجى قراءة هذه الشروط بعناية قبل التقديم للتفعيل
        </p>
      </div>

      {/* Main Sections */}
      <div className="space-y-6 mb-12">
        {sections.map((section, index) => (
          <Card key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-blue-400" />
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forbidden Section */}
      <Card className="mb-12 border-red-500/30 fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-red-400">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            ممنوعات صارمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {forbidden.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="mb-12 border-yellow-500/30 bg-yellow-500/5 fade-in">
        <CardContent className="flex items-start gap-4 py-6">
          <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              تحذير هام
            </h3>
            <p className="text-gray-300 leading-relaxed">
              مخالفة أي من الشروط أعلاه قد تؤدي إلى رفض طلبك أو إلغاء تفعيلك بشكل دائم.
              الإدارة تحتفظ بالحق في اتخاذ القرار المناسب في جميع الحالات.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center fade-in">
        <p className="text-gray-400 mb-6">
          بالضغط على زر التقديم أدناه، فإنك توافق على جميع الشروط والأحكام
        </p>
        <Link href="/activation">
          <Button size="lg" className="gap-2">
            قرأت ووافقت - انتقل للتفعيل
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
