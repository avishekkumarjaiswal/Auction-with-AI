
import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import TeamStrip from './components/TeamStrip';
import PlayerCard from './components/PlayerCard';
import BiddingPanel from './components/BiddingPanel';
import AdminDashboard from './components/AdminDashboard';
import RightSidebar from './components/RightSidebar';
import SponsorSidebar from './components/SponsorSidebar';
import { AuctionProvider, useAuction } from './context/AuctionContext';

const AppContent = () => {
  const { isLoading } = useAuction();
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) {
      return (
          <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse"></div>
              <div className="z-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <h2 className="text-2xl font-bold font-['Teko'] uppercase tracking-[0.2em] animate-pulse">Connecting to Auction Server...</h2>
                  <p className="text-[10px] text-slate-500 font-mono">Initializing Secure Handshake</p>
              </div>
          </div>
      )
  }

  const isAdmin = route.includes('admin');
  const isPlayer = route.includes('player');
  const isViewer = !isAdmin && !isPlayer;

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-gray-100 text-slate-900 font-sans md:overflow-hidden overflow-y-auto">
      <Header />
      <TeamStrip />

      {/* Main 3-Column Layout */}
      <div className="flex-1 md:overflow-hidden grid grid-cols-12 gap-0 relative min-h-0">
        
        {/* COL 1: Left Sidebar (Admin or Sponsors) - HIDDEN ON MOBILE */}
        <div className="hidden md:block col-span-2 h-full overflow-hidden border-r border-gray-300 bg-slate-900 z-20 shadow-xl">
             {isAdmin ? <AdminDashboard /> : <SponsorSidebar />}
        </div>

        {/* COL 2: Center Stage */}
        <div className="col-span-12 md:col-span-7 h-auto md:h-full flex flex-col p-2 bg-gray-200 gap-4 md:gap-2 md:overflow-hidden overflow-visible">
            
            {/* MOBILE ADMIN VIEW: Render Dashboard here if on mobile and admin route */}
            {isAdmin ? (
                <>
                    <div className="block md:hidden h-[85vh] w-full">
                        <AdminDashboard />
                    </div>
                    {/* Desktop placeholder to keep layout consistent if needed, but we use conditional rendering */}
                    <div className="hidden md:flex flex-col h-full gap-2">
                        <div className="h-[55%] w-full min-h-0">
                            <PlayerCard />
                        </div>
                        <div className="h-[45%] w-full min-h-0">
                            <BiddingPanel initialViewerMode={isViewer} isAdmin={isAdmin} />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* PLAYER/VIEWER VIEW */}
                    {/* Mobile: Use aspect ratio or flex grow to ensure it fits nicely without forcing scroll if possible */}
                    <div className="h-auto md:h-[55%] w-full shrink-0 aspect-video md:aspect-auto">
                        <PlayerCard />
                    </div>
                    <div className="h-auto min-h-[500px] md:min-h-0 md:h-[45%] w-full shrink-0 pb-20 md:pb-0">
                        <BiddingPanel initialViewerMode={isViewer} isAdmin={isAdmin} />
                    </div>
                </>
            )}
        </div>

        {/* COL 3: Right Sidebar (History) - HIDDEN ON MOBILE */}
        <div className="hidden md:block col-span-3 h-full p-2 bg-white border-l border-gray-200 overflow-hidden relative z-10">
            <RightSidebar />
        </div>
      </div>
      
      {/* Mobile Mode Toggle */}
      <div className="fixed bottom-4 left-4 z-50 md:hidden">
          {isAdmin ? (
             <a href="#/" className="bg-red-600 hover:bg-red-700 shadow-xl text-[10px] font-bold px-4 py-2.5 rounded-full text-white border-2 border-white flex items-center gap-2 backdrop-blur-sm">
                <span>Exit Admin</span>
             </a>
          ) : (
             <a href="#/admin" className="bg-slate-800 hover:bg-slate-700 shadow-xl text-[10px] font-bold px-4 py-2.5 rounded-full text-white border-2 border-white flex items-center gap-2 backdrop-blur-sm">
                <span>🔐 Admin Access</span>
             </a>
          )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuctionProvider>
      <AppContent />
    </AuctionProvider>
  );
};

export default App;
