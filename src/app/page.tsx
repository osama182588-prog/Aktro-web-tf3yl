"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Gamepad2,
  Star
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "تفعيل سريع",
    description: "نظام تفعيل متطور يضمن لك تجربة سلسة وسريعة"
  },
  {
    icon: Shield,
    title: "أمان عالي",
    description: "حماية متقدمة لحسابك وبياناتك الشخصية"
  },
  {
    icon: Users,
    title: "مجتمع نشط",
    description: "انضم إلى مجتمع من اللاعبين المحترفين"
  },
  {
    icon: Clock,
    title: "دعم 24/7",
    description: "فريق إداري متواجد على مدار الساعة لمساعدتك"
  }
]

const stats = [
  { value: "5000+", label: "لاعب مفعل" },
  { value: "99%", label: "نسبة الرضا" },
  { value: "24/7", label: "دعم متواصل" },
  { value: "3+", label: "سنوات خبرة" }
]

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-16 fade-in">
        <Badge variant="info" className="mb-6">
          <Star className="w-4 h-4 ml-1" />
          منصة التفعيل الرسمية
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          مرحباً بك في{" "}
          <span className="text-gradient">Secret CFW</span>
        </h1>
        
        <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-8">
          منصة إدارة التفعيل الاحترافية لسيرفر FiveM. 
          ابدأ رحلتك في عالم الرول بلاي الآن!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  لوحتي
                </Button>
              </Link>
              <Link href="/activation">
                <Button variant="outline" size="lg" className="gap-2">
                  <Zap className="w-5 h-5" />
                  التفعيل
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="lg" className="gap-2">
                ابدأ الآن
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="py-6">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-foreground/60">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl font-bold mb-4">لماذا Secret CFW؟</h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            نقدم لك أفضل تجربة رول بلاي مع نظام تفعيل متطور وفريق إداري محترف
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              hover 
              className="fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/60">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <Card className="text-center py-12 glow fade-in">
          <CardContent>
            <h2 className="text-3xl font-bold mb-4">جاهز للانضمام؟</h2>
            <p className="text-foreground/60 max-w-xl mx-auto mb-8">
              انضم إلى آلاف اللاعبين واستمتع بأفضل تجربة رول بلاي عربية
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/terms">
                <Button variant="outline" size="lg">
                  الشروط والأحكام
                </Button>
              </Link>
              <Link href="/activation">
                <Button size="lg" className="gap-2">
                  <CheckCircle className="w-5 h-5" />
                  ابدأ التفعيل
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
