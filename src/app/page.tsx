import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PremiumCampuses from '@/components/PremiumCampuses';
import DayInTheLife from '@/components/DayInTheLife';
// import FeaturesGrid from '@/components/FeaturesGrid';
import GoogleReviews from '@/components/GoogleReviews';
import LocationMap from '@/components/LocationMap';
import Footer from '@/components/Footer';
import BookCtaBanner from '@/components/BookCtaBanner';
import HashScroll from '@/components/HashScroll';

export default function Home() {
  return (
    <main>
      <HashScroll />
      <Navbar />
      <Hero />
      <BookCtaBanner />
      <PremiumCampuses />
      <DayInTheLife />
      {/* <FeaturesGrid /> */}
      <GoogleReviews />
      <LocationMap />
      <Footer />
    </main>
  );
}
