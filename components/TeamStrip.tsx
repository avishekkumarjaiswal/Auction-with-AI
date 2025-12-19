
import React from 'react';
import { useAuction } from '../context/AuctionContext';

const TeamStrip = () => {
  const { teams } = useAuction();

  return (
    <div className="w-full bg-slate-800 border-b border-slate-700 p-1.5 shadow-md z-30 relative shrink-0">
      {/* Mobile: Horizontal Scroll | Desktop: Grid */}
      <div className="flex md:grid md:grid-cols-5 gap-1.5 overflow-x-auto md:overflow-visible scrollbar-hide snap-x">
        {teams.map((team) => {
          const indianCount = team.squad.filter(p => p.nationality === 'India').length;
          const foreignCount = team.squad.length - indianCount;
          const totalRating = team.squad.reduce((sum, p) => sum + p.rating, 0);
          
          return (
            <div 
              key={team.id} 
              className="flex items-center gap-2 bg-white rounded p-1 shadow-sm overflow-hidden min-h-[36px] min-w-[140px] md:min-w-0 transition-transform hover:scale-[1.02] snap-start border border-slate-100"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-50 p-0.5 shrink-0 border border-gray-100`}>
                <img src={team.logo} alt={team.shortName} className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0 justify-center w-full">
                <span className="text-slate-900 font-bold text-[9px] uppercase leading-tight mb-0.5 line-clamp-2 md:truncate whitespace-normal md:whitespace-nowrap">{team.name}</span>
                <div className="flex items-center justify-between pr-1">
                   <span className="text-slate-700 font-bold font-mono text-[9px]">₹{team.budget.toFixed(2)} Cr</span>
                   <div className="flex items-center gap-1">
                      {/* Total Rating Badge */}
                      <div className="hidden sm:flex items-center gap-0.5 text-[9px] font-bold bg-yellow-50 px-1 rounded leading-none py-0.5 border border-yellow-100" title="Total Squad Rating">
                          <span className="text-yellow-600">★</span>
                          <span className="text-slate-700">{totalRating}</span>
                      </div>
                      {/* Composition Badge */}
                      <div className="flex items-center gap-0.5 text-[9px] font-bold bg-slate-100 px-1 rounded leading-none py-0.5" title="Indian / Foreign">
                          <span className="text-blue-700">{indianCount}</span>
                          <span className="text-slate-400 text-[8px]">/</span>
                          <span className="text-orange-600">{foreignCount}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamStrip;
