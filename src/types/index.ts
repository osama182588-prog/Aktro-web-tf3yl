// Application types
export type ApplicationStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFICATION'

export interface Application {
  id: string
  userId: string
  realName: string
  age: number
  characterName: string
  characterStory: string
  status: ApplicationStatus
  priority: boolean
  qualityRating: number | null
  adminNotes: string | null
  publicNotes: string | null
  reviewedBy: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
  answers?: Answer[]
  user?: User
}

export interface Answer {
  id: string
  applicationId: string
  questionId: string
  text: string
  createdAt: Date
  question?: Question
}

export interface Question {
  id: string
  text: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  discordId: string
  username: string
  discriminator: string | null
  avatar: string | null
  email: string | null
  roles: string[]
  createdAt: Date
  updatedAt: Date
}

export interface QuickReply {
  id: string
  title: string
  content: string
  category: 'approval' | 'rejection' | 'modification'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AdminLog {
  id: string
  adminId: string
  action: string
  targetId: string | null
  targetType: string | null
  details: string | null
  ipAddress: string | null
  createdAt: Date
  admin?: User
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: Date
}

export interface Setting {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  createdAt: Date
  updatedAt: Date
}

// Statistics types
export interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  todayApplications: number
  approvalRate: number
  averageReviewTime: number
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
