import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://livbiz.com'), // Replace with actual domain
  title: {
    default: "LivBiz Coworking & Conference Hub | Premium Workspaces in Bengaluru",
    template: "%s | LivBiz Coworking"
  },
  description: "Experience India's largest premium coworking space. Enterprise-grade amenities, bespoke offices, and vibrant community networking at Lavelle Road, Museum Road, and Whitefield.",
  keywords: ["Coworking", "Conference Hub", "Premium Workspace", "Bengaluru", "Shared Office", "Meeting Rooms", "LivBiz"],
  openGraph: {
    title: "LivBiz Coworking & Conference Hub",
    description: "Experience India's largest premium coworking space.",
    url: 'https://livbiz.com',
    siteName: 'LivBiz',
    images: [
      {
        url: '/images/hero-bg.png',
        width: 1200,
        height: 630,
        alt: 'LivBiz Premium Coworking',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LivBiz Coworking & Conference Hub',
    description: "Experience India's largest premium coworking space in Bengaluru.",
    images: ['/images/hero-bg.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
