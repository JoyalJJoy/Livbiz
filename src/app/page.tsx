import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import dynamic from 'next/dynamic';

// Lazy load below-the-fold components for performance
const StatsBanner = dynamic(() => import('@/components/StatsBanner'), { ssr: true });
const CommunityBanner = dynamic(() => import('@/components/CommunityBanner'), { ssr: true });
const FeaturesGrid = dynamic(() => import('@/components/FeaturesGrid'), { ssr: true });
const PremiumCampuses = dynamic(() => import('@/components/PremiumCampuses'), { ssr: true });
const DayInTheLife = dynamic(() => import('@/components/DayInTheLife'), { ssr: true });
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: true });
const LocationMap = dynamic(() => import('@/components/LocationMap'), { ssr: false }); // Heavy iframe map, no SSR
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

export default function Home() {
  return (
    <SmoothScroll>
      <main>
        <Navbar />
      <Hero />
      <StatsBanner />
      <CommunityBanner />
      <PremiumCampuses />
      <FeaturesGrid />
      <DayInTheLife />
      <Testimonials />
      <LocationMap />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
