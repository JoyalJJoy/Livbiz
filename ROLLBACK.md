# LivBizz Rollback & Recovery Guide

> Quick-reference runbook for reverting bad deployments, recovering data, and verifying production health.

---

## 1. Vercel Deployment Rollback

Instantly revert to a previous working deployment with zero downtime.

1. Open the [Vercel Dashboard](https://vercel.com/dashboard) → select the **LivBizz** project
2. Navigate to **Deployments** tab
3. Find the last known-good deployment (look for the green ✓ indicator)
4. Click the **⋯** menu → **Promote to Production**
5. Confirm the promotion — takes effect in **under 10 seconds**

> **Tip:** Vercel keeps all previous deployments accessible by their unique URL. You can verify a specific deployment works correctly by visiting its preview URL before promoting.

### Rollback via CLI (alternative)

```bash
# List recent deployments
npx vercel ls

# Promote a specific deployment to production
npx vercel promote <deployment-url>
```

---

## 2. Database Recovery (Neon PostgreSQL)

Neon provides **7-day Point-in-Time Recovery (PITR)** on all plans.

### Restore from Neon Console

1. Open [Neon Console](https://console.neon.tech/) → select the LivBizz project
2. Go to **Branches** → click **New Branch**
3. Select **From parent at a specific point in time**
4. Choose the timestamp **before** the incident occurred
5. Create the branch — this gives you a clean snapshot of the database
6. Update `DATABASE_URL` in Vercel environment variables to point to the restored branch
7. Redeploy (or promote a previous deployment)

### Pre-Migration Safety: Create a Branch

**Always** create a Neon branch before running risky schema migrations:

```bash
# Using the Neon CLI
neonctl branches create --name pre-migration-backup

# Run your migration against the main branch
npx prisma migrate deploy

# If something goes wrong, switch DATABASE_URL to the backup branch
```

### Prisma Migration Rollback

If a Prisma migration causes issues:

```bash
# Check migration status
npx prisma migrate status

# Manually revert by writing a down migration
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## 3. Pre-Deployment Safety Checklist

Run through this checklist **before every production deployment**:

- [ ] **TypeScript check** — no type errors
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Production build** — compiles successfully
  ```bash
  npm run build
  ```

- [ ] **Neon branch** — create a backup branch before schema migrations
  ```bash
  neonctl branches create --name pre-deploy-$(date +%Y%m%d)
  ```

- [ ] **Environment variables** — verify all required vars are set in Vercel
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`

- [ ] **Test critical flows** after deployment:
  1. User signup & email verification
  2. User login (credentials + any OAuth providers)
  3. Booking creation & confirmation email
  4. Admin dashboard loads without errors
  5. Password reset flow

---

## 4. Emergency Contacts & Monitoring

### UptimeRobot (Free Tier)

Set up basic uptime monitoring at [uptimerobot.com](https://uptimerobot.com):

1. Create a free account
2. Add a new **HTTP(s) Monitor**
   - URL: `https://your-livbizz-domain.com`
   - Monitoring interval: **every 5 minutes**
3. Configure alert contacts (email / Slack / SMS)
4. Optionally add monitors for critical API endpoints:
   - `https://your-livbizz-domain.com/api/auth/session` (auth health)

### Vercel Notifications

1. Open Vercel Dashboard → **Project Settings** → **Notifications**
2. Enable alerts for:
   - Deployment failures
   - Domain configuration issues
   - Usage limit warnings

### Vercel Runtime Logs

1. Open Vercel Dashboard → **Logs** tab
2. Filter by **Level: Error** to find 500 responses
3. Look for patterns: repeated errors on the same route indicate a systemic issue
4. Use the structured JSON logs from `src/lib/logger.ts` to search by path, method, or error name

### Incident Response Steps

1. **Detect** — UptimeRobot alert or user report
2. **Assess** — Check Vercel Runtime Logs for error patterns
3. **Mitigate** — Roll back deployment (Section 1) or database (Section 2)
4. **Fix** — Develop and test the fix locally
5. **Verify** — Run the pre-deployment checklist (Section 3)
6. **Deploy** — Push the fix and monitor logs for 15 minutes
