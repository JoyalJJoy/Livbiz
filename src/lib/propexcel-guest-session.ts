/**
 * LivBiz cannot read PropExcel guest cookies (cross-origin).
 * Mirror signed-in chrome via postMessage + localStorage.
 */

export const PROPEXCEL_GUEST_SIGNED_IN_KEY = 'livbiz_propexcel_guest_signed_in';

export function isPropExcelEmbedOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname;
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'propexcel.localhost' ||
      // New public service hosts (no /public path prefix)
      host === 'livbiz-public-demo.propexcel.com' ||
      host === 'livbiz-public.propexcel.com' ||
      // Legacy org/app hosts (redirect to public service)
      host === 'livbiz-demo.propexcel.com' ||
      host === 'livbiz.propexcel.com'
    );
  } catch {
    return false;
  }
}

export function readPropExcelGuestSignedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(PROPEXCEL_GUEST_SIGNED_IN_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPropExcelGuestSignedIn(signedIn: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (signedIn) {
      window.localStorage.setItem(PROPEXCEL_GUEST_SIGNED_IN_KEY, '1');
    } else {
      window.localStorage.removeItem(PROPEXCEL_GUEST_SIGNED_IN_KEY);
    }
    window.dispatchEvent(
      new CustomEvent('livbiz:propexcel-guest-session', {
        detail: { signedIn },
      })
    );
  } catch {
    // ignore
  }
}
