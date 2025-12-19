
import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Player, Team, PlayerStatus } from '../types';

const PlayersMarketView = ({ players, teams }: { players: Player[], teams: Team[] }) => {
    const [view, setView] = useState<'Pool' | 'Sold' | 'Unsold'>('Pool');
    
    // Sort upcoming players by ID or order to keep them consistent
    const displayedPlayers = players.filter(p => {
        if (view === 'Sold') return p.status === PlayerStatus.Sold;
        if (view === 'Unsold') return p.status === PlayerStatus.Unsold;
        if (view === 'Pool') return p.status === PlayerStatus.Upcoming;
        return false;
    });

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-2 border-b border-gray-100 bg-slate-50">
                <select 
                    className="w-full text-[10px] font-bold uppercase tracking-wider border-gray-200 border rounded p-1.5 text-slate-700 bg-white focus:outline-none"
                    value={view}
                    onChange={(e) => setView(e.target.value as 'Pool' | 'Sold' | 'Unsold')}
                >
                    <option value="Pool">UPCOMING POOL ({players.filter(p => p.status === PlayerStatus.Upcoming).length})</option>
                    <option value="Sold">SUCCESSFUL BIDS ({players.filter(p => p.status === PlayerStatus.Sold).length})</option>
                    <option value="Unsold">UNSOLD POOL ({players.filter(p => p.status === PlayerStatus.Unsold).length})</option>
                </select>
            </div>
            <div className="flex-1 overflow-auto scrollbar-hide">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-slate-900 sticky top-0 z-10 text-white h-8">
                        <tr>
                            <th className="px-3 text-[9px] font-bold uppercase tracking-wider w-[45%]">Player</th>
                            <th className="px-2 text-[9px] font-bold uppercase tracking-wider text-center w-[15%]">Role</th>
                            <th className="px-2 text-[9px] font-bold uppercase tracking-wider text-center w-[10%]">Rat.</th>
                            <th className="px-3 text-[9px] font-bold uppercase tracking-wider text-right w-[30%]">
                                {view === 'Sold' ? 'Sold Price' : 'Base Price'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedPlayers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center flex flex-col items-center justify-center text-[10px] text-gray-400 font-bold uppercase tracking-widest h-40">
                                    <div className="text-2xl mb-2 opacity-30">📁</div>
                                    {view === 'Pool' ? 'No Players Remaining' : view === 'Sold' ? 'No Sales Yet' : 'No Unsold Players'}
                                </td>
                            </tr>
                        ) : (
                            displayedPlayers.map((p) => {
                                const team = teams.find(t => t.id === p.teamId);
                                return (
                                    <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors h-10">
                                        <td className="px-3">
                                            <div className="text-[11px] font-bold text-slate-900 uppercase broadcast-title leading-tight">{p.name}</div>
                                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{p.nationality}</div>
                                        </td>
                                        <td className="px-2 text-center text-[9px] font-bold text-slate-500 uppercase">{p.role.slice(0,3)}</td>
                                        <td className="px-2 text-center text-[11px] font-bold text-indigo-600 broadcast-title">{p.rating}</td>
                                        <td className="px-3 text-right">
                                            <div className="text-[11px] font-bold text-slate-900 leading-none broadcast-title tracking-wide">₹{(view === 'Sold' ? p.soldPrice : p.basePrice)?.toFixed(2)} Cr</div>
                                            {view === 'Sold' && team && <div className="text-[7px] font-bold text-indigo-700 uppercase mt-0.5">{team.shortName}</div>}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TeamSquadView = ({ teams }: { teams: Team[] }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    // Ensure we have a valid selection even if teams array changes
    useEffect(() => {
        if (!selectedTeam && teams.length > 0) setSelectedTeamId(teams[0].id);
    }, [teams, selectedTeam]);

    if (!selectedTeam) return <div className="p-4 text-[11px] uppercase font-bold text-gray-400">Loading Registry...</div>;

    const squad = selectedTeam.squad || [];
    const batters = squad.filter(p => p.role === 'Batsman').length;
    const bowlers = squad.filter(p => p.role === 'Bowler').length;
    const allrounders = squad.filter(p => p.role === 'All-Rounder').length;
    const wks = squad.filter(p => p.role === 'Wicketkeeper').length;
    const domestic = squad.filter(p => p.nationality === 'India').length;
    const overseas = squad.length - domestic;
    const totalRating = squad.reduce((acc, p) => acc + p.rating, 0);

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-2 border-b border-gray-100 bg-slate-50 space-y-2">
                <select 
                    className="w-full text-[10px] font-bold uppercase tracking-wider border-gray-200 border rounded p-1.5 text-slate-700 bg-white focus:outline-none shadow-sm"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                
                <div className="grid grid-cols-7 gap-0.5">
                    <div className="bg-white border border-gray-200 p-1 rounded text-center shadow-sm">
                        <div className="text-[6px] text-gray-400 uppercase font-extrabold leading-tight">BATTERS</div>
                        <div className="text-[11px] font-bold text-slate-800 broadcast-title">{batters}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-1 rounded text-center shadow-sm">
                        <div className="text-[6px] text-gray-400 uppercase font-extrabold leading-tight">BOWLERS</div>
                        <div className="text-[11px] font-bold text-slate-800 broadcast-title">{bowlers}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-1 rounded text-center shadow-sm">
                        <div className="text-[6px] text-gray-400 uppercase font-extrabold leading-tight">ALL-RND</div>
                        <div className="text-[11px] font-bold text-slate-800 broadcast-title">{allrounders}</div>
                    </div>
                    <div className="bg-white border border-gray-200 p-1 rounded text-center shadow-sm">
                        <div className="text-[6px] text-gray-400 uppercase font-extrabold leading-tight">KEEPERS</div>
                        <div className="text-[11px] font-bold text-slate-800 broadcast-title">{wks}</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-1 rounded text-center shadow-sm">
                        <div className="text-[6px] text-blue-500 uppercase font-extrabold leading-tight">INDIANS</div>
                        <div className="text-[11px] font-bold text-blue-800 broadcast-title">{domestic}</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 p-1 rounded text-center shadow-sm">
                        <div className="text-[6px] text-orange-500 uppercase font-extrabold leading-tight">OVERSEAS</div>
                        <div className="text-[11px] font-bold text-orange-800 broadcast-title">{overseas}</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-1 rounded text-center shadow-sm">
                        <div className="text-[6px] text-yellow-600 uppercase font-extrabold leading-tight">RATING</div>
                        <div className="text-[11px] font-bold text-yellow-800 broadcast-title">{totalRating}</div>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-indigo-900 px-3 py-1.5 rounded-md border border-indigo-700 shadow-md">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-indigo-300 uppercase font-bold tracking-widest">Available Purse</span>
                        <span className="text-xs font-bold text-emerald-400 broadcast-title tracking-widest">₹{selectedTeam.budget.toFixed(2)} Cr</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[8px] text-indigo-300 uppercase font-bold tracking-widest">Squad Load</span>
                        <span className="text-xs font-bold text-white broadcast-title tracking-widest">{squad.length} <span className="text-[9px] opacity-40">/ 25</span></span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto scrollbar-hide">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-slate-100 sticky top-0 z-10 h-7">
                        <tr>
                            <th className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest w-[60%]">Player Name</th>
                            <th className="px-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center w-[10%]">Rat.</th>
                            <th className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right w-[30%]">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                         {squad.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-[10px] text-gray-400 italic uppercase font-bold tracking-widest">Squad Empty</td>
                            </tr>
                        ) : (
                            squad.map((p) => (
                                <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors h-9">
                                    <td className="px-3">
                                        <div className="text-[11px] font-bold text-slate-900 uppercase broadcast-title">{p.name}</div>
                                        <div className="text-[7px] text-slate-500 font-bold uppercase leading-none tracking-tighter">{p.role} • {p.nationality === 'India' ? 'IND' : 'OVR'}</div>
                                    </td>
                                    <td className="px-2 text-center text-[11px] font-bold text-indigo-600 broadcast-title">{p.rating}</td>
                                    <td className="px-3 text-right">
                                        <div className="text-[11px] font-bold text-slate-900 broadcast-title tracking-wide">₹{p.soldPrice?.toFixed(2)} Cr</div>
                                        {p.soldViaRTM && <div className="text-[6px] bg-purple-100 text-purple-700 px-1 rounded inline-block font-extrabold mt-0.5 tracking-tighter uppercase">RTM USED</div>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatsPanel = () => {
    const { players, teams } = useAuction();
    const [activeTab, setActiveTab] = useState<'market' | 'squad'>('market');
    
    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200 bg-slate-900 h-10 shrink-0">
                <button 
                    onClick={() => setActiveTab('market')}
                    className={`flex-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative broadcast-title ${activeTab === 'market' ? 'bg-indigo-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    Central Pool
                    {activeTab === 'market' && <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('squad')}
                    className={`flex-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative broadcast-title ${activeTab === 'squad' ? 'bg-indigo-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    Team Roster
                    {activeTab === 'squad' && <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-500"></div>}
                </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
                {activeTab === 'market' ? <PlayersMarketView players={players} teams={teams} /> : <TeamSquadView teams={teams} />}
            </div>
        </div>
    );
}

const TeamFeedCard: React.FC<{ team: Team }> = ({ team }) => {
    const { currentUser, userStream, mediaState } = useAuction();
    const videoRef = useRef<HTMLVideoElement>(null);
    const isStreaming = currentUser?.id === team.id && mediaState.camera && userStream;

    useEffect(() => {
        if (isStreaming && videoRef.current && userStream) {
            videoRef.current.srcObject = userStream;
        }
    }, [isStreaming, userStream]);

    return (
        <div className="relative bg-white rounded overflow-hidden border border-gray-300 hover:border-indigo-500 transition-colors group h-full w-full">
             {isStreaming ? (
                 <div className="absolute inset-0 bg-black">
                     <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                 </div>
             ) : (
                 <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <img src={team.logo} alt={team.shortName} className="w-24 h-24 object-contain opacity-80 group-hover:scale-110 transition-transform" />
                 </div>
             )}
             
             <div className="absolute top-0 w-full p-1 flex justify-between items-start z-10">
                 <div className="bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm border-l-2 border-indigo-500 uppercase tracking-widest broadcast-title leading-none">{team.shortName}</div>
                 {isStreaming && <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse border border-white"></div>}
             </div>

             <div className="absolute bottom-0 w-full p-1 bg-gradient-to-t from-white via-white/90 to-transparent flex justify-between items-end">
                 <span className="text-[11px] font-bold text-slate-800 broadcast-title leading-none">₹{team.budget.toFixed(1)} Cr</span>
                 <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Purse</span>
             </div>
        </div>
    );
};

const AdminMonitoringGrid = ({ teams }: { teams: Team[] }) => {
    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="bg-slate-950 text-yellow-500 h-9 flex justify-center items-center shadow-lg shrink-0 border-b border-slate-800">
                <h2 className="broadcast-title font-bold text-sm tracking-[0.25em] uppercase leading-none">Broadcast Monitor</h2>
            </div>
            <div className="grid grid-cols-5 grid-rows-2 gap-0.5 p-0.5 flex-1 bg-slate-800 min-h-0">
                {teams.map(team => <TeamFeedCard key={team.id} team={team} />)}
            </div>
        </div>
    )
}

const OfficialPartnersSection = () => {
    const { sponsors } = useAuction();
    const activeSponsors = sponsors.filter(s => s.isVisible);
    // Duplicate for marquee effect
    const marqueeSponsors = activeSponsors.length > 0 ? [...activeSponsors, ...activeSponsors, ...activeSponsors] : [];

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
             <div className="bg-slate-950 text-yellow-500 h-9 flex justify-center items-center shadow-lg shrink-0 z-20 border-b border-yellow-500/20">
                 <h2 className="broadcast-title font-bold text-sm tracking-[0.25em] uppercase leading-none text-center">Sponsoring Partners</h2>
             </div>
             <div className="flex-1 overflow-hidden relative bg-white">
                 {marqueeSponsors.length > 0 ? (
                     <div className="absolute top-0 w-full animate-sponsor-scroll-vertical">
                         <div className="flex flex-col">
                            {marqueeSponsors.map((s, idx) => (
                                 <div key={`${s.id}-${idx}`} className="flex items-center justify-center p-6 border-b border-gray-100 h-28 hover:bg-slate-50 transition-colors">
                                     <img src={s.logo} alt={s.name} className="max-h-14 max-w-[80%] object-contain transition-all duration-500" />
                                 </div>
                            ))}
                         </div>
                     </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Ad Space Available
                    </div>
                 )}
             </div>
             <style>{`
                  @keyframes sponsor-scroll-vertical {
                      0% { transform: translateY(0); }
                      100% { transform: translateY(-33.33%); } 
                  }
                  .animate-sponsor-scroll-vertical { animation: sponsor-scroll-vertical 30s linear infinite; }
            `}</style>
        </div>
    )
}

const BiddingPanel = ({ initialViewerMode = false, isAdmin = false }: { initialViewerMode?: boolean; isAdmin?: boolean }) => {
  const { 
      auctionState, teams, players, placeBid, currentUser, login, logout,
      userStream, mediaState, toggleMic, toggleCamera, resolveRTM, getCurrentPlayer, auctionRules,
      getBiddingIncrement, timer 
  } = useAuction();
  
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [isViewerMode, setIsViewerMode] = useState(initialViewerMode);
  const [bidError, setBidError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isBidding, setIsBidding] = useState(false); 
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { setIsViewerMode(initialViewerMode); }, [initialViewerMode]);
  useEffect(() => { if (videoRef.current && userStream) videoRef.current.srcObject = userStream; }, [userStream, currentUser]);

  const handleLogin = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!selectedTeamId) { alert("Please select a franchise registry."); return; }
      
      setIsLoggingIn(true);
      const success = await login(selectedTeamId, password);
      setIsLoggingIn(false);

      if (!success) alert("Authentication failed. Security active.");
      else setPassword('');
  };

  const currentIncrement = getBiddingIncrement(auctionState.currentBid);
  const isOpeningBid = auctionState.bids.length === 0;
  
  const nextBidAmount = isOpeningBid 
    ? auctionState.currentBid 
    : parseFloat((auctionState.currentBid + currentIncrement).toFixed(2));
    
  const isMyBidHighest = auctionState.bids.length > 0 && auctionState.bids[0].teamId === currentUser?.id;

  const handleBid = async () => {
      if (!currentUser || isBidding) return;
      
      setIsBidding(true); 
      
      try {
        const result = await placeBid(currentUser.id, nextBidAmount);
        if (!result.success) {
            setBidError(result.message);
            setTimeout(() => setBidError(null), 3000);
        }
      } catch (e) {
        setBidError("Network Error");
      } finally {
        setIsBidding(false); 
      }
  };

  const currentPlayer = getCurrentPlayer();
  const isRTMPending = auctionState.rtmPending;
  const isMyRTM = currentUser && currentPlayer && currentUser.id === currentPlayer.previousTeamId && isRTMPending;

  const isOverseasPlayer = currentPlayer?.nationality !== 'India';
  const myOverseasCount = currentUser?.squad.filter(p => p.nationality !== 'India').length || 0;
  const isSquadFull = (currentUser?.squad.length || 0) >= auctionRules.maxSquadSize;
  const isOverseasFull = isOverseasPlayer && myOverseasCount >= auctionRules.maxOverseas;
  const canAfford = currentUser ? currentUser.budget >= nextBidAmount : false;
  
  // Disable bidding if timer hits 0 (before server processing) to avoid confusion
  const isDisabled = !auctionState.isBiddingActive || 
                     timer === 0 || 
                     isSquadFull || 
                     isOverseasFull || 
                     !canAfford || 
                     isBidding || 
                     isMyBidHighest;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
      <StatsPanel />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full relative">
         
         {isAdmin ? (
            <AdminMonitoringGrid teams={teams} />
         ) : currentUser ? (
            <div className="flex flex-col h-full bg-slate-900">
                 <div className="flex justify-between items-center bg-slate-950 px-3 py-2 border-b border-slate-800 h-10">
                    <div className="flex items-center gap-2">
                        <img src={currentUser.logo} className="w-5 h-5 object-contain bg-white rounded-sm p-0.5" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-widest broadcast-title leading-none">{currentUser.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Purse:</span>
                            <span className="text-[13px] font-bold text-emerald-400 broadcast-title tracking-wider">₹{currentUser.budget.toFixed(2)} Cr</span>
                        </div>
                    </div>
                 </div>

                 <div className="flex-1 bg-black relative overflow-hidden">
                    {mediaState.camera ? (
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50">
                             <img src={currentUser.logo} className="w-16 h-16 opacity-20 filter grayscale invert" />
                        </div>
                    )}

                    {/* Overlay Warnings */}
                    <div className="absolute top-2 inset-x-2 z-10 flex flex-col gap-2">
                         {isSquadFull && (
                            <div className="bg-red-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-3 py-1.5 rounded-md text-center tracking-widest border border-red-500 shadow-lg">
                                Squad Full: 25 Player Limit Reached
                            </div>
                         )}
                         {isOverseasFull && (
                            <div className="bg-orange-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-3 py-1.5 rounded-md text-center tracking-widest border border-orange-500 shadow-lg">
                                Overseas Limit Reached: 8 Player Limit
                            </div>
                         )}
                         {bidError && (
                            <div className="bg-red-900/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase px-3 py-1.5 rounded-md text-center tracking-widest border border-red-700 shadow-lg animate-bounce">
                                {bidError}
                            </div>
                         )}
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button onClick={toggleMic} className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all ${mediaState.mic ? 'bg-slate-700/60 hover:bg-slate-600' : 'bg-red-600'}`}>
                             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                        </button>
                        <button onClick={toggleCamera} className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md transition-all ${mediaState.camera ? 'bg-slate-700/60 hover:bg-slate-600' : 'bg-red-600'}`}>
                             <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                        </button>
                        <button onClick={logout} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-red-700 text-white backdrop-blur-md transition-all">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                        </button>
                    </div>
                 </div>

                 <div className="bg-slate-950 p-2 border-t border-slate-800 shrink-0">
                    {isRTMPending ? (
                        isMyRTM ? (
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => resolveRTM(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded font-bold uppercase text-[10px] tracking-widest broadcast-title shadow-lg">Execute RTM Card</button>
                                <button onClick={() => resolveRTM(false)} className="bg-slate-700 hover:bg-red-600 text-white py-2 rounded font-bold uppercase text-[10px] tracking-widest broadcast-title transition-all">Decline</button>
                            </div>
                        ) : (
                            <div className="w-full bg-slate-900 border border-slate-800 text-slate-500 py-2 rounded text-[9px] font-bold uppercase text-center tracking-widest">Awaiting RTM Decision...</div>
                        )
                    ) : (
                        <div className="space-y-1.5">
                            <button 
                                onClick={handleBid}
                                disabled={isDisabled}
                                className={`w-full py-2.5 rounded font-bold uppercase text-lg tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none broadcast-title relative overflow-hidden group ${
                                    isSquadFull || isOverseasFull ? 'bg-red-900 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                            >
                                <span className="relative z-10">
                                    {isBidding 
                                        ? 'TRANSMITTING...' 
                                        : isSquadFull 
                                            ? 'Squad Full' 
                                            : isOverseasFull 
                                                ? 'Overseas Limit' 
                                                : timer === 0
                                                    ? 'BIDDING CLOSED'
                                                    : isMyBidHighest
                                                        ? 'YOU LEAD'
                                                        : `Confirm Bid: ₹${nextBidAmount.toFixed(2)} Cr`
                                    }
                                </span>
                                {!isDisabled && (
                                    <div className="absolute top-0 right-0 h-full bg-white/10 flex items-center px-4 font-bold text-[9px] uppercase border-l border-white/10 group-hover:bg-white/20">
                                        {isOpeningBid ? 'OPEN' : `+ ${currentIncrement.toFixed(2)}`}
                                    </div>
                                )}
                            </button>
                            <div className="flex justify-between px-1">
                                <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Min. Increment: ₹{currentIncrement.toFixed(2)} Cr</span>
                                <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">Active Regulations In Effect</span>
                            </div>
                        </div>
                    )}
                 </div>
            </div>
         ) : isViewerMode ? (
             <OfficialPartnersSection />
         ) : (
            <div className="h-full flex flex-col bg-white">
                <div className="bg-slate-900 px-3 h-10 border-b border-slate-700 flex items-center justify-between shrink-0">
                    <h3 className="text-white text-[11px] font-bold uppercase tracking-widest broadcast-title leading-none">Secure Access Portal</h3>
                </div>

                <div className="flex-1 overflow-auto bg-white scrollbar-hide">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-slate-100 sticky top-0 z-10 h-7">
                            <tr>
                                <th className="px-3 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest w-[60%]">Franchise Registry</th>
                                <th className="px-3 text-[9px] font-extrabold text-slate-500 uppercase tracking-widest text-right w-[40%]">Available Purse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map(t => (
                                <tr 
                                    key={t.id}
                                    onClick={() => setSelectedTeamId(t.id)}
                                    className={`cursor-pointer transition-colors border-b border-gray-50 h-10 ${selectedTeamId === t.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
                                >
                                    <td className="px-3 flex items-center gap-3 h-10">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center p-0.5 border shrink-0 ${selectedTeamId === t.id ? 'bg-white border-transparent' : 'bg-white border-gray-200 shadow-sm'}`}>
                                            <img src={t.logo} alt={t.shortName} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="leading-none overflow-hidden">
                                            <div className={`text-[11px] font-bold uppercase tracking-tight truncate broadcast-title leading-none ${selectedTeamId === t.id ? 'text-white' : 'text-slate-800'}`}>{t.name}</div>
                                            <div className={`text-[7px] font-bold uppercase ${selectedTeamId === t.id ? 'text-indigo-200' : 'text-slate-400'}`}>{t.shortName}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 text-right">
                                        <div className={`text-[11px] font-bold tracking-wide broadcast-title leading-none ${selectedTeamId === t.id ? 'text-emerald-300' : 'text-slate-600'}`}>₹{t.budget.toFixed(2)} Cr</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-3 bg-slate-100 border-t border-gray-200 flex flex-col gap-2 shrink-0">
                    <form onSubmit={handleLogin} className="flex flex-col gap-2 max-w-sm mx-auto w-full">
                        <input 
                            type="password" 
                            placeholder="TERMINAL ACCESS PIN" 
                            className="w-full bg-white border border-gray-300 rounded py-2 px-3 text-center text-[10px] font-bold tracking-[0.4em] text-slate-800 focus:border-indigo-500 focus:outline-none placeholder:tracking-normal placeholder:text-slate-400 shadow-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="submit"
                            disabled={!selectedTeamId || isLoggingIn}
                            className={`w-full py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all active:scale-[0.98] broadcast-title shadow-md ${
                                selectedTeamId 
                                ? 'bg-indigo-700 text-white hover:bg-indigo-800' 
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            {isLoggingIn ? 'Verifying Credentials...' : selectedTeamId ? 'Initialize Bidding Terminal' : 'Select Franchise To Proceed'}
                        </button>
                    </form>
                </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default BiddingPanel;
