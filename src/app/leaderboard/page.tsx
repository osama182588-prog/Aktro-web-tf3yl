import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp
} from "lucide-react"

// Sample leaderboard data - in production, this would come from the database
const leaderboardData = [
  { rank: 1, username: "Ahmed_Pro", points: 15000, badge: "legendary" },
  { rank: 2, username: "Sara_Gaming", points: 12500, badge: "epic" },
  { rank: 3, username: "Mohammed_RP", points: 11000, badge: "epic" },
  { rank: 4, username: "Fatima_Star", points: 9500, badge: "rare" },
  { rank: 5, username: "Omar_Legend", points: 8800, badge: "rare" },
  { rank: 6, username: "Layla_Queen", points: 7500, badge: "common" },
  { rank: 7, username: "Youssef_King", points: 6200, badge: "common" },
  { rank: 8, username: "Noura_Swift", points: 5800, badge: "common" },
  { rank: 9, username: "Hassan_Ghost", points: 5200, badge: "common" },
  { rank: 10, username: "Aisha_Phoenix", points: 4800, badge: "common" },
]

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />
    default:
      return <span className="w-6 h-6 flex items-center justify-center font-bold text-foreground/60">{rank}</span>
  }
}

function getBadgeVariant(badge: string): "default" | "success" | "warning" | "error" | "info" {
  switch (badge) {
    case "legendary":
      return "warning"
    case "epic":
      return "error"
    case "rare":
      return "info"
    default:
      return "default"
  }
}

function getBadgeLabel(badge: string): string {
  switch (badge) {
    case "legendary":
      return "أسطوري"
    case "epic":
      return "ملحمي"
    case "rare":
      return "نادر"
    default:
      return "عادي"
  }
}

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 fade-in">
          <Badge variant="warning" className="mb-4">
            <Trophy className="w-4 h-4 ml-1" />
            المتصدرين
          </Badge>
          <h1 className="text-4xl font-bold mb-4">قائمة المتصدرين</h1>
          <p className="text-foreground/60">
            أفضل اللاعبين في Secret CFW
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Second Place */}
          <Card className="fade-in delay-200 mt-8">
            <CardContent className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center mx-auto mb-3">
                <Medal className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold mb-1">{leaderboardData[1].username}</h3>
              <p className="text-sm text-foreground/60">{leaderboardData[1].points.toLocaleString()} نقطة</p>
              <Badge variant={getBadgeVariant(leaderboardData[1].badge)} className="mt-2">
                {getBadgeLabel(leaderboardData[1].badge)}
              </Badge>
            </CardContent>
          </Card>

          {/* First Place */}
          <Card className="fade-in delay-100 glow">
            <CardContent className="py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-3 pulse-glow">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="font-bold text-lg mb-1">{leaderboardData[0].username}</h3>
              <p className="text-foreground/60">{leaderboardData[0].points.toLocaleString()} نقطة</p>
              <Badge variant={getBadgeVariant(leaderboardData[0].badge)} className="mt-2">
                {getBadgeLabel(leaderboardData[0].badge)}
              </Badge>
            </CardContent>
          </Card>

          {/* Third Place */}
          <Card className="fade-in delay-300 mt-8">
            <CardContent className="py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto mb-3">
                <Medal className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-1">{leaderboardData[2].username}</h3>
              <p className="text-sm text-foreground/60">{leaderboardData[2].points.toLocaleString()} نقطة</p>
              <Badge variant={getBadgeVariant(leaderboardData[2].badge)} className="mt-2">
                {getBadgeLabel(leaderboardData[2].badge)}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Full Leaderboard */}
        <Card className="fade-in delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              الترتيب الكامل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboardData.map((player, index) => (
                <div 
                  key={player.rank}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    player.rank <= 3 ? 'bg-primary/5' : 'hover:bg-muted'
                  } transition-colors`}
                >
                  <div className="w-8">
                    {getRankIcon(player.rank)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{player.username}</h4>
                  </div>
                  <Badge variant={getBadgeVariant(player.badge)} size="sm">
                    {getBadgeLabel(player.badge)}
                  </Badge>
                  <div className="text-left min-w-[100px]">
                    <span className="font-bold text-primary">{player.points.toLocaleString()}</span>
                    <span className="text-sm text-foreground/60 mr-1">نقطة</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
