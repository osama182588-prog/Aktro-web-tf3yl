import Card from '@/components/ui/Card';

export default function TermsPage() {
  const terms = [
    {
      title: 'القواعد العامة',
      items: [
        'يجب أن يكون عمرك 16 سنة أو أكثر للانضمام',
        'يجب احترام جميع اللاعبين والإدارة',
        'يمنع منعاً باتاً استخدام أي برامج غش أو هاكات',
        'يجب الالتزام بقوانين الرول بلاي',
        'يمنع التنمر أو التحرش بأي شكل من الأشكال',
      ],
    },
    {
      title: 'قوانين الرول بلاي',
      items: [
        'يجب البقاء في الشخصية طوال الوقت داخل السيرفر',
        'يمنع استخدام المعلومات من خارج الرول بلاي (ميتا جيمنج)',
        'يجب احترام قيمة الحياة (فير فيلو لايف)',
        'يمنع القتل العشوائي (راندوم ديث ماتش)',
        'يجب الالتزام بقوانين المنطقة الآمنة',
      ],
    },
    {
      title: 'قوانين التفعيل',
      items: [
        'يجب تقديم معلومات صحيحة وحقيقية',
        'يجب الإجابة على جميع الأسئلة بشكل كامل ومفصل',
        'في حالة الرفض، يمكنك إعادة التقديم بعد مراجعة أخطائك',
        'يحق للإدارة رفض أي طلب دون إبداء الأسباب',
        'التقديم بحسابات متعددة يؤدي للحظر الدائم',
      ],
    },
    {
      title: 'العقوبات',
      items: [
        'المخالفة الأولى: تحذير',
        'المخالفة الثانية: إيقاف مؤقت',
        'المخالفة الثالثة: حظر دائم',
        'حالات الغش تؤدي للحظر الدائم المباشر',
        'يحق للإدارة تشديد العقوبات حسب خطورة المخالفة',
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">الشروط والأحكام</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            يرجى قراءة الشروط والأحكام بعناية قبل التقديم للتفعيل
          </p>
        </div>

        {/* Terms List */}
        <div className="max-w-4xl mx-auto space-y-6">
          {terms.map((section, index) => (
            <Card key={index} className="p-6 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
              <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}

          {/* Agreement Notice */}
          <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">تنبيه مهم</h3>
                <p className="text-gray-300">
                  بتقديمك لطلب التفعيل، فإنك توافق على جميع الشروط والأحكام المذكورة أعلاه.
                  أي مخالفة لهذه الشروط قد تؤدي إلى إلغاء تفعيلك أو حظرك من السيرفر.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
