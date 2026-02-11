import { NextRequest, NextResponse } from 'next/server';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || '10');
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

export function rateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.' },
    { status: 429 }
  );
}

// Check if Discord account is too new
export function isAccountTooNew(createdAt: Date, minAgeDays: number): boolean {
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const minAgeMs = minAgeDays * 24 * 60 * 60 * 1000;
  return accountAge < minAgeMs;
}

// Check for potential alt accounts (same IP)
export async function checkAltAccount(userId: string, ipAddress: string, prisma: any): Promise<boolean> {
  const existingLogs = await prisma.ipLog.findMany({
    where: {
      ipAddress,
      userId: { not: userId },
    },
  });
  return existingLogs.length > 0;
}

// Log IP for alt detection
export async function logIp(userId: string, ipAddress: string, userAgent: string, prisma: any): Promise<void> {
  await prisma.ipLog.create({
    data: {
      userId,
      ipAddress,
      userAgent,
    },
  });
}
