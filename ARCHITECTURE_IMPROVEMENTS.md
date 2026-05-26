# LivBiz System Architecture - Comprehensive Review & Improvements

**Date:** May 26, 2026  
**Review Level:** Senior Full-Stack Developer  
**Status:** 🚀 Production-Ready with Strategic Enhancements

---

## 📊 Executive Summary

Your current architecture is **solid and well-structured** for a mid-scale SaaS platform. However, there are **10-15 critical improvements** to scale to 10k+ concurrent users and enterprise reliability.

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. **Email Service Misconfiguration (BLOCKING)**
**File:** `src/lib/email.ts`  
**Issue:** Using Nodemailer with SMTP (slow, unreliable, rate-limited)  
**Impact:** Emails take 2-5 seconds per send, tickets not delivered reliably in high load

**Recommendation:** Replace with Brevo (formerly Sendinblue)
```typescript
// Current (slow)
nodemailer + SMTP = 2-5s per email + bounce issues

// Recommended (fast)
Brevo API = 100-200ms per email + webhook delivery tracking
```

**Action Items:**
- [ ] Install `@brevo/brevo` SDK
- [ ] Create `src/lib/brevo.ts` (10 LOC)
- [ ] Update `src/lib/email.ts` to use Brevo instead
- [ ] Add `BREVO_API_KEY` to `.env`
- [ ] Add email template IDs in Brevo dashboard

---

### 2. **Missing Error Tracking & Observability (CRITICAL)**
**Current State:** Only `console.error()` — impossible to debug production issues

**Recommendation:** Add Sentry or PostHog
```typescript
// Add to src/lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Benefits:**
- Real-time error alerts
- Performance monitoring
- User session replay
- Database query performance

---

### 3. **Database Indexing Issues (PERFORMANCE)**
**File:** `prisma/schema.prisma`

**Current Problem:**
```prisma
model Booking {
  @@index([userId, status])        // ✅ Good
  @@index([slotId, startTime, endTime])  // ❌ Missing for availability queries
}

model Ticket {
  @@index([bookingId])             // ⚠️ Redundant (FK already indexed)
  @@index([userId, status])        // ✅ Good
  // ❌ Missing: @@index([recipientEmail]) for batch email sends
  // ❌ Missing: @@index([validFrom, validUntil]) for validity checks
}

model User {
  // ❌ Missing: @@index([role, createdAt]) for admin analytics
}
```

**Fix:**
```prisma
model User {
  @@index([email, role])
  @@index([role, createdAt])
  @@index([phone])  // For SMS feature (future)
}

model Booking {
  @@index([userId, status, startTime])  // For user dashboard
  @@index([slotId, startTime, endTime])  // For conflict detection
  @@index([status, createdAt])  // For admin analytics
}

model Ticket {
  @@index([code])  // Already have @unique, but needed for queries
  @@index([userId, status])
  @@index([recipientEmail])  // For batch email operations
  @@index([validFrom, validUntil, status])  // For validity checks
}

model Slot {
  @@index([campusId, type, isActive])  // Already good
}
```

---

### 4. **No API Versioning Strategy (BREAKING)**
**Current:** Directly in `/api/admin/bookings` — can't iterate without breaking clients

**Recommendation:**
```
src/app/api/v1/
├── admin/
│   ├── bookings/
│   ├── stats/
│   └── users/
├── user/
│   ├── bookings/
│   └── tickets/
└── public/
    ├── slots/
    └── campuses/
