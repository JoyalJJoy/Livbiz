import DayPassWizard from '@/components/booking/DayPassWizard';
import Navbar from '@/components/Navbar';

export default function DayPassBookingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ 
        flexGrow: 1, 
        backgroundColor: '#888f99', 
        paddingTop: '160px',
        paddingBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 160px)'
      }}>
        <DayPassWizard />
      </main>
    </div>
  );
}

