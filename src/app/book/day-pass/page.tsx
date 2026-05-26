import DayPassWizard from '@/components/booking/DayPassWizard';
import Navbar from '@/components/Navbar';

export default function DayPassBookingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ 
        flexGrow: 1, 
        backgroundColor: '#888f99', 
        paddingTop: 'calc(var(--header-height) + var(--space-xl))',
        paddingBottom: 'var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - var(--header-height))'
      }}>
        <DayPassWizard />
      </main>
    </div>
  );
}