```

This allows `/api/v2/*` later without breaking v1 clients.

---

### 5. **In-Memory Cache Not Scalable for Production (MEDIUM)**
**File:** `src/lib/cache.ts`  
**Issue:** LRU cache doesn't persist across server restarts or multiple instances

**Current:**
```typescript
const cache = new LRUCache({ max: 500 })  // Lost on restart!
```

**For Production (1+ instance):**
```typescript
// Use Redis for distributed caching
import redis from 'redis';

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60000
): Promise<T> {
  const client = redis.createClient({
    url: process.env.REDIS_URL,
  });
  
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);
  
  const value = await fetcher();
  await client.setEx(key, ttlMs / 1000, JSON.stringify(value));
  return value;
}
```

**Or use Vercel KV** if on Vercel:
```typescript
import { kv } from '@vercel/kv';

export const cached = async <T>(key: string, fetcher: () => Promise<T>, ttl = 60) => {
  let data = await kv.get<T>(key);
  if (!data) {
    data = await fetcher();
    await kv.setex(key, ttl, JSON.stringify(data));
  }
  return data;
};
```

---

## 🟠 HIGH PRIORITY IMPROVEMENTS

### 6. **No Request Validation (Zod)**
**Files:** All API routes  
**Issue:** Validating with `if (!x)` is error-prone; no schema documentation

**Add Zod validation:**
```typescript
// src/lib/schemas.ts
import { z } from 'zod';

export const bookingCreateSchema = z.object({
  slotId: z.string().cuid('Invalid slot'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  totalPrice: z.number().positive(),
  attendees: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email(),
  })).optional(),
});

// In route.ts
const parsed = bookingCreateSchema.parse(await req.json());
```

---

### 7. **No Audit Logging (Compliance)**
**Missing:** Track admin actions (approve, reject, cancel, verify)

**Add:**
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // 'BOOKING_APPROVED', 'TICKET_VERIFIED'
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  targetId  String   // booking ID or ticket ID
  targetType String  // 'BOOKING', 'TICKET'
  changes   Json     // What changed
  createdAt DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([action, createdAt])
}
```

Then in API routes:
```typescript
await prisma.auditLog.create({
  data: {
    action: 'BOOKING_APPROVED',
    userId: adminId,
    targetId: bookingId,
    targetType: 'BOOKING',
    changes: { status: 'APPROVED', ticketsCount: 4 },
  },
});
```

---

### 8. **Race Condition in Ticket Generation (BUG)**
**File:** `src/app/api/admin/bookings/route.ts` line 160-165

**Current (problematic):**
```typescript
for (const t of ticketsToActivate) {
  // Generate QR for each ticket separately
  // If one fails, partial state ⚠️
}
```

**Better (idempotent):**
```typescript
// Generate all QR codes before any DB writes
const qrCodes = await Promise.all(
  ticketsToActivate.map(t => QRCode.toDataURL(...))
);

// Then update in one transaction
await prisma.$transaction(
  qrCodes.map((qr, i) => 
    prisma.ticket.update({
      where: { id: ticketsToActivate[i].id },
      data: { status: 'VALID', qrData: qr }
    })
  )
);
```

---

### 9. **Email Sending Blocking API Response (LATENCY)**
**File:** `src/app/api/admin/bookings/route.ts` line 213-230

**Current (blocks):**
```typescript
// Email sending happens in PATCH response ⚠️
for (const t of updatedTickets) {
  if (t.email) {
    await sendEmail(...); // 2-5s per email!
  }
}
// Admin waits 10-30s for confirmation ❌
```

**Better (queue-based):**
```typescript
// Option 1: Queue emails for async processing
import { sendEmail } from '@/lib/email';

// In PATCH handler:
await prisma.booking.update({...}); // Fast DB write

// Queue emails (don't await)
updatedTickets.forEach(t => {
  if (t.email) {
    // Fire and forget - email service handles retry
    sendEmail({...}).catch(err => {
      console.error('Email queued for retry:', err);
      // Log to dead-letter queue
    });
  }
});

// Return immediately
return NextResponse.json({ message: 'Approved!' });

// Option 2: Use job queue (Bull, Inngest)
// Better for reliability
```

---

### 10. **Session Token Exposed in Logs (SECURITY)**
**File:** Multiple auth handlers

**Risk:** If logs leak, attacker can hijack sessions

**Fix:**
```typescript
// In auth.ts
console.log('User logged in:', user.email); // ✅ Safe
console.log('Token:', token); // ❌ NEVER log tokens
console.log('Session:', { userId: user.id, role: user.role }); // ✅ Safe
```

---

## 🟡 MEDIUM PRIORITY IMPROVEMENTS

### 11. **Missing Rate Limiting on Auth Endpoints**
**Files:** `/api/auth/signup`, `/api/auth/[...nextauth]`

**Add:**
```typescript
import { isRateLimited } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitCheck = isRateLimited(ip, 5); // 5 attempts per minute
  
  if (rateLimitCheck.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }
  
  // ... handle signup
}
```

---

### 12. **No Pagination for Admin Users List**
**File:** `/api/admin/bookings` has pagination ✅ but no `/api/admin/users`

**Missing Feature:**
```typescript
// POST /api/admin/users/list
export async function POST(req: Request) {
  const { search, role, page = 1, limit = 50, from, to } = await req.json();
  
  const where: Prisma.UserWhereInput = {
    AND: [
      search ? { OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]} : {},
      role ? { role } : {},
      from || to ? { createdAt: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      }} : {},
    ],
  };
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  
  return NextResponse.json({
    users,
    total,
    pages: Math.ceil(total / limit),
  });
}
```

---

### 13. **Missing Database Transactions in Complex Operations**
**Issue:** Multiple DB writes can partially fail

**Example - Booking with Tickets:**
```typescript
// ❌ Current (can be inconsistent)
const booking = await prisma.booking.create({...});
const tickets = await prisma.ticket.createMany({...});

// ✅ Better
const [booking, tickets] = await prisma.$transaction([
  prisma.booking.create({...}),
  prisma.ticket.createMany({...}),
]);
```

All your API routes should wrap multi-step DB operations in `$transaction()`.

---

### 14. **No TypeScript Strict Mode Issues**
**Current:** Using `as unknown as { ... }` for type casting (bandaid fix)

**Better:**
```typescript
// Create type-safe types
type UserSession = {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'ADMIN' | 'SUPER_ADMIN';
};

// In auth callback
if (user) {
  token.id = user.id;
  token.role = user.role as UserSession['role'];
}

// In route handlers
const userId = (session.user as UserSession).id; // Type-safe!
```

---

### 15. **No Analytics Dashboard for Admin**
**Missing Completely:**
```
GET /api/admin/analytics
- Bookings per day (chart)
- Revenue per day
- User growth
- Campus utilization %
- Slot type breakdown
- Peak hours
```

---

## 🟢 LOW PRIORITY ENHANCEMENTS

### 16. **API Documentation (OpenAPI/Swagger)**
Add `@swagger` comments or use `swagger-jsdoc`:
```typescript
/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: List all bookings
 *     parameters:
 *       - name: status
 *         in: query
 *         enum: [PENDING, APPROVED, REJECTED]
 */
