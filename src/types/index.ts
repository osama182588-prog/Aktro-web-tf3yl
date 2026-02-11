import { AdminRole, ApplicationStatus } from '@/generated/prisma';

export interface UserSession {
  id: string;
  discordId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles: string[];
  adminRole: AdminRole;
  isPriority: boolean;
}

export interface ApplicationData {
  id: string;
  userId: string;
  realName: string;
  age: number;
  characterName: string;
  characterStory: string;
  status: ApplicationStatus;
  isPriority: boolean;
  qualityRating?: number | null;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    discordId: string;
    username: string;
    avatar?: string | null;
  };
  answers?: ApplicationAnswerData[];
}

export interface ApplicationAnswerData {
  id: string;
  questionId: string;
  answer: string;
  question?: {
    id: string;
    text: string;
  };
}

export interface QuestionData {
  id: string;
  text: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface ActivityLogData {
  id: string;
  userId: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: string | null;
  createdAt: Date;
  user?: {
    username: string;
    avatar?: string | null;
  };
}

export interface SystemSettingsData {
  questionsPerExam: number;
  minAccountAge: number;
  submissionCooldown: number;
  waitingTimeout: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  quickResponses?: QuickResponse[] | null;
}

export interface QuickResponse {
  id: string;
  title: string;
  message: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedToday: number;
  rejectedToday: number;
  approvalRate: number;
  averageReviewTime: number; // in hours
}

export type ReviewAction = 'APPROVE' | 'REJECT' | 'REQUEST_MODIFICATION';
