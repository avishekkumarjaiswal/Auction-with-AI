
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Player, Team, Bid, AuctionState, PlayerStatus, Sponsor, AuctionNotification, AuctionConfig, AuctionRules } from '../types';
import { DBStructure, DEFAULT_DB, getDatabaseAdapter, DatabaseAdapter } from '../services/database';

// --- TYPES ---
interface AuctionContextType {
  teams: Team[];
  players: Player[];
  sponsors: Sponsor[];
  auctionState: AuctionState;
  auctionConfig: AuctionConfig;
  auctionRules: AuctionRules;
  notification: AuctionNotification | null;
  isLoading: boolean;
  
  // User Session
  currentUser: Team | null;
  login: (teamId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Media (Local Preview)
  userStream: MediaStream | null;
  mediaState: { mic: boolean; camera: boolean };
  toggleMic: () => void;
  toggleCamera: () => void;
  adminStream: MediaStream | null;
  isAdminLive: boolean;
  initAdminStream: () => Promise<boolean>;
  toggleAdminLive: () => void;
  toggleAdminMic: () => void;
  adminMediaState: { mic: boolean; camera: boolean };

  // Actions
  startBidding: (playerId: string) => Promise<void>;
  stopBidding: () => Promise<void>; 
  resumeBidding: () => Promise<void>; 
  sellPlayer: () => Promise<void>; 
  resolveRTM: (accepted: boolean) => Promise<void>; 
  markUnsold: () => Promise<void>;
  resetAuction: () => Promise<void>;
  
  // CRUD
  updateTeamBudget: (teamId: string, newBudget: number) => Promise<void>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addTeam: (team: Team) => Promise<void>;
  addPlayer: (player: Player) => Promise<void>;
  updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  updateAuctionConfig: (config: AuctionConfig) => Promise<void>;
  updateAuctionRules: (rules: Partial<AuctionRules>) => Promise<void>;
  
  toggleSponsor: (id: string) => Promise<void>;
  addSponsor: (sponsor: Sponsor) => Promise<void>;
  updateSponsor: (id: string, updates: Partial<Sponsor>) => Promise<void>;
  deleteSponsor: (id: string) => Promise<void>;
  
  isAutoMode: boolean;
  toggleAutoMode: () => void;
  autoCountdown: number | null;

  placeBid: (teamId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  
  // Helpers
  getCurrentPlayer: () => Player | undefined;
  getHighestBid: () => Bid | undefined;
  getBiddingIncrement: (currentBid: number) => number;
  timer: number;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider = ({ children }: { children?: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // --- STATE ---
  const [db, setDb] = useState<DBStructure>(DEFAULT_DB);
  const dbAdapter = useRef<DatabaseAdapter | null>(null);
  
  // Locks to prevent double-firing events (The "Hang" Fix)
  const processingRef = useRef(false);
  const autoNextRunRef = useRef<number | null>(null);
  
  // UI State
  const [notification, setNotification] = useState<AuctionNotification | null>(null);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<Team | null>(null);
  
  // Media State
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState({ mic: false, camera: false });
  const [adminStream, setAdminStream] = useState<MediaStream | null>(null);
  const [isAdminLive, setIsAdminLive] = useState(false);
  const [adminMediaState, setAdminMediaState] = useState({ mic: true, camera: true });

  // --- WAKE LOCK (Mobile Screen Keep-Alive) ---
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                // @ts-ignore
                wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.log(`Wake Lock Error: ${err}`);
        }
    };
    requestWakeLock();
    
    // Re-request lock if page visibility changes (e.g. tab switch)
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            requestWakeLock();
            // Force refresh data to ensure no stale state after waking up
            dbAdapter.current?.initialize().then(data => setDb(data));
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        if (wakeLock) wakeLock.release();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // --- 1. CORE: DB INIT & SYNC ---
  useEffect(() => {
    const init = async () => {
        dbAdapter.current = getDatabaseAdapter();
        
        // Initial Load
        const initialData = await dbAdapter.current.initialize();
        
        // Fallback: If players are missing (fresh DB), force seed them
        if (!initialData.players || initialData.players.length === 0) {
             initialData.players = DEFAULT_DB.players;
             await dbAdapter.current.update(d => ({ ...d, players: DEFAULT_DB.players }));
        }

        setDb(initialData);
        setIsLoading(false);

        // Subscription to Real-time Changes
        dbAdapter.current.subscribe((newData, remoteNotification) => {
            setDb(newData);
            // Unlock processing when new state arrives
            processingRef.current = false; 
            
            if (remoteNotification) {
                setNotification(remoteNotification);
                setTimeout(() => setNotification(null), 6000);
            }
        });
    };

    init();
  }, []);

  // --- 2. CORE: TRANSACTION MANAGER ---
  const runUpdate = useCallback(async (updater: (currentDb: DBStructure) => DBStructure, notificationData?: AuctionNotification) => {
      if (!dbAdapter.current) return;
      
      // 1. Optimistic UI Update (Instant feedback)
      const predictedState = updater(db);
      setDb(predictedState);

      if (notificationData) {
         setNotification(notificationData);
         setTimeout(() => setNotification(null), 6000);
      }

      // 2. Commit to Persistence Layer
      const success = await dbAdapter.current.update(updater, notificationData);
      
      if (success) {
          // Release lock for local initiator immediately to allow subsequent actions
          processingRef.current = false;
      }
      
      // 3. Rollback if Transaction Failed
      if (!success) {
          console.warn("Transaction failed - Rolling back UI");
          const trueState = await dbAdapter.current.initialize();
          setDb(trueState);
      }
  }, [db]);


  const getBiddingIncrement = (currentBid: number): number => {
    const sortedTiers = [...db.rules.increments].sort((a, b) => a.upTo - b.upTo);
    for (const tier of sortedTiers) {
      if (currentBid < tier.upTo) {
        return tier.increment;
      }
    }
    return sortedTiers[sortedTiers.length - 1]?.increment || 0.50;
  };

  // --- AUTH ---
  const login = async (teamId: string, password: string) => {
      return new Promise<boolean>((resolve) => {
          setTimeout(() => {
              const correctPassword = db.auth[teamId];
              if (correctPassword && correctPassword === password) {
                  const team = db.teams.find(t => t.id === teamId);
                  if (team) { setCurrentUser(team); resolve(true); return; }
              }
              resolve(false);
          }, 300);
      });
  };
  const logout = async () => { setCurrentUser(null); };

  // --- MEDIA ---
  const toggleMic = () => { if (userStream) { userStream.getAudioTracks().forEach(track => track.enabled = !mediaState.mic); setMediaState(prev => ({ ...prev, mic: !prev.mic })); } };
  const toggleCamera = () => { if (userStream) { userStream.getVideoTracks().forEach(track => track.enabled = !mediaState.camera); setMediaState(prev => ({ ...prev, camera: !prev.camera })); } };
  const initAdminStream = async () => {
      if (adminStream) return true;
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setAdminStream(stream);
          setAdminMediaState({ mic: true, camera: true });
          return true;
      } catch (err) { return false; }
  };
  const toggleAdminLive = () => setIsAdminLive(prev => !prev);
  const toggleAdminMic = () => { if (adminStream) { adminStream.getAudioTracks().forEach(track => track.enabled = !adminMediaState.mic); setAdminMediaState(prev => ({ ...prev, mic: !prev.mic })); } };
  const toggleAutoMode = () => setIsAutoMode(prev => !prev);

  // --- ACTIONS ---

  const startBidding = async (playerId: string) => {
    await runUpdate((data) => {
        const player = data.players.find(p => p.id === playerId);
        if (!player) return data;
        
        const newData = JSON.parse(JSON.stringify(data)) as DBStructure;
        newData.players = newData.players.map(p => p.id === playerId ? { ...p, status: PlayerStatus.OnAuction } : p);
        newData.state = {
            ...newData.state,
            currentPlayerId: playerId,
            currentBid: player.basePrice,
            bids: [],
            isBiddingActive: true,
            lastActionMessage: `Bidding OPEN for ${player.name}`,
            rtmPending: false,
            timerExpiresAt: Date.now() + (newData.rules.timeConfig.bidDuration * 1000),
        };
        return newData;
    });
  };

  const stopBidding = async () => {
    await runUpdate(data => ({
        ...data,
        state: { ...data.state, isBiddingActive: false, lastActionMessage: "Bidding PAUSED", timerExpiresAt: null }
    }));
  };

  const resumeBidding = async () => {
      await runUpdate(data => {
          if (!data.state.currentPlayerId || data.state.rtmPending) return data;
          return {
            ...data,
            state: { 
                ...data.state, 
                isBiddingActive: true, 
                lastActionMessage: "Bidding RESUMED",
                timerExpiresAt: Date.now() + (data.rules.timeConfig.bidDuration * 1000)
            }
          };
      });
  };

  const finalizeSale = async (winningBid: Bid, isRTM: boolean) => {
    await runUpdate((data) => {
        const { currentPlayerId } = data.state;
        if (!currentPlayerId) return data;
        const player = data.players.find(p => p.id === currentPlayerId);
        if (!player) return data;

        const newData = JSON.parse(JSON.stringify(data)) as DBStructure;
        const timestamp = Date.now();
        const soldPrice = winningBid.amount;
        const updatedPlayer = { ...player, status: PlayerStatus.Sold, soldPrice, teamId: winningBid.teamId, soldTimestamp: timestamp, soldViaRTM: isRTM };

        newData.teams = newData.teams.map(t => {
            if (t.id === winningBid.teamId) {
                const newRtmUsed = { ...t.rtmUsed };
                if (isRTM) {
                    if (player.nationality !== 'India') newRtmUsed.overseas = newRtmUsed.overseas + 1;
                    else newRtmUsed.indian = newRtmUsed.indian + 1;
                }
                return {
                    ...t,
                    budget: parseFloat((t.budget - soldPrice).toFixed(2)),
                    squad: [...t.squad, updatedPlayer],
                    rtmUsed: newRtmUsed
                };
            }
            return t;
        });

        newData.players = newData.players.map(p => p.id === currentPlayerId ? updatedPlayer : p);
        newData.state = {
            ...newData.state,
            currentPlayerId: null,
            currentBid: 0,
            bids: [],
            isBiddingActive: false,
            lastActionMessage: `${player.name} ${isRTM ? 'RETAINED' : 'SOLD'} to ${winningBid.teamName}`,
            rtmPending: false,
            timerExpiresAt: null
        };
        return newData;
    }, { type: 'SOLD', player: { ...db.players.find(p => p.id === db.state.currentPlayerId)!, soldViaRTM: isRTM }, bid: winningBid });
  };

  const sellPlayer = async () => {
    // LOCK Check: Prevent multiple calls if already processing
    if (processingRef.current) return;
    processingRef.current = true;

    try {
        const { currentPlayerId, bids } = db.state;
        if (!currentPlayerId || bids.length === 0) {
            processingRef.current = false;
            return;
        }
        const winningBid = bids[0]; 
        const player = db.players.find(p => p.id === currentPlayerId);
        if (!player) {
            processingRef.current = false;
            return;
        }

        // RTM CHECK LOGIC
        if (player.previousTeamId && player.previousTeamId !== winningBid.teamId) {
            const prevTeam = db.teams.find(t => t.id === player.previousTeamId);
            if (prevTeam) {
                const isOverseas = player.nationality !== 'India';
                const usedCount = isOverseas ? prevTeam.rtmUsed.overseas : prevTeam.rtmUsed.indian;
                const limit = isOverseas ? db.rules.rtmConfig.maxOverseas : db.rules.rtmConfig.maxIndian;
                const totalUsed = prevTeam.rtmUsed.indian + prevTeam.rtmUsed.overseas;
                
                if (totalUsed < db.rules.rtmConfig.maxTotal && usedCount < limit) {
                    // Trigger RTM Flow
                    await runUpdate(data => ({
                        ...data,
                        state: {
                            ...data.state,
                            isBiddingActive: false,
                            rtmPending: true,
                            lastActionMessage: `RTM Requested by ${prevTeam?.shortName}`,
                            // CRITICAL: Force reset timer so it doesn't stay at 0
                            timerExpiresAt: Date.now() + (data.rules.timeConfig.rtmDuration * 1000)
                        }
                    }));
                    // Note: processingRef stays true here, which is fine as we are in a pending state
                    return; 
                }
            }
        }
        await finalizeSale(winningBid, false);
    } catch (e) {
        console.error(e);
        processingRef.current = false;
    }
  };

  const resolveRTM = async (accepted: boolean) => {
      const { currentPlayerId, bids, currentBid } = db.state;
      if (!currentPlayerId || bids.length === 0) return;
      const player = db.players.find(p => p.id === currentPlayerId);
      if (!player || !player.previousTeamId) return;

      if (accepted) {
          const previousTeam = db.teams.find(t => t.id === player.previousTeamId);
          if (!previousTeam) return;
          
          if (previousTeam.budget < currentBid) {
              alert(`RTM Denied: ${previousTeam.name} has insufficient funds.`);
              await finalizeSale(bids[0], false);
              return;
          }
          
          const rtmBid: Bid = { 
              id: crypto.randomUUID(), 
              teamId: previousTeam.id, 
              teamName: previousTeam.name, 
              teamLogo: previousTeam.logo, 
              amount: currentBid, 
              timestamp: Date.now() 
          };
          await finalizeSale(rtmBid, true);
      } else {
          await finalizeSale(bids[0], false);
      }
  };

  const markUnsold = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
          const { currentPlayerId } = db.state;
          if (!currentPlayerId) { processingRef.current = false; return; }
          const player = db.players.find(p => p.id === currentPlayerId);
          if(!player) { processingRef.current = false; return; }
          
          const updatedPlayer = { ...player, status: PlayerStatus.Unsold, soldTimestamp: Date.now() };

          await runUpdate(data => {
              const newData = JSON.parse(JSON.stringify(data)) as DBStructure;
              newData.players = newData.players.map(p => p.id === currentPlayerId ? updatedPlayer : p);
              newData.state = {
                  ...newData.state,
                  currentPlayerId: null,
                  currentBid: 0,
                  bids: [],
                  isBiddingActive: false,
                  lastActionMessage: `${player?.name} UNSOLD`,
                  rtmPending: false,
                  timerExpiresAt: null
              };
              return newData;
          }, { type: 'UNSOLD', player: updatedPlayer });
      } catch (e) {
          processingRef.current = false;
      }
  };

  const placeBid = async (teamId: string, amount: number) => {
      let error = null;
      await runUpdate((data) => {
          if (!data.state.isBiddingActive) { error = "Bidding is closed"; return data; }
          
          if (data.state.timerExpiresAt && Date.now() > data.state.timerExpiresAt + 1000) { 
              error = "Time Expired"; 
              return data; 
          }

          if (amount <= data.state.currentBid && data.state.bids.length > 0) { error = "Bid too low"; return data; }
          
          const team = data.teams.find(t => t.id === teamId);
          if (!team || team.budget < amount) { error = "Insufficient Funds"; return data; }

          const newData = JSON.parse(JSON.stringify(data)) as DBStructure;
          const newBid: Bid = { id: crypto.randomUUID(), teamId, teamName: team.name, teamLogo: team.logo, amount, timestamp: Date.now() };
          
          newData.state = {
              ...newData.state,
              currentBid: amount,
              bids: [newBid, ...newData.state.bids],
              lastActionMessage: `BID: ₹${amount}Cr by ${team.shortName}`,
              timerExpiresAt: Date.now() + (data.rules.timeConfig.bidDuration * 1000)
          };
          return newData;
      });

      if (error) return { success: false, message: error };
      return { success: true, message: "Bid Accepted" };
  };

  const resetAuction = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      await runUpdate(() => DEFAULT_DB);
      setIsLoading(false);
  };

  // --- STANDARD CRUD HELPERS ---
  const updateTeam = async (id: string, u: Partial<Team>) => runUpdate(d => ({...d, teams: d.teams.map(t => t.id === id ? { ...t, ...u } : t)}));
  const addTeam = async (t: Team) => runUpdate(d => ({...d, teams: [...d.teams, t]}));
  const deleteTeam = async (id: string) => runUpdate(d => ({...d, teams: d.teams.filter(t => t.id !== id)}));
  
  const addPlayer = async (p: Player) => runUpdate(d => ({...d, players: [...d.players, p]}));
  const updatePlayer = async (id: string, u: Partial<Player>) => runUpdate(d => ({...d, players: d.players.map(p => p.id === id ? { ...p, ...u } : p)}));
  const deletePlayer = async (id: string) => runUpdate(d => ({...d, players: d.players.filter(p => p.id !== id)}));

  const addSponsor = async (s: Sponsor) => runUpdate(d => ({...d, sponsors: [...d.sponsors, s]}));
  const updateSponsor = async (id: string, u: Partial<Sponsor>) => runUpdate(d => ({...d, sponsors: d.sponsors.map(s => s.id === id ? { ...s, ...u } : s)}));
  const deleteSponsor = async (id: string) => runUpdate(d => ({...d, sponsors: d.sponsors.filter(s => s.id !== id)}));
  const toggleSponsor = async (id: string) => runUpdate(d => ({...d, sponsors: d.sponsors.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s)}));

  const updateAuctionConfig = async (c: AuctionConfig) => runUpdate(d => ({...d, config: c}));
  const updateAuctionRules = async (r: Partial<AuctionRules>) => runUpdate(d => ({...d, rules: {...d.rules, ...r}}));
  const updateTeamBudget = async (id: string, val: number) => runUpdate(d => ({...d, teams: d.teams.map(t => t.id === id ? { ...t, budget: val } : t)}));

  // --- HELPERS ---
  const getCurrentPlayer = () => db.players.find(p => p.id === db.state.currentPlayerId);
  const getHighestBid = () => db.state.bids[0];

  // --- ROBUST TIMER LOGIC ---
  useEffect(() => {
    // 0. Safety check for undefined DB state (during init/sync)
    if (!db?.state) return;

    // 1. Sync local countdown for UI
    if (db.state.timerExpiresAt) {
        const diff = Math.ceil((db.state.timerExpiresAt - Date.now()) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
    } else {
        setTimeLeft(0);
    }

    // 2. Master Check for "Zero Second" Action
    const interval = setInterval(() => {
        // Safe check inside interval
        if (!db?.state?.timerExpiresAt) return;
        
        const now = Date.now();
        const diff = db.state.timerExpiresAt - now;

        // If time is up (and we haven't processed it yet)
        if (diff <= 0) {
            setTimeLeft(0);
            
            // ALLOW ANY CLIENT TO TRIGGER THE SALE TO PREVENT HANGS
            // The DB Adapter handles concurrency via transactions/versioning
            if (!processingRef.current) {
                // Determine Action
                if (db.state.rtmPending) {
                    resolveRTM(false); // Auto-decline if time runs out
                } else if (db.state.isBiddingActive && db.state.currentPlayerId) {
                    // Sold or Unsold
                    db.state.bids.length > 0 ? sellPlayer() : markUnsold();
                }
            }
        } else {
            setTimeLeft(Math.ceil(diff / 1000));
        }
    }, 250); 

    return () => clearInterval(interval);
  }, [db.state?.timerExpiresAt, db.state?.version, db.state?.isBiddingActive, db.state?.rtmPending]); 

  // --- AUTO MODE LOGIC (MASTER ONLY) ---
  useEffect(() => {
    // Safety check
    if (!db?.state) return;

    const isMaster = window.location.hash.includes('admin');
    const isIdle = !db.state.isBiddingActive && !db.state.currentPlayerId && !db.state.rtmPending;

    if (isMaster && isAutoMode && isIdle) {
        if (!autoNextRunRef.current) {
            autoNextRunRef.current = Date.now() + (db.rules.timeConfig.breakDuration * 1000);
        }

        const interval = setInterval(() => {
            if (!autoNextRunRef.current) return;
            
            const remaining = Math.ceil((autoNextRunRef.current - Date.now()) / 1000);
            
            if (remaining <= 0) {
                setAutoCountdown(0);
                clearInterval(interval);
                autoNextRunRef.current = null; // Reset for next time
                
                const next = db.players.find(p => p.status === PlayerStatus.Upcoming);
                if (next) {
                    startBidding(next.id);
                } else {
                    setIsAutoMode(false);
                }
            } else {
                setAutoCountdown(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);

    } else {
        autoNextRunRef.current = null;
        if (autoCountdown !== null) setAutoCountdown(null);
    }
  }, [isAutoMode, db.state?.isBiddingActive, db.state?.currentPlayerId, db.state?.rtmPending, db.state?.version]);

  return (
    <AuctionContext.Provider value={{
      teams: db.teams, 
      players: db.players, 
      sponsors: db.sponsors, 
      auctionState: db.state, 
      auctionConfig: db.config, 
      auctionRules: db.rules, 
      notification, isLoading,
      startBidding, stopBidding, resumeBidding, sellPlayer, resolveRTM, markUnsold, resetAuction,
      updateTeamBudget, updateTeam, deleteTeam, addTeam, addPlayer, updatePlayer, deletePlayer, updateAuctionConfig, updateAuctionRules,
      toggleSponsor, addSponsor, updateSponsor, deleteSponsor,
      placeBid, getCurrentPlayer, getHighestBid, getBiddingIncrement, timer: timeLeft,
      currentUser, login, logout, userStream, mediaState, toggleMic, toggleCamera,
      adminStream, isAdminLive, initAdminStream, toggleAdminLive, toggleAdminMic, adminMediaState,
      isAutoMode, toggleAutoMode, autoCountdown
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) throw new Error('useAuction must be used within an AuctionProvider');
  return context;
};
