import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StatsBanner from '@/components/StatsBanner';
import CommunityBanner from '@/components/CommunityBanner';
import PremiumCampuses from '@/components/PremiumCampuses';
import FeaturesGrid from '@/components/FeaturesGrid';
import DayInTheLife from '@/components/DayInTheLife';
import Testimonials from '@/components/Testimonials';
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
      <Footer />
    </main>
  );
}
