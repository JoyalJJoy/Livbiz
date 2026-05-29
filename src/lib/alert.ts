import { LRUCache } from 'lru-cache';
import { sendEmail } from '@/lib/email';

/**
 * Rate-limit alert emails: max 1 per unique subject every 10 minutes.
 * Prevents alert storms from flooding the admin inbox during outages.
 */
const alertCache = new LRUCache<string, boolean>({
  max: 200,
  ttl: 10 * 60 * 1000, // 10 minutes
});

function getAdminEmail(): string | undefined {
  return process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_USER;
}

function buildAlertHtml(subject: string, details: string): string {
  const timestamp = new Date().toISOString();

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a2e; color: #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #dc2626; padding: 16px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 1px;">⚠ CRITICAL ALERT</h1>
      </div>
      <div style="padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #f87171; font-size: 18px;">${subject}</h2>
        <pre style="background-color: #16213e; padding: 16px; border-radius: 6px; white-space: pre-wrap; word-wrap: break-word; font-size: 13px; color: #cbd5e1; border: 1px solid #2d3a5c;">${details}</pre>
        <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">Occurred at: ${timestamp}</p>
      </div>
      <div style="padding: 12px 24px; background-color: #16213e; text-align: center; font-size: 11px; color: #64748b;">
        LivBizz Monitoring &middot; Automated Alert
      </div>
    </div>
  `;
}

/**
 * Send a critical alert email to the admin.
 * Rate-limited to 1 alert per unique subject per 10 minutes.
 *
 * @param subject - Short description of the issue
 * @param details - Full error details / stack trace
 */
export async function sendCriticalAlert(
  subject: string,
  details: string
): Promise<void> {
  // Rate-limit: skip if we already sent this alert recently
  if (alertCache.has(subject)) {
    return;
  }

  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    console.warn(
      '[alert] No ADMIN_ALERT_EMAIL or EMAIL_USER configured. Skipping alert.'
    );
    return;
  }

  alertCache.set(subject, true);

  await sendEmail({
    to: adminEmail,
    subject: `[LivBizz CRITICAL] ${subject}`,
    html: buildAlertHtml(subject, details),
  });
}
