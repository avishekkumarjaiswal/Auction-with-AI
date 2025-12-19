
import React from 'react';
import { useAuction } from '../context/AuctionContext';

const RulesModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { auctionRules } = useAuction();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fadeInScale border border-indigo-500/20">
                {/* Header */}
                <div className="bg-indigo-900 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-4xl font-bold text-white font-['Teko'] uppercase leading-none tracking-wider">Official Regulations</h2>
                        <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">IPL 2025 Player Auction Guidelines</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    <section className="space-y-3">
                        <h3 className="text-indigo-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center text-[10px]">01</span> Squad Composition
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Squad Limit</div>
                                <div className="text-2xl font-bold text-slate-900 font-['Teko']">{auctionRules.minSquadSize} - {auctionRules.maxSquadSize} Players</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Overseas Cap</div>
                                <div className="text-2xl font-bold text-indigo-700 font-['Teko']">Max {auctionRules.maxOverseas} Players</div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-indigo-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center text-[10px]">02</span> Financial Management
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Bidding Increments</div>
                            <div className="space-y-2">
                                {auctionRules.increments.sort((a,b) => a.upTo - b.upTo).map((tier, idx, arr) => (
                                    <IncrementRow 
                                        key={idx} 
                                        label={idx === 0 ? `Up to ${tier.upTo} Cr` : idx === arr.length - 1 ? `Above ${arr[idx-1].upTo} Cr` : `${arr[idx-1].upTo} to ${tier.upTo} Cr`} 
                                        value={`+${tier.increment.toFixed(2)} Cr`} 
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-indigo-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center text-[10px]">03</span> Timing Regulations
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                             <div className="bg-white p-2 rounded border border-slate-200 text-center shadow-sm">
                                 <div className="text-[9px] text-slate-400 font-bold uppercase">Bid Window</div>
                                 <div className="text-lg font-bold text-slate-800 font-['Teko']">{auctionRules.timeConfig.bidDuration}s</div>
                             </div>
                             <div className="bg-white p-2 rounded border border-slate-200 text-center shadow-sm">
                                 <div className="text-[9px] text-slate-400 font-bold uppercase">RTM Window</div>
                                 <div className="text-lg font-bold text-slate-800 font-['Teko']">{auctionRules.timeConfig.rtmDuration}s</div>
                             </div>
                             <div className="bg-white p-2 rounded border border-slate-200 text-center shadow-sm">
                                 <div className="text-[9px] text-slate-400 font-bold uppercase">Auto Break</div>
                                 <div className="text-lg font-bold text-slate-800 font-['Teko']">{auctionRules.timeConfig.breakDuration}s</div>
                             </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-indigo-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center text-[10px]">04</span> Right To Match (RTM)
                        </h3>
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
                            <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                                The original franchise has the first right to re-acquire their player after the bidding war ends by matching the final hammer price, subject to remaining RTM cards.
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                 <div className="bg-white p-2 rounded border border-indigo-200 text-center">
                                     <div className="text-[9px] text-indigo-400 font-bold uppercase">Max Total</div>
                                     <div className="text-xl font-bold text-indigo-800 font-['Teko']">{auctionRules.rtmConfig.maxTotal}</div>
                                 </div>
                                 <div className="bg-white p-2 rounded border border-indigo-200 text-center">
                                     <div className="text-[9px] text-indigo-400 font-bold uppercase">Max Indian</div>
                                     <div className="text-xl font-bold text-indigo-800 font-['Teko']">{auctionRules.rtmConfig.maxIndian}</div>
                                 </div>
                                 <div className="bg-white p-2 rounded border border-indigo-200 text-center">
                                     <div className="text-[9px] text-indigo-400 font-bold uppercase">Max Overseas</div>
                                     <div className="text-xl font-bold text-indigo-800 font-['Teko']">{auctionRules.rtmConfig.maxOverseas}</div>
                                 </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Validated by Auctioneer Panel & Broadcast Center</span>
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeInScale { animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

// Fixed IncrementRow to accept key prop implicitly for TypeScript validation in JSX map
const IncrementRow = ({ label, value }: { label: string, value: string, key?: React.Key }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-200 last:border-0">
        <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
        <span className="text-[14px] font-bold text-emerald-600 font-['Teko'] uppercase">{value}</span>
    </div>
);

export default RulesModal;
