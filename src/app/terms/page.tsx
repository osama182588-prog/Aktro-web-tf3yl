import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Scale
} from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 fade-in">
          <Badge variant="info" className="mb-4">
            <Scale className="w-4 h-4 ml-1" />
            الشروط والأحكام
          </Badge>
          <h1 className="text-4xl font-bold mb-4">شروط وأحكام التفعيل</h1>
          <p className="text-foreground/60">
            يرجى قراءة الشروط والأحكام بعناية قبل التقديم على التفعيل
          </p>
        </div>

        <div className="space-y-6">
          {/* General Rules */}
          <Card className="fade-in delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                القواعد العامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 list-disc list-inside text-foreground/80">
                <li>يجب أن يكون عمرك 16 سنة على الأقل للتقديم</li>
                <li>يجب أن يكون حسابك في Discord قديم (أكثر من 7 أيام)</li>
                <li>يجب أن تكون عضواً في سيرفر Discord الخاص بنا</li>
                <li>يُمنع استخدام حسابات بديلة أو مشاركة الحساب</li>
                <li>يجب الالتزام بجميع قوانين السيرفر</li>
              </ul>
            </CardContent>
          </Card>

          {/* What to Do */}
          <Card className="fade-in delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                المسموح
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-foreground/80">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>كتابة قصة شخصية إبداعية ومفصلة</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>الإجابة على الأسئلة بشكل صادق ومفصل</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>التواصل مع الإدارة في حال وجود استفسارات</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>إعادة التقديم بعد الرفض مع تحسين الطلب</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* What Not to Do */}
          <Card className="fade-in delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-error">
                <XCircle className="w-5 h-5" />
                الممنوع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-foreground/80">
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <span>نسخ قصص من الإنترنت أو من لاعبين آخرين</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <span>تقديم معلومات مزيفة أو مضللة</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <span>استخدام أسماء شخصيات مشهورة أو مسيئة</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <span>محاولة التحايل على النظام أو الإزعاج المتكرر</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                  <span>استخدام حسابات متعددة للتقديم</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Warnings */}
          <Card className="fade-in delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                تحذيرات هامة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-foreground/80">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <span>مخالفة الشروط قد تؤدي إلى حظر دائم من التفعيل</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <span>يحق للإدارة رفض أي طلب دون إبداء السبب</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <span>التفعيل لا يعني إعفاءك من قوانين السيرفر</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Agreement Note */}
          <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center fade-in delay-500">
            <p className="text-foreground/80">
              بالتقديم على التفعيل، فإنك توافق على جميع الشروط والأحكام المذكورة أعلاه
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
