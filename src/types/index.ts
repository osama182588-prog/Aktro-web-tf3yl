import type { Application, User, Question, Answer, AdminAction, Notification, JobApplication } from '@prisma/client'

// Extended types with relations
export interface ApplicationWithUser extends Application {
  user: User
  answers: AnswerWithQuestion[]
}

export interface AnswerWithQuestion extends Answer {
  question: Question
}

export interface UserWithApplications extends User {
  applications: Application[]
  jobApplications: JobApplication[]
  notifications: Notification[]
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Application form types
export interface ApplicationFormData {
  realName: string
  age: number
  characterName: string
  characterStory: string
  answers: { questionId: string; answerText: string }[]
}

// Dashboard stats types
export interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  approvedToday: number
  rejectedToday: number
  averageReviewTime: number
  approvalRate: number
}

// Filter types
export interface ApplicationFilters {
  status?: string
  priority?: boolean
  search?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'priority'
  sortOrder?: 'asc' | 'desc'
}

// Admin action log with user info
export interface AdminActionWithAdmin extends AdminAction {
  admin: User
  target?: User | null
}

// Discord types
export interface DiscordGuildMember {
  user: {
    id: string
    username: string
    discriminator: string
    avatar: string
  }
  roles: string[]
  joined_at: string
}

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

// Quick reply category
export type QuickReplyCategory = 'approval' | 'rejection' | 'modification'

// Theme types
export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  darkMode: boolean
  customCss?: string
  logoUrl?: string
  backgroundUrl?: string
}
