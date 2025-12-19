
import React, { useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { AuctionNotification } from '../types';

const PlayerCard = () => {
  const { 
      getCurrentPlayer, 
      auctionState, 
      getHighestBid, 
      currentUser, 
      userStream, 
      mediaState, 
      teams, 
      timer, 
      notification, 
      isAdminLive, 
      adminStream, 
      sponsors 
  } = useAuction();
  
  const player = notification ? notification.player : getCurrentPlayer();
  const highestBid = notification ? notification.bid : getHighestBid();

  const videoRef = useRef<HTMLVideoElement>(null);
  const adminVideoRef = useRef<HTMLVideoElement>(null);

  const recentBids = auctionState.bids.slice(1, 4);
  const isHighestBidderMe = highestBid && currentUser && highestBid.teamId === currentUser.id;
  const showUserVideo = isHighestBidderMe && mediaState.camera;

  const titleSponsor = sponsors.find(s => s.type === 'Title' && s.isVisible);
  const poweredBySponsors = sponsors.filter(s => s.type === 'PoweredBy' && s.isVisible);

  useEffect(() => {
    if (isAdminLive && adminVideoRef.current && adminStream) {
        adminVideoRef.current.srcObject = adminStream;
    } 
    else if (!isAdminLive && showUserVideo && videoRef.current && userStream) {
        videoRef.current.srcObject = userStream;
    }
  }, [showUserVideo, userStream, highestBid, isAdminLive, adminStream]);

  const getShortName = (teamId: string, teamName: string) => {
      const t = teams.find(x => x.id === teamId);
      return t ? t.shortName : teamName.substring(0, 3).toUpperCase();
  };

  const getTeamNameById = (teamId?: string) => {
      if(!teamId) return '';
      return teams.find(t => t.id === teamId)?.name || '';
  }

  if (!player) {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden p-6">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 shrink-0 z-10 relative">
             <div className="flex items-center gap-4 opacity-90">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-400 to-slate-400"></div>
                <h2 className="text-5xl lg:text-6xl font-bold text-slate-400 uppercase tracking-[0.2em] font-['Teko'] text-center drop-shadow-sm leading-none">
                    Auction Standby
                </h2>
                <div className="h-px w-16 bg-gradient-to-l from-transparent via-slate-400 to-slate-400"></div>
             </div>
             
             <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] leading-none pt-0.5">
                    Awaiting Auctioneer
                </span>
             </div>
        </div>

        {/* Main Content: Split Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 w-full z-10 min-h-0 overflow-hidden px-4 pb-2">
            
            {/* LEFT: Title Sponsor (50%) */}
            <div className="md:w-1/2 flex flex-col h-full">
                 <div className="flex items-center gap-3 mb-3 justify-center shrink-0 opacity-70">
                    <div className="h-px w-8 bg-slate-300"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Official Title Sponsor</span>
                    <div className="h-px w-8 bg-slate-300"></div>
                 </div>
                 
                 <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-8 flex items-center justify-center relative overflow-hidden group transition-all">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-50"></div>
                     {titleSponsor ? (
                        <>
                            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gradient-to-tl from-slate-50 to-transparent rounded-full z-0"></div>
                            <img
                                src={titleSponsor.logo}
                                alt={titleSponsor.name}
                                className="w-full h-full object-contain max-h-[220px] drop-shadow-xl transform transition-transform duration-700 group-hover:scale-105 relative z-10"
                            />
                        </>
                     ) : (
                         <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">Title Slot Available</span>
                     )}
                 </div>
            </div>

            {/* RIGHT: Co-Powered By (50%) */}
            <div className="md:w-1/2 flex flex-col h-full">
                 <div className="flex items-center gap-3 mb-3 justify-center shrink-0 opacity-70">
                    <div className="h-px w-8 bg-slate-300"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em]">Co-Powered By</span>
                    <div className="h-px w-8 bg-slate-300"></div>
                 </div>
                 <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm p-8 gap-6">
                    {poweredBySponsors.length > 0 ? (
                        poweredBySponsors.map(s => (
                             <img key={s.id} src={s.logo} alt={s.name} className="max-h-[80px] w-auto object-contain drop-shadow-md hover:scale-105 transition-transform" />
                        ))
                    ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30">
                            <span className="text-4xl">🤝</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Sponsor Slot</span>
                        </div>
                    )}
                 </div>
            </div>

        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative grid grid-cols-1 md:grid-cols-2 gap-3">
      
      {/* LEFT PANEL: PLAYER PROFILE */}
      <div className="relative bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 flex flex-col h-full">
        {/* Status Badges */}
        {!notification && (
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 items-start">
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest shadow-lg animate-pulse font-['Roboto']">
                    AUCTION ACTIVE
                </span>
                {player.previousTeamId && (
                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest shadow-md font-['Roboto']">
                        RTM ELIGIBLE: {getShortName(player.previousTeamId, '')}
                    </span>
                )}
            </div>
        )}

        {/* Player Image Feed */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden group">
            <img 
                src={player.image} 
                alt={player.name} 
                className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
            />
            {!notification && (
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white font-['Oswald'] uppercase leading-none tracking-widest drop-shadow-2xl">
                        {player.name}
                    </h2>
                </div>
            )}
        </div>

        {/* Quick Stats Grid */}
        {!notification && (
            <div className="bg-white h-16 lg:h-20 grid grid-cols-4 border-t border-gray-100 shrink-0 shadow-inner">
                <StatBox label="Base Price" value={`₹${player.basePrice} Cr`} variant="highlight" />
                <StatBox label="Rating" value={player.rating.toString()} />
                <StatBox label="Role" value={player.role} />
                <StatBox label="Nation" value={player.nationality} />
            </div>
        )}
      </div>

      {/* RIGHT PANEL: LIVE BIDDER / ADMIN FEED */}
      <div className="relative rounded-xl overflow-hidden shadow-lg border border-slate-900 flex flex-col bg-slate-950 h-full">
        
        {/* RECENT BIDS LOG - UNIFIED HEIGHT h-10 */}
        {!notification && !isAdminLive && (
            <div className="bg-slate-900 h-10 border-b border-slate-800 flex items-center px-3 gap-3 shrink-0 overflow-hidden shadow-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0 font-['Roboto'] tracking-[0.2em]">WAR LOG:</span>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
                    {recentBids.length === 0 ? (
                        <span className="text-[10px] text-slate-600 italic font-['Roboto'] uppercase tracking-widest opacity-60">
                             {auctionState.bids.length > 0 ? 'OPENING BID' : 'Awaiting engagement...'}
                        </span>
                    ) : (
                        recentBids.map(bid => (
                            <div key={bid.id} className="bg-slate-800 px-2 h-7 flex items-center gap-2 rounded-sm border border-slate-700 shadow-sm">
                                <span className="text-[10px] text-white font-bold uppercase font-['Oswald'] tracking-widest">{getShortName(bid.teamId, bid.teamName)}</span>
                                <span className="text-[12px] text-yellow-500 font-bold font-['Oswald']">₹{bid.amount}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* FEED MONITOR */}
        <div className="flex-1 relative bg-black min-h-0 overflow-hidden flex items-center justify-center">
             
             {/* RTM DECISION INTERFACE */}
             {auctionState.rtmPending && (
                 <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-4 animate-fadeIn overflow-hidden">
                     {/* Background Pattern */}
                     <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-950 to-slate-950"></div>
                     
                     <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center h-full gap-2 md:gap-4">
                         
                         {/* Header Group */}
                         <div className="flex flex-col items-center shrink-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl md:text-2xl animate-pulse text-purple-400">⚡</span>
                                <h3 className="text-3xl md:text-4xl font-['Teko'] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-300 uppercase tracking-widest leading-none drop-shadow-md">
                                    Right To Match
                                </h3>
                                <span className="text-xl md:text-2xl animate-pulse text-purple-400">⚡</span>
                            </div>
                            <div className="bg-purple-900/30 border border-purple-500/30 px-3 py-0.5 rounded-full">
                                <div className="text-[8px] md:text-[9px] font-bold text-purple-300 uppercase tracking-[0.4em]">Active Protocol</div>
                            </div>
                         </div>
                         
                         {/* Timer */}
                         <div className="relative flex flex-col items-center shrink-0">
                            <div className={`text-6xl md:text-7xl font-['Teko'] font-bold leading-none ${timer <= 5 ? 'text-red-500 animate-ping' : 'text-yellow-400'} drop-shadow-2xl tabular-nums`}>
                                {timer}<span className="text-3xl md:text-4xl ml-1 text-white/30 align-top">s</span>
                            </div>
                         </div>

                         {/* Info Card - Compacted to avoid clipping */}
                         <div className="bg-slate-900/80 backdrop-blur-md border border-purple-500/30 w-full rounded-xl shadow-2xl relative overflow-hidden shrink-0 flex flex-col">
                             <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                             
                             <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3">
                                 {/* Team Section */}
                                 <div className="flex flex-col items-center">
                                     <div className="text-[7px] md:text-[8px] text-slate-400 uppercase font-bold tracking-widest mb-1">Original Franchise</div>
                                     <div className="flex items-center gap-3">
                                         {player.previousTeamId && (
                                            <img 
                                                src={teams.find(t => t.id === player.previousTeamId)?.logo} 
                                                className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-lg" 
                                                alt="Original Team"
                                            />
                                         )}
                                         <h4 className="text-2xl md:text-3xl font-bold text-white uppercase font-['Teko'] tracking-wider leading-none">
                                             {getTeamNameById(player.previousTeamId)}
                                         </h4>
                                     </div>
                                 </div>

                                 {/* Divider */}
                                 <div className="w-full h-px bg-slate-700 flex items-center justify-center my-1">
                                     <div className="bg-slate-800 px-2 text-[7px] md:text-[8px] text-slate-500 font-bold uppercase tracking-widest border border-slate-700 rounded-sm">Target Price</div>
                                 </div>

                                 {/* Price Section */}
                                 <div className="text-center">
                                     <div className="text-4xl md:text-5xl font-bold text-emerald-400 font-['Teko'] tracking-wide drop-shadow-md leading-none">
                                         ₹{highestBid?.amount.toFixed(2)} <span className="text-xl md:text-2xl text-emerald-600/70">Cr</span>
                                     </div>
                                 </div>
                             </div>
                         </div>

                     </div>
                 </div>
             )}

             {isAdminLive ? (
                 <div className="w-full h-full relative">
                     {adminStream ? (
                        <video ref={adminVideoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                             <div className="text-slate-600 text-xs uppercase font-bold tracking-[0.3em] font-['Roboto']">Syncing Command Uplink...</div>
                        </div>
                     )}
                     <div className="absolute top-5 left-5 z-20">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl animate-pulse font-['Oswald'] border border-red-500">
                            LIVE COMM
                        </span>
                     </div>
                     <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-20">
                         <h3 className="text-4xl font-bold text-white font-['Oswald'] uppercase tracking-[0.3em] leading-none">
                            COMMAND HQ FEED
                         </h3>
                     </div>
                 </div>
             ) : (
                <>
                    {/* TIMER COMPONENT */}
                    {!notification && auctionState.isBiddingActive && (
                        <div className="absolute top-3 right-3 z-50 flex flex-col items-end pointer-events-none drop-shadow-2xl">
                            <div className={`text-5xl font-['Oswald'] font-bold leading-none transition-all duration-300 ${timer <= 5 ? 'text-red-500 animate-pulse scale-110' : timer <= 10 ? 'text-yellow-400' : 'text-white'}`}>
                                {timer}<span className="text-2xl align-top ml-0.5 opacity-50 font-light">s</span>
                            </div>
                            <div className={`mt-1 text-[8px] font-bold uppercase text-white/90 px-2 py-0.5 rounded-sm shadow-xl border border-white/10 ${timer <= 5 ? 'bg-red-600 shadow-red-900/40' : 'bg-slate-900/80 backdrop-blur-md'} font-['Roboto'] tracking-widest`}>
                                {auctionState.bids.length > 0 ? 'TO SALE' : 'TO UNSOLD'}
                            </div>
                        </div>
                    )}

                    {highestBid ? (
                        <div key={highestBid.id} className="w-full h-full relative flex items-center justify-center animate-fadeIn">
                                {showUserVideo ? (
                                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>
                                        <img 
                                            src={highestBid.teamLogo} 
                                            alt="Bidder Logo" 
                                            className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10"
                                        />
                                    </div>
                                )}
                                
                                {!notification && (
                                    <>
                                        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-[0.2em] font-['Roboto'] shadow-2xl">
                                                HIGHEST BID
                                            </span>
                                            {!showUserVideo && (
                                                <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-widest font-['Roboto'] border border-slate-700 backdrop-blur-md">
                                                    CAM OFFLINE
                                                </span>
                                            )}
                                        </div>

                                        {/* BID INFO OVERLAY */}
                                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 px-4 z-20 flex flex-col items-center">
                                            <h3 className="text-3xl md:text-4xl font-bold text-white font-['Oswald'] uppercase tracking-[0.1em] leading-none drop-shadow-2xl text-center">
                                                {highestBid.teamName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] font-['Roboto']">CURRENT BID:</span>
                                                <span className="text-4xl md:text-5xl font-bold text-emerald-400 leading-none drop-shadow-2xl font-['Oswald'] tracking-widest">₹{highestBid.amount.toFixed(2)} CR</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-800 bg-slate-950">
                            <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center mb-3 bg-slate-900 shadow-inner">
                                <span className="text-xl animate-pulse grayscale opacity-40">🔨</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.4em] font-['Roboto'] text-slate-600">Awaiting Bid Entry</span>
                        </div>
                    )}
                </>
             )}
        </div>
      </div>
      
      {/* GLOBAL NOTIFICATION BANNER */}
      {notification && (
        <div className="absolute bottom-4 left-0 right-0 z-[100] mx-4 animate-slideUp">
           <NotificationBanner notification={notification} />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

const StatBox = ({ label, value, variant }: { label: string, value: string, variant?: 'highlight' }) => (
    <div className={`flex flex-col items-center justify-center text-center h-full border-r border-gray-100 last:border-r-0 px-2 ${
        variant === 'highlight' ? 'bg-indigo-50/40' : 'bg-white'
    }`}>
        <div className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1 font-['Roboto'] truncate w-full">{label}</div>
        <div className={`text-xl font-bold uppercase font-['Oswald'] tracking-wide leading-none truncate w-full ${variant === 'highlight' ? 'text-indigo-800' : 'text-slate-800'}`}>{value}</div>
    </div>
);

const NotificationBanner = ({ notification }: { notification: AuctionNotification }) => {
    const isSold = notification.type === 'SOLD';
    const isRTM = notification.player.soldViaRTM;
    
    return (
        <div className="flex w-full shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border border-white/20 h-24">
            {/* Team Logo Unit */}
            {isSold && notification.bid ? (
                <div className={`w-28 ${isRTM ? 'bg-indigo-700 border-purple-400' : 'bg-blue-800 border-yellow-500'} relative flex items-center justify-center p-3 border-r-4`}>
                    <img src={notification.bid.teamLogo} className="w-full h-full object-contain z-10 drop-shadow-2xl" alt="Winner" />
                    <div className="absolute inset-0 bg-white/5 opacity-20"></div>
                </div>
            ) : (
                <div className="w-28 bg-red-800 relative flex items-center justify-center p-3 border-r-4 border-red-500">
                    <div className="text-4xl grayscale opacity-30">🚫</div>
                </div>
            )}

            {/* Core Message Unit */}
            <div className={`flex-1 ${isRTM ? 'bg-indigo-900' : 'bg-slate-900'} p-4 flex flex-col justify-center`}>
                <h2 className="text-3xl text-white font-['Oswald'] font-bold uppercase leading-none tracking-widest drop-shadow-2xl">
                    {notification.player.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                    <div className={`h-1 w-8 ${isSold ? (isRTM ? 'bg-purple-400' : 'bg-emerald-500') : 'bg-red-500'}`}></div>
                    <span className="text-[11px] text-white/90 font-bold uppercase tracking-[0.3em] font-['Oswald']">
                        {isSold ? (isRTM ? `RETAINED BY ${notification.bid?.teamName}` : `SOLD TO ${notification.bid?.teamName}`) : 'UNSOLD'}
                    </span>
                </div>
            </div>

            {/* Value Unit */}
            {isSold && notification.bid ? (
                <div className={`${isRTM ? 'bg-indigo-950' : 'bg-slate-950'} px-8 flex items-center justify-center border-l border-white/10 min-w-[140px]`}>
                    <span className="text-4xl font-['Oswald'] font-bold text-white drop-shadow-2xl tracking-widest">
                        ₹{notification.bid.amount.toFixed(2)}<span className="text-xl ml-1 font-light opacity-50 uppercase">CR</span>
                    </span>
                </div>
            ) : (
                 <div className="bg-red-950 px-8 flex items-center justify-center border-l border-white/10 min-w-[140px]">
                    <span className="text-lg font-bold text-red-300 uppercase tracking-[0.3em] font-['Oswald']">
                        UNSOLD
                    </span>
                </div>
            )}
        </div>
    );
};

export default PlayerCard;
