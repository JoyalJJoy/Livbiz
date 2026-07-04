import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FeaturesGrid from '@/components/FeaturesGrid';
import PremiumCampuses from '@/components/PremiumCampuses';
import DayInTheLife from '@/components/DayInTheLife';
import Testimonials from '@/components/Testimonials';
import GoogleReviews from '@/components/GoogleReviews';
import LocationMap from '@/components/LocationMap';
import Footer from '@/components/Footer';
import BookCtaBanner from '@/components/BookCtaBanner';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <BookCtaBanner />
      <FeaturesGrid />
      <PremiumCampuses />
      <DayInTheLife />
      <Testimonials />
      <GoogleReviews />
      <LocationMap />
      <Footer />
    </main>
  );
}
