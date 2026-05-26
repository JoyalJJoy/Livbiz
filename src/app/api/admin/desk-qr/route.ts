import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: Request) {
  try {
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const checkinUrl = `${proto}://${host}/checkin`;

    const qrDataUrl = await QRCode.toDataURL(checkinUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    return NextResponse.json({ qrDataUrl, checkinUrl });
  } catch (error) {
    console.error('Failed to generate desk QR code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
