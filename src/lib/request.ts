export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || '127.0.0.1';
  }

  return req.headers.get('x-real-ip')?.trim() || '127.0.0.1';
}

export function getRequestOrigin(req: Request) {
  const configuredUrl = process.env.NEXTAUTH_URL;
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Fall through to request headers if NEXTAUTH_URL is malformed.
    }
  }

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) {
    const proto =
      req.headers.get('x-forwarded-proto') ||
      new URL(req.url).protocol.replace(':', '') ||
      'http';
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}
