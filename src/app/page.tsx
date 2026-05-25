import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StatsBanner from '@/components/StatsBanner';
import CommunityBanner from '@/components/CommunityBanner';
import FeaturesGrid from '@/components/FeaturesGrid';
import PremiumCampuses from '@/components/PremiumCampuses';
import DayInTheLife from '@/components/DayInTheLife';
import Testimonials from '@/components/Testimonials';
import LocationMap from '@/components/LocationMap';
import Footer from '@/components/Footer';

export default function Home() {
  return (
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
  );
}
