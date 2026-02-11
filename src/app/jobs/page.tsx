import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  Clock, 
  MapPin,
  Users,
  Star,
  ExternalLink
} from "lucide-react"

const jobs = [
  {
    id: 1,
    title: "مساعد إداري",
    department: "الإدارة العامة",
    type: "دوام كامل",
    requirements: [
      "خبرة في إدارة السيرفرات",
      "مهارات تواصل ممتازة",
      "تواجد يومي 4 ساعات على الأقل"
    ],
    isOpen: true
  },
  {
    id: 2,
    title: "مشرف تفعيل",
    department: "قسم التفعيل",
    type: "دوام جزئي",
    requirements: [
      "معرفة بقوانين الرول بلاي",
      "القدرة على تقييم الطلبات",
      "خبرة سابقة مفضلة"
    ],
    isOpen: true
  },
  {
    id: 3,
    title: "مطور",
    department: "التطوير",
    type: "عقد",
    requirements: [
      "خبرة في Lua و FiveM",
      "معرفة بـ JavaScript/TypeScript",
      "القدرة على حل المشاكل"
    ],
    isOpen: false
  }
]

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 fade-in">
          <Badge variant="info" className="mb-4">
            <Briefcase className="w-4 h-4 ml-1" />
            الوظائف
          </Badge>
          <h1 className="text-4xl font-bold mb-4">انضم لفريقنا</h1>
          <p className="text-foreground/60">
            نبحث عن أشخاص متميزين للانضمام إلى فريق Secret CFW
          </p>
        </div>

        <div className="space-y-6">
          {jobs.map((job, index) => (
            <Card 
              key={job.id} 
              className={`fade-in ${!job.isOpen ? "opacity-60" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {job.title}
                      {job.isOpen ? (
                        <Badge variant="success">متاح</Badge>
                      ) : (
                        <Badge variant="default">مغلق</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-medium mb-2">المتطلبات:</h4>
                <ul className="space-y-2 mb-4">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-foreground/70">
                      <Star className="w-4 h-4 text-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
                
                {job.isOpen && (
                  <Button className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    تقديم طلب
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 fade-in delay-400">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-bold mb-2">لا تجد ما يناسبك؟</h3>
            <p className="text-foreground/60 mb-4">
              تواصل معنا عبر Discord وأخبرنا كيف يمكنك المساهمة
            </p>
            <Button variant="outline" className="gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              انضم لـ Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
