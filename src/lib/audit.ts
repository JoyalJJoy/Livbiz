import { prisma } from './prisma';

interface CreateAuditLogParams {
  action: string; // 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'TICKET_VERIFIED', etc.
  userId: string; // Admin who performed the action
  targetId: string; // Booking ID, Ticket ID, or User ID
  targetType: 'BOOKING' | 'TICKET' | 'USER';
  changes?: Record<string, unknown>; // What changed
  ipAddress?: string; // Optional: IP address for security tracking
}

/**
 * Create an audit log entry for compliance & tracking
 */
export async function createAuditLog({
  action,
  userId,
  targetId,
  targetType,
  changes,
  ipAddress,
}: CreateAuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        targetId,
        targetType,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changes: changes ? (changes as any) : undefined,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break main operations
  }
}

/**
 * Get audit logs for a specific target (booking/ticket/user)
 */
export async function getAuditLogs(targetId: string) {
  try {
    return await prisma.auditLog.findMany({
      where: { targetId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Get recent audit logs for admin dashboard
 */
export async function getRecentAuditLogs(limit = 50) {
  try {
    return await prisma.auditLog.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Failed to fetch recent audit logs:', error);
    return [];
  }
}
