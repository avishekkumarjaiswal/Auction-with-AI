import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { PlayerStatus } from '../types';
import { getPlayerAnalysis } from '../services/geminiService';

interface AnalysisData {
    text: string;
    sources: { uri: string; title: string }[];
}

const RightSidebar = () => {
  const { auctionState, players, teams, getCurrentPlayer, sponsors } = useAuction();
  const [activeTab, setActiveTab] = useState<'live' | 'stats' | 'history' | 'ratings'>('live');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  const currentPlayer = getCurrentPlayer();
  
  const poweredBySponsor = sponsors.find(s => s.isVisible && (s.type === 'PoweredBy' || s.type === 'Title')) || sponsors[0];

  useEffect(() => {
    setAnalysisData(null);
  }, [currentPlayer?.id]);

  const handleAnalysis = async () => {
    if (!currentPlayer) return;
    setLoadingAnalysis(true);
    try {
        const data = await getPlayerAnalysis(currentPlayer.name);
        setAnalysisData(data);
    } catch (e) {
        setAnalysisData({ text: "Failed to load analysis.", sources: [] });
    }
    setLoadingAnalysis(false);
  };

  const processedPlayers = players
      .filter(p => p.status === PlayerStatus.Sold || p.status === PlayerStatus.Unsold)
      .sort((a, b) => (b.soldTimestamp || 0) - (a.soldTimestamp || 0));

  // Calculate team ratings for leaderboard
  const sortedTeams = [...teams].map(t => ({
      ...t,
      totalRating: t.squad.reduce((sum, p) => sum + p.rating, 0)
  })).sort((a, b) => b.totalRating - a.totalRating);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs - UNIFIED HEADER HEIGHT h-10 */}
      <div className="flex border-b border-gray-200 bg-white h-10 shrink-0">
        <button 
            onClick={() => setActiveTab('live')} 
            className={`flex-1 text-[11px] font-bold uppercase tracking-widest transition-all broadcast-title ${activeTab === 'live' ? 'text-indigo-800 border-b-2 border-indigo-800 bg-indigo-50/20' : 'text-gray-400 hover:text-gray-600'}`}
        >
            Bidding War
        </button>
        <button 
            onClick={() => setActiveTab('history')} 
            className={`flex-1 text-[11px] font-bold uppercase tracking-widest transition-all broadcast-title ${activeTab === 'history' ? 'text-indigo-800 border-b-2 border-indigo-800 bg-indigo-50/20' : 'text-gray-400 hover:text-gray-600'}`}
        >
            History
        </button>
        <button 
            onClick={() => setActiveTab('ratings')} 
            className={`flex-1 text-[11px] font-bold uppercase tracking-widest transition-all broadcast-title whitespace-nowrap ${activeTab === 'ratings' ? 'text-indigo-800 border-b-2 border-indigo-800 bg-indigo-50/20' : 'text-gray-400 hover:text-gray-600'}`}
        >
            Rating Table
        </button>
        <button 
            onClick={() => setActiveTab('stats')} 
            className={`flex-1 text-[11px] font-bold uppercase tracking-widest transition-all broadcast-title ${activeTab === 'stats' ? 'text-indigo-800 border-b-2 border-indigo-800 bg-indigo-50/20' : 'text-gray-400 hover:text-gray-600'}`}
        >
            AI Analysis
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'live' && (
              <>
                <div className="bg-slate-900 text-white h-7 flex items-center justify-center shrink-0 border-b border-white/10">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em]">Real-Time Event Logs</h3>
                </div>
                <div className="flex-[2] overflow-y-auto p-2 space-y-1.5 bg-slate-50 border-b border-gray-200 min-h-[120px] scrollbar-hide">
                    {auctionState.bids.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400 text-[10px] italic font-bold uppercase tracking-widest">
                            <div className="text-xl mb-1 opacity-20">🔨</div>
                            <span>Awaiting Opening Bid...</span>
                        </div>
                    ) : (
                        auctionState.bids.map((bid, idx) => {
                             const rank = auctionState.bids.length - idx;
                             return (
                                <div key={bid.id} className="flex justify-between items-center p-2 rounded bg-white border border-gray-200 shadow-sm transition h-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-gray-500 border border-gray-200">
                                            {rank}
                                        </div>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <img src={bid.teamLogo} className="w-3.5 h-3.5 object-contain shrink-0" />
                                            <span className="text-[12px] font-bold text-indigo-900 uppercase broadcast-title tracking-wider truncate leading-none">{bid.teamName}</span>
                                        </div>
                                    </div>
                                    <span className="text-[12px] font-bold text-slate-800 broadcast-title bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shrink-0">₹{bid.amount.toFixed(2)} Cr</span>
                                </div>
                             );
                        })
                    )}
                </div>
                
                <div className="bg-slate-800 text-white h-7 flex items-center justify-center shrink-0">
                    <h3 className="text-[9px] font-bold uppercase tracking-[0.2em]">Session Activity Log</h3>
                </div>
                <div className="flex-[3] overflow-y-auto bg-white min-h-0 scrollbar-hide">
                     <div className="w-full">
                         <div className="flex bg-slate-100 text-[8px] uppercase text-gray-500 font-extrabold px-3 py-1 border-b border-gray-200 sticky top-0 z-10">
                             <div className="flex-1">Player</div>
                             <div className="w-24 text-right">Status</div>
                         </div>
                         {processedPlayers.slice(0, 20).map(p => {
                            const soldTeam = teams.find(t => t.id === p.teamId);
                            const isSold = p.status === PlayerStatus.Sold;
                            return (
                                <div key={p.id} className="flex justify-between items-center px-3 py-1.5 border-b border-gray-50 hover:bg-slate-50 transition-colors h-10">
                                    <div className="flex flex-col leading-tight overflow-hidden">
                                        <span className="text-[11px] font-bold text-slate-800 uppercase broadcast-title tracking-wide truncate">{p.name}</span>
                                        <span className={`text-[7px] font-extrabold uppercase ${isSold ? 'text-green-600' : 'text-red-500'}`}>
                                            {isSold ? `✓ SOLD: ${soldTeam?.shortName}` : '✗ UNSOLD'}
                                        </span>
                                    </div>
                                    <div className="text-right flex flex-col items-end shrink-0">
                                        <span className={`text-[11px] font-bold broadcast-title tracking-wide ${isSold ? 'text-slate-900' : 'text-red-600'}`}>
                                            {isSold ? `₹${p.soldPrice} Cr` : '-'}
                                        </span>
                                        <span className="text-[7px] text-gray-400 font-extrabold uppercase">
                                            {p.soldTimestamp ? new Date(p.soldTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                        </span>
                                    </div>
                                </div>
                            );
                         })}
                     </div>
                </div>
              </>
          )}

          {activeTab === 'ratings' && (
              <div className="flex-1 bg-white flex flex-col min-h-0">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-slate-50/50 shrink-0">
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Franchise</span>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Rating</span>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                      {sortedTeams.map((t, idx) => (
                          <div key={t.id} className="flex justify-between items-center px-3 py-2 border-b border-gray-50 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                  <span className={`font-bold text-[10px] w-4 text-center ${idx < 3 ? 'text-indigo-600' : 'text-slate-400'}`}>{idx+1}</span>
                                  <div className="flex items-center gap-2">
                                      <img src={t.logo} className="w-6 h-6 object-contain" />
                                      <div className="flex flex-col leading-none">
                                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-tight">{t.name}</span>
                                          <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{t.squad.length} Players</span>
                                      </div>
                                  </div>
                              </div>
                              <span className="font-bold bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100 text-[10px]">★ {t.totalRating}</span>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {activeTab === 'history' && (
              <div className="flex-1 p-3 bg-white overflow-y-auto scrollbar-hide">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-slate-800 broadcast-title uppercase tracking-widest">Auction History</h3>
                    <div className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Archive</div>
                  </div>
                  <div className="space-y-2">
                      {processedPlayers.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-[9px] font-bold uppercase italic tracking-widest">
                               <div className="text-6xl mb-2 opacity-20 grayscale">📜</div>
                               No Data.
                          </div>
                      ) : (
                          processedPlayers.map(p => {
                               const isSold = p.status === PlayerStatus.Sold;
                               const team = teams.find(t => t.id === p.teamId);
                               return (
                                   <div key={p.id} className="flex items-start gap-2 p-2 rounded-lg border border-gray-100 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                                       <div className={`w-6 h-6 flex items-center justify-center shrink-0 rounded-full border ${isSold ? 'bg-green-500 border-green-700' : 'bg-red-100 border-red-200 shadow-inner'}`}>
                                           {isSold ? (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                           ) : (
                                                <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                           )}
                                       </div>
                                       <div className="flex-1 leading-tight">
                                           <div className="text-[12px] font-bold uppercase text-slate-900 broadcast-title tracking-wide">{p.name}</div>
                                           <div className="text-[8px] text-slate-500 uppercase mt-0.5 font-bold tracking-tight">
                                                {isSold ? (
                                                    <span>Sold to <span className="text-indigo-700 font-extrabold">{team?.name}</span></span>
                                                ) : (
                                                    <span className="text-red-500 font-extrabold">Unsold</span>
                                                )}
                                           </div>
                                           {isSold && (
                                               <div className="mt-1 text-[12px] font-bold text-green-700 broadcast-title tracking-wider">
                                                   Price: ₹{p.soldPrice} Cr
                                               </div>
                                           )}
                                       </div>
                                   </div>
                               );
                          })
                      )}
                  </div>
              </div>
          )}

          {activeTab === 'stats' && (
              <div className="flex-1 p-3 bg-slate-50 overflow-y-auto scrollbar-hide">
                 {currentPlayer ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-md">
                             <img src={currentPlayer.image} className="w-12 h-12 rounded object-cover border-2 border-slate-100 shrink-0 shadow-sm" />
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-slate-900 broadcast-title text-xl uppercase tracking-wide leading-none mb-1 truncate">{currentPlayer.name}</h4>
                                 <div className="flex items-center gap-2">
                                     <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">{currentPlayer.role}</span>
                                     <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{currentPlayer.nationality}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md relative group">
                            <h5 className="text-[9px] font-extrabold text-gray-500 uppercase mb-2 flex items-center justify-between tracking-widest">
                                <span className="flex items-center gap-1"><span className="text-indigo-600">✦</span> Insight</span>
                                <span className="text-[7px] text-gray-400 lowercase italic opacity-60">data by {poweredBySponsor?.name}</span>
                            </h5>
                            
                            {!analysisData ? (
                                <div className="text-center py-6 bg-slate-50 rounded border border-dashed border-gray-300">
                                    <p className="text-[10px] text-gray-500 mb-3 px-4 leading-relaxed font-bold uppercase tracking-tighter">Strategic valuation based on performance metrics.</p>
                                    <button 
                                        onClick={handleAnalysis}
                                        disabled={loadingAnalysis}
                                        className="bg-indigo-700 hover:bg-indigo-800 text-white text-[10px] font-bold py-2 px-4 rounded text-center transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.25em] broadcast-title shadow-lg"
                                    >
                                        {loadingAnalysis ? 'Loading...' : 'AI Analysis'}
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-fadeIn">
                                    <div className="p-2 bg-indigo-50/50 rounded border-l-4 border-indigo-500">
                                        <p className="text-[11px] text-slate-800 leading-relaxed font-bold">
                                            "{analysisData.text}"
                                        </p>
                                    </div>
                                    
                                    {/* Sources Display */}
                                    {analysisData.sources.length > 0 && (
                                        <div className="mt-2 pl-1">
                                            <p className="text-[8px] text-gray-500 uppercase font-bold tracking-wider mb-1">Sources:</p>
                                            <ul className="space-y-1">
                                                {analysisData.sources.map((source, index) => (
                                                    <li key={index} className="truncate">
                                                        <a 
                                                            href={source.uri} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-[9px] text-blue-600 hover:underline flex items-center gap-1 truncate"
                                                        >
                                                            <span className="text-gray-400">🔗</span> {source.title}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="mt-3 flex justify-between items-center">
                                        <button 
                                            onClick={() => setAnalysisData(null)}
                                            className="text-[8px] text-gray-400 font-extrabold uppercase hover:text-red-500 tracking-widest"
                                        >
                                            Dismiss
                                        </button>
                                        <div className="flex items-center gap-1 grayscale opacity-50 text-[8px] font-bold uppercase text-gray-400">
                                            powered by <span className="font-extrabold text-indigo-900">{poweredBySponsor?.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-md">
                             <h5 className="text-[9px] font-extrabold text-gray-500 uppercase mb-3 tracking-widest">Player Stats</h5>
                             <div className="grid grid-cols-2 gap-3">
                                 <div className="bg-slate-50 p-2 rounded-lg border border-gray-100 text-center shadow-inner">
                                     <span className="block text-[8px] text-gray-400 uppercase font-extrabold mb-1 tracking-widest">Rank</span>
                                     <div className="flex items-center justify-center gap-1 leading-none">
                                         <span className="font-bold text-2xl text-slate-900 broadcast-title">{currentPlayer.rating}</span>
                                         <span className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">/ 100</span>
                                     </div>
                                 </div>
                                 <div className="bg-slate-50 p-2 rounded-lg border border-gray-100 text-center shadow-inner">
                                     <span className="block text-[8px] text-gray-400 uppercase font-extrabold mb-1 tracking-widest">Base</span>
                                     <div className="flex items-center justify-center gap-1 leading-none">
                                         <span className="font-bold text-2xl text-emerald-700 broadcast-title">₹{currentPlayer.basePrice}</span>
                                         <span className="text-[9px] text-emerald-600 font-bold uppercase mb-0.5">Cr</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner border border-gray-100">
                             <div className="text-2xl opacity-20 grayscale">🛡️</div>
                         </div>
                         <div className="text-center space-y-0.5">
                             <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">AI Analysis</p>
                             <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Select player to view</p>
                         </div>
                     </div>
                 )}
              </div>
          )}
      </div>
    </div>
  );
};

export default RightSidebar;