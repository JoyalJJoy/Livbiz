import type { Metadata } from "next";
import { Manrope, Poppins } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://livbiz.com'), // Replace with actual domain
  title: {
    default: "LivBiz Coworking & Conference Hub | Flexible Workspace",
    template: "%s | LivBiz Coworking"
  },
  description: "Flexible coworking, day passes, and meeting room bookings at LivBiz Coworking & Conference Hub.",
  keywords: ["Coworking", "Conference Hub", "Workspace", "Day Pass", "Meeting Rooms", "LivBiz"],
  openGraph: {
    title: "LivBiz Coworking & Conference Hub",
    description: "Experience India's largest premium coworking space.",
    url: 'https://livbiz.com',
    siteName: 'LivBiz',
    images: [
      {
        url: '/images/hero-bg.jpg',
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
    description: "Flexible coworking, day passes, and meeting room bookings.",
    images: ['/images/hero-bg.jpg'],
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

import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning={true}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
