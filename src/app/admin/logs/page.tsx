"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { 
  History,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Settings,
  HelpCircle,
  Eye,
  LogIn,
  LogOut
} from "lucide-react"

interface AdminLog {
  id: string
  actionType: string
  description: string
  createdAt: string
  admin: {
    discordUsername: string
    discordAvatar: string | null
    discordId: string
  }
  target?: {
    discordUsername: string
  } | null
}

const actionIcons: Record<string, React.ReactNode> = {
  APPROVE_REQUEST: <CheckCircle className="w-4 h-4 text-success" />,
  REJECT_REQUEST: <XCircle className="w-4 h-4 text-error" />,
  REQUEST_MODIFICATION: <Edit className="w-4 h-4 text-warning" />,
  UPDATE_SETTINGS: <Settings className="w-4 h-4 text-info" />,
  MANAGE_QUESTIONS: <HelpCircle className="w-4 h-4 text-primary" />,
  VIEW_REQUEST: <Eye className="w-4 h-4 text-foreground/60" />,
  LOGIN: <LogIn className="w-4 h-4 text-success" />,
  LOGOUT: <LogOut className="w-4 h-4 text-foreground/60" />
}

const actionLabels: Record<string, string> = {
  APPROVE_REQUEST: "قبول طلب",
  REJECT_REQUEST: "رفض طلب",
  REQUEST_MODIFICATION: "طلب تعديل",
  UPDATE_SETTINGS: "تحديث الإعدادات",
  MANAGE_QUESTIONS: "إدارة الأسئلة",
  VIEW_REQUEST: "عرض طلب",
  MANUAL_STATUS_CHANGE: "تغيير يدوي",
  LOGIN: "تسجيل دخول",
  LOGOUT: "تسجيل خروج"
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const res = await fetch("/api/admin/logs")
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="fade-in">
        <h1 className="text-2xl font-bold mb-2">سجل النشاط</h1>
        <p className="text-foreground/60">تتبع جميع الإجراءات الإدارية</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="fade-in">
          <CardContent className="py-12 text-center">
            <History className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/60">لا يوجد سجل نشاط بعد</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="fade-in">
          <CardContent className="py-4">
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div 
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted transition-colors fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {actionIcons[log.actionType] || <History className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{log.admin.discordUsername}</span>
                      <Badge variant="default" size="sm">
                        {actionLabels[log.actionType] || log.actionType}
                      </Badge>
                      {log.target && (
                        <span className="text-foreground/60 text-sm">
                          ← {log.target.discordUsername}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/60">{log.description}</p>
                  </div>
                  <div className="text-left text-sm text-foreground/40 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
