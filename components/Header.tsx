
import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import RulesModal from './RulesModal';

const Header = () => {
  const { sponsors, auctionState, auctionConfig } = useAuction();
  const [showRules, setShowRules] = useState(false);
  
  const activeSponsors = sponsors.filter(s => s.isVisible);
  const titleSponsor = activeSponsors.find(s => s.type === 'Title');
  const poweredBySponsors = activeSponsors.filter(s => s.type === 'PoweredBy');
  
  const tickerContent = (
    <div className="flex items-center shrink-0">
      <div className="flex items-center gap-4 px-6 border-r border-white/10 h-full bg-indigo-900/30">
         <span className="text-yellow-400 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap shrink-0">Live Status:</span>
         <span className="text-sm font-['Teko'] uppercase tracking-wider whitespace-nowrap shrink-0 text-white shadow-sm">{auctionState.lastActionMessage}</span>
      </div>

      <div className="flex items-center gap-8 px-6 h-full bg-slate-800/50">
        {titleSponsor && (
            <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                <span className="text-gray-500 font-bold uppercase text-[9px]">Title:</span>
                <span className="text-yellow-500 font-bold uppercase text-xs tracking-wider">{titleSponsor.name}</span>
            </div>
        )}
        
        {poweredBySponsors.map(s => (
            <div key={s.id} className="flex items-center gap-2 whitespace-nowrap shrink-0">
                <span className="text-gray-500 font-bold uppercase text-[9px]">CO-POWERED BY:</span>
                <span className="text-white font-bold uppercase text-xs tracking-wider">{s.name}</span>
            </div>
        ))}

        {activeSponsors.length === 0 && (
            <span className="text-gray-500 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap shrink-0">{auctionConfig.title} Official Broadcast</span>
        )}
      </div>
    </div>
  );

  return (
    <header className="flex flex-col w-full z-[100]">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 h-16 flex items-center justify-between px-4 border-b-4 border-yellow-500 shadow-lg relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-24 h-full bg-white/5 skew-x-12 -ml-8"></div>
        <div className="absolute top-0 right-0 w-24 h-full bg-white/5 -skew-x-12 -mr-8"></div>

        <div className="flex items-center gap-3 z-10">
          {titleSponsor && (
             <div className="bg-white p-1.5 rounded shadow-inner group transition-all hover:scale-105">
                <img src={titleSponsor.logo} alt={titleSponsor.name} className="h-8 object-contain" />
             </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-['Teko'] leading-none">
              {auctionConfig.title}
            </h1>
            <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-[0.2em] ml-0.5">{auctionConfig.subTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button 
            onClick={() => setShowRules(true)}
            className="flex flex-col items-center gap-0.5 group"
          >
             <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all group-hover:border-yellow-500">
                <svg className="w-4 h-4 text-white group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
             </div>
             <span className="text-[7px] font-bold text-white/60 uppercase tracking-widest group-hover:text-yellow-500 transition-colors">Rules</span>
          </button>

          <div className="text-right mr-2 hidden md:block border-l border-white/20 pl-3">
            <div className="text-[10px] text-yellow-400 font-bold uppercase">{auctionConfig.broadcastLabel}</div>
            <div className="text-[11px] font-semibold text-gray-300">{auctionConfig.location}</div>
          </div>
          <div className="relative">
            <div className="h-8 w-8 bg-red-600 rounded-full animate-pulse flex items-center justify-center font-bold text-[9px] shadow-lg border-2 border-white z-10 relative">
                LIVE
            </div>
            <div className="absolute inset-0 rounded-full bg-red-500/50 animate-ping"></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 text-white h-8 flex items-center overflow-hidden border-b border-white/10 shadow-inner relative">
        <div className="bg-red-700 px-3 h-full flex items-center font-bold uppercase z-30 shadow-[12px_0_20px_rgba(0,0,0,0.9)] whitespace-nowrap border-r border-red-500 relative">
            <span className="animate-pulse mr-2 text-[10px]">●</span> <span className="text-[10px]">{auctionConfig.tickerPrefix}</span>
        </div>
        
        <div className="flex-1 h-full overflow-hidden flex relative">
            <div className="flex w-max animate-marquee-fast h-full items-center">
               {tickerContent}
               {tickerContent}
               {tickerContent}
               {tickerContent}
            </div>
        </div>
      </div>
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />

      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); } 
        }
        .animate-marquee-fast {
          animation: marquee-fast 18s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;