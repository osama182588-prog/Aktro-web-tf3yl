// Activation Status Type
export type ActivationStatus =
  | "NOT_ACTIVATED"
  | "PENDING"
  | "ACTIVATED"
  | "REJECTED"
  | "EDIT_REQUESTED"

// Activation Request
export interface ActivationRequest {
  id: string
  userId: string
  realName: string
  age: number
  characterName: string
  characterStory: string
  quizAnswers: QuizAnswer[]
  status: ActivationStatus
  hasPriority: boolean
  adminNotes?: string
  publicNotes?: string
  qualityRating?: number
  createdAt: Date
  updatedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  user?: User
}

// Quiz Answer
export interface QuizAnswer {
  questionId: string
  question: string
  answer: string
}

// Question
export interface Question {
  id: string
  text: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// User
export interface User {
  id: string
  discordId: string
  discordUsername: string
  discordAvatar?: string
  email?: string
  isHighAdmin: boolean
  isActivationAdmin: boolean
  isGeneralAdmin: boolean
  hasPriority: boolean
  createdAt: Date
  updatedAt: Date
}

// Admin Log
export interface AdminLog {
  id: string
  adminId: string
  targetId?: string
  action: string
  details?: Record<string, unknown>
  createdAt: Date
  admin?: User
  target?: User
}

// Quick Response
export interface QuickResponse {
  id: string
  title: string
  content: string
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Notification
export interface Notification {
  id: string
  userId?: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}

// Theme Settings
export interface ThemeSettings {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  isDarkMode: boolean
  backgroundUrl?: string
  customCss?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// Statistics
export interface Statistics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  todayRequests: number
  approvalRate: number
  avgReviewTime: number
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
