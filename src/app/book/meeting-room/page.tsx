import MeetingRoomWizard from '@/components/booking/MeetingRoomWizard';
import Navbar from '@/components/Navbar';

export default function MeetingRoomPage() {
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
        <style>{`
          @media (max-width: 768px) {
            main { padding-top: 80px !important; min-height: calc(100vh - 80px) !important; }
          }
          @media (max-width: 480px) {
            main { padding-top: 70px !important; min-height: calc(100vh - 70px) !important; }
          }
        `}</style>
        <MeetingRoomWizard />
      </main>
    </div>
  );
}