```

---

### 17. **Environment Validation at Startup**
**Add `src/lib/env.ts`:**
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  EMAIL_HOST: z.string(),
  EMAIL_USER: z.string().email(),
  EMAIL_PASS: z.string(),
  BREVO_API_KEY: z.string(),
  SENTRY_DSN: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
```

Then use `env.DATABASE_URL` instead of `process.env.DATABASE_URL`.

---

### 18. **Structured Logging**
Replace `console.log()` with structured logs:
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

logger.info({ bookingId: 'xyz', action: 'approve' }, 'Booking approved');
```

---

### 19. **Database Connection Pooling**
**For PostgreSQL with many connections:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Add to URL:
  // ?schema=public&pgbouncer=true&connection_limit=5
}
```

---

### 20. **Middleware for Common Tasks**
**Create `src/app/api/middleware.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Add request ID for logging
  const requestId = crypto.randomUUID();
  req.headers.set('x-request-id', requestId);
  
  // Measure response time
  const start = Date.now();
  const res = NextResponse.next();
  const duration = Date.now() - start;
  
  res.headers.set('x-response-time', `${duration}ms`);
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
```

---

## 📋 Implementation Roadmap

### **Week 1 (Critical)**
- [ ] Migrate email to Brevo
- [ ] Add Sentry for error tracking
- [ ] Add database indexes
- [ ] Fix race condition in ticket generation
- [ ] Add email queue system

### **Week 2 (High Priority)**
- [ ] Implement Zod validation
- [ ] Add audit logging
- [ ] Fix API versioning
- [ ] Add rate limiting to auth
- [ ] Implement admin users list API

### **Week 3 (Medium Priority)**
- [ ] Setup Redis/KV cache
- [ ] Add structured logging
- [ ] Environment validation
- [ ] API documentation

### **Week 4+ (Polish)**
- [ ] Analytics dashboard
- [ ] Database connection pooling
- [ ] TypeScript improvements
- [ ] Middleware setup

---

## 🎯 Scalability Checklist

- [ ] **Database:** All queries have proper indexes
- [ ] **Caching:** Redis for distributed cache
- [ ] **Email:** Async queue-based, not blocking
- [ ] **Errors:** Sentry for production monitoring
- [ ] **Logs:** Structured logging with request IDs
- [ ] **Rate Limiting:** Auth and public endpoints
- [ ] **Validation:** Zod schemas on all inputs
- [ ] **Transactions:** Multi-step operations are atomic
- [ ] **Security:** No secrets in logs, token rotation
- [ ] **API Versioning:** v1/ structure ready for v2/

---

## 📞 Next Steps

1. **Send me the list of files to improve first** (I recommend starting with email + Sentry)
2. **For each file, I'll implement the fix** with proper error handling
3. **We'll test it locally** before committing
4. **We'll follow this roadmap** over the next month

---

**Questions?** Ask me about any of these improvements and I'll implement them step-by-step! 🚀
