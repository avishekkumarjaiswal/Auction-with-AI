import React, { useEffect, useState } from 'react';
import { useAuction } from '../context/AuctionContext';

const SponsorSidebar = () => {
  const { sponsors } = useAuction();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isAdmin = hash.includes('admin');
  const isPlayer = hash.includes('player');
  const isViewer = !isAdmin && !isPlayer;

  // Filter sponsors by type and visibility
  const visibleSponsors = sponsors.filter(s => s.isVisible);
  const titleSponsor = visibleSponsors.find(s => s.type === 'Title');
  const poweredBySponsors = visibleSponsors.filter(s => s.type === 'PoweredBy');
  const associateSponsors = visibleSponsors.filter(s => s.type === 'Associate');

  return (
    <div className="h-full bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

        {/* Interface Mode Switcher */}
        <div className="p-4 z-10 shrink-0">
             <div className="bg-slate-800/90 backdrop-blur p-2 rounded-lg border border-slate-600 shadow-xl flex flex-col gap-2">
                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    View Switcher
                </div>
                <div className="flex gap-1">
                     <button onClick={() => window.location.hash = '#/'} className={`flex-1 py-1.5 text-[9px] font-bold rounded uppercase transition border ${isViewer ? 'bg-indigo-600 text-white border-indigo-500 shadow-inner' : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border-slate-600'}`}>Viewer</button>
                     <button onClick={() => window.location.hash = '#/player'} className={`flex-1 py-1.5 text-[9px] font-bold rounded uppercase transition border ${isPlayer ? 'bg-indigo-600 text-white border-indigo-500 shadow-inner' : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border-slate-600'}`}>Player</button>
                     <button onClick={() => window.location.hash = '#/admin'} className={`flex-1 py-1.5 text-[9px] font-bold rounded uppercase transition border ${isAdmin ? 'bg-indigo-600 text-white border-indigo-500 shadow-inner' : 'bg-slate-700 text-gray-300 hover:bg-slate-600 border-slate-600'}`} title="Go to Admin Panel">Admin</button>
                </div>
            </div>
        </div>

        <div className="w-full h-px bg-slate-800 mb-2"></div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scrollbar-hide">
            
            {/* Title Sponsor */}
            {titleSponsor && (
                <div className="text-center relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50"></div>
                    <h3 className="relative inline-block bg-slate-900 px-3 text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Title Sponsor</h3>
                    
                    <div className="bg-gradient-to-b from-white to-gray-100 rounded-xl p-3 shadow-[0_0_25px_rgba(234,179,8,0.2)] border-2 border-yellow-500/60 transform transition hover:scale-105 duration-500 relative overflow-hidden group cursor-pointer h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100/50 to-white/0 opacity-0 group-hover:opacity-100 transition duration-700"></div>
                        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded-bl shadow-sm z-20">PREMIER</div>
                        <img src={titleSponsor.logo} alt={titleSponsor.name} className="w-full max-h-full object-contain relative z-10 drop-shadow-lg" />
                        <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] group-hover:animate-shine"></div>
                    </div>
                </div>
            )}

            {/* Powered By */}
            {poweredBySponsors.length > 0 && (
                <div className="text-center">
                    <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 bg-gradient-to-r from-transparent via-blue-900/20 to-transparent py-1">Co-Powered By</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {poweredBySponsors.map(s => (
                            <div key={s.id} className="bg-white rounded-lg p-2 shadow-md border-l-4 border-blue-500 hover:bg-blue-50 transition duration-300 group flex items-center justify-center h-14">
                                 <img src={s.logo} alt={s.name} className="max-h-full max-w-[80%] object-contain filter drop-shadow group-hover:scale-110 transition-transform" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Associate Partners */}
            {associateSponsors.length > 0 && (
                <div className="text-center">
                    <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Associate Partners</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {associateSponsors.map(s => (
                            <div key={s.id} className="bg-white rounded p-1 border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition duration-300 flex items-center justify-center h-12 group shadow-sm">
                                 <img src={s.logo} alt={s.name} className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center shrink-0">
            <p className="text-[10px] text-slate-500 font-['Teko'] uppercase tracking-widest">Developed by Avishek Kumar Jaiswal</p>
        </div>

        <style>{`
            @keyframes shine {
                0% { left: -100%; }
                100% { left: 200%; }
            }
            .animate-shine {
                animation: shine 1.5s ease-in-out;
            }
        `}</style>
    </div>
  );
};

export default SponsorSidebar;