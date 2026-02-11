import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Monitor, 
  Users,
  ExternalLink,
  Play,
  Star
} from "lucide-react"

// Sample streamers data
const streamers = [
  {
    id: 1,
    name: "AhmedStreams",
    platform: "Twitch",
    followers: 15000,
    isLive: true,
    streamTitle: "بث مباشر - GTA V Roleplay",
    profileImage: "🎮"
  },
  {
    id: 2,
    name: "SaraGaming",
    platform: "YouTube",
    followers: 25000,
    isLive: false,
    streamTitle: "أفضل لحظات الرول بلاي",
    profileImage: "🎬"
  },
  {
    id: 3,
    name: "MohammedRP",
    platform: "Twitch",
    followers: 8000,
    isLive: true,
    streamTitle: "مهمات جديدة في Secret CFW",
    profileImage: "🔥"
  },
]

export default function StreamerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 fade-in">
          <Badge variant="error" className="mb-4">
            <Monitor className="w-4 h-4 ml-1" />
            Streamers
          </Badge>
          <h1 className="text-4xl font-bold mb-4">منشئو المحتوى</h1>
          <p className="text-foreground/60">
            تابع أفضل صناع المحتوى في مجتمع Secret CFW
          </p>
        </div>

        {/* Live Now Section */}
        <div className="mb-8 fade-in">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error animate-pulse" />
            بث مباشر الآن
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streamers.filter(s => s.isLive).map((streamer) => (
              <Card key={streamer.id} className="card-hover glow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                      {streamer.profileImage}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{streamer.name}</h3>
                        <Badge variant="error" size="sm">
                          <Play className="w-3 h-3 ml-1" />
                          مباشر
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/60 mb-1">{streamer.streamTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-foreground/40">
                        <span>{streamer.platform}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {streamer.followers.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" className="gap-1">
                      <ExternalLink className="w-4 h-4" />
                      مشاهدة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Streamers */}
        <div className="fade-in delay-200">
          <h2 className="text-xl font-bold mb-4">جميع المنشئين</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streamers.map((streamer, index) => (
              <Card 
                key={streamer.id} 
                hover
                className="fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="py-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl mx-auto mb-4">
                    {streamer.profileImage}
                  </div>
                  <h3 className="font-bold mb-1">{streamer.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground/60 mb-3">
                    <span>{streamer.platform}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {streamer.followers.toLocaleString()}
                    </span>
                  </div>
                  {streamer.isLive ? (
                    <Badge variant="error">
                      <Play className="w-3 h-3 ml-1" />
                      مباشر
                    </Badge>
                  ) : (
                    <Badge variant="default">غير متصل</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Become a Streamer */}
        <Card className="mt-8 fade-in delay-400">
          <CardContent className="py-8 text-center">
            <Star className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">هل أنت صانع محتوى؟</h3>
            <p className="text-foreground/60 mb-4">
              انضم لبرنامج Streamers واحصل على مميزات حصرية
            </p>
            <Button className="gap-2">
              <ExternalLink className="w-4 h-4" />
              تقديم طلب انضمام
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
