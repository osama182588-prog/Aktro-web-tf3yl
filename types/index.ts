// أنواع TypeScript لنظام Secret CFW
// ===================================

import { AdminRole, ApplicationStatus } from "@prisma/client";

// نوع المستخدم الموسع
export interface ExtendedUser {
  id: string;
  discordId: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  email?: string;
  roles: string[];
  isAdmin: boolean;
  adminRole: AdminRole;
  isPriority: boolean;
  accountAge?: Date;
}

// نوع الجلسة الموسع
export interface ExtendedSession {
  user: ExtendedUser;
  expires: string;
}

// نوع طلب التفعيل
export interface ApplicationData {
  id: string;
  realName: string;
  age: number;
  characterName: string;
  characterStory: string;
  answers: Record<string, string>;
  status: ApplicationStatus;
  isPriority: boolean;
  qualityRating?: number;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
}

// نوع السؤال
export interface QuestionData {
  id: string;
  question: string;
  order: number;
  isActive: boolean;
}

// نوع الإحصائيات
export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  todayApplications: number;
  averageReviewTime: number;
  approvalRate: number;
}

// نوع الإعدادات
export interface SettingsData {
  questionsPerTest: number;
  maintenanceMode: boolean;
  minAccountAge: number;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  customBackground?: string;
  quickResponses: string[];
  serverName: string;
  serverLogo?: string;
  welcomeMessage?: string;
}

// نوع سجل العمليات
export interface AdminLogData {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

// نوع الإشعار
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
}

// أنواع الأحداث للبوت
export interface DiscordEventPayload {
  type: "APPLICATION_SUBMITTED" | "APPLICATION_APPROVED" | "APPLICATION_REJECTED" | "APPLICATION_MODIFICATION";
  applicationId: string;
  userId: string;
  discordId: string;
  adminId?: string;
  message?: string;
}

// نوع استجابة API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// صلاحيات الإدارة
export const ADMIN_PERMISSIONS = {
  NONE: [],
  GENERAL_ADMIN: ["manage_questions", "view_applications", "view_stats"],
  ACTIVATION_ADMIN: ["manage_questions", "view_applications", "review_applications", "view_stats"],
  SUPER_ADMIN: [
    "manage_questions",
    "view_applications",
    "review_applications",
    "view_stats",
    "manage_users",
    "manage_settings",
    "manage_backups",
    "manage_design",
  ],
} as const;

export type Permission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS][number];
