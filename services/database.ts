
import { Team, Player, Sponsor, AuctionConfig, AuctionRules, AuctionState, AuctionNotification } from '../types';
import { INITIAL_PLAYERS, INITIAL_TEAMS, INITIAL_SPONSORS, AUCTION_RULES } from '../constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const USE_SUPABASE = true; 

// --- SUPABASE CREDENTIALS ---
const SUPABASE_URL: string = "https://gitbzgkhyhvzdpcekuqg.supabase.co"; 
const SUPABASE_KEY: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdGJ6Z2toeWh2emRwY2VrdXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDA2MTgsImV4cCI6MjA4MTY3NjYxOH0.uiweUiYZxBN2d-LQpUB58uNfnjir6LfKluxcFC3i7SA"; 

// --- DATA STRUCTURE ---
export interface DBStructure {
    teams: Team[];
    players: Player[];
    sponsors: Sponsor[];
    config: AuctionConfig;
    rules: AuctionRules;
    state: AuctionState;
    auth: Record<string, string>;
}

export const DEFAULT_DB: DBStructure = {
    teams: INITIAL_TEAMS,
    players: INITIAL_PLAYERS,
    sponsors: INITIAL_SPONSORS,
    config: {
        title: 'IPL Auction 2025',
        subTitle: 'Grand Command Center',
        location: 'Live from Mumbai Arena',
        broadcastLabel: 'Official Broadcast',
        tickerPrefix: 'Auction Updates'
    },
    rules: AUCTION_RULES,
    state: {
        currentPlayerId: null,
        currentBid: 0,
        bids: [],
        isBiddingActive: false,
        lastActionMessage: "System Online. Waiting for Auctioneer...",
        rtmPending: false,
        timerExpiresAt: null,
        version: 0
    },
    auth: {
        't1': 'csk', 't2': 'mi', 't3': 'rcb', 't4': 'kkr', 't5': 'gt',
        't6': 'dc', 't7': 'lsg', 't8': 'pbks', 't9': 'rr', 't10': 'srh'
    }
};

// --- HELPER: ENSURE DATA INTEGRITY ---
// This prevents "undefined reading version" or "state" errors if DB has "{}"
const ensureStructure = (incoming: any): DBStructure => {
    // Deep copy defaults to avoid reference mutation issues
    const defaults = JSON.parse(JSON.stringify(DEFAULT_DB));
    
    if (!incoming || typeof incoming !== 'object') return defaults;

    // Merge incoming data over defaults
    const result = { ...defaults, ...incoming };

    // Critical Object Checks
    if (!result.state || Object.keys(result.state).length === 0) result.state = defaults.state;
    if (!result.config) result.config = defaults.config;
    if (!result.rules) result.rules = defaults.rules;
    if (!result.auth) result.auth = defaults.auth;

    // Array Checks
    if (!Array.isArray(result.teams)) result.teams = defaults.teams;
    if (!Array.isArray(result.players)) result.players = defaults.players;
    if (!Array.isArray(result.sponsors)) result.sponsors = defaults.sponsors;

    // Specific Property Checks
    if (typeof result.state.version !== 'number') result.state.version = 0;

    return result as DBStructure;
};

// --- INTERFACE ---
export interface DatabaseAdapter {
    initialize: () => Promise<DBStructure>;
    subscribe: (callback: (data: DBStructure, notification?: AuctionNotification) => void) => void;
    update: (updater: (current: DBStructure) => DBStructure, notification?: AuctionNotification) => Promise<boolean>;
}

// --- ADAPTER 1: SUPABASE (SQL) ---
class SupabaseAdapter implements DatabaseAdapter {
    private supabase: SupabaseClient | null = null;
    private CHANNEL_NAME = 'auction_channel';
    private TABLE_NAME = 'auction_state';

    constructor() {
        if (USE_SUPABASE) {
             if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR_SUPABASE_URL")) {
                 console.warn("Supabase Config missing. Using Local Mode.");
                 return;
             }
             this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    }

    async initialize(): Promise<DBStructure> {
        if (!this.supabase) return DEFAULT_DB;

        try {
            // Attempt to fetch data with a timeout to prevent hanging forever
            const fetchPromise = this.supabase
                .from(this.TABLE_NAME)
                .select('data')
                .eq('id', 1)
                .single();
                
            // Timeout after 5 seconds
            const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) => 
                setTimeout(() => reject(new Error('Supabase Init Timeout')), 5000)
            );

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

            if (error || !data) {
                console.log("Supabase: Row missing or Error, attempting to seed...", error);
                
                // If table exists but row is missing, insert default
                // If table missing, this will fail, and we fall back to DEFAULT_DB (Local Mode equivalent)
                try {
                    const { error: insertError } = await this.supabase.from(this.TABLE_NAME).upsert({ id: 1, data: DEFAULT_DB });
                    if (insertError) console.error("Supabase Seeding Error:", insertError);
                } catch (seedErr) {
                    console.error("Supabase Critical Fail:", seedErr);
                }
                return DEFAULT_DB;
            }
            
            // Validate incoming data structure
            const structuredData = ensureStructure(data.data);
            
            // Self-heal empty state
            if (!data.data || Object.keys(data.data).length === 0 || !data.data.state) {
                console.log("Supabase: Empty/Partial data detected, repairing...");
                await this.supabase.from(this.TABLE_NAME).update({ data: structuredData }).eq('id', 1);
            }

            return structuredData;
        } catch (err) {
            console.error("Supabase Connection Error/Timeout:", err);
            return DEFAULT_DB;
        }
    }

    subscribe(callback: (data: DBStructure, notification?: AuctionNotification) => void) {
        if (!this.supabase) return;

        this.supabase
            .channel(this.CHANNEL_NAME)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: this.TABLE_NAME, filter: 'id=eq.1' },
                (payload) => {
                    const safeData = ensureStructure(payload.new.data);
                    callback(safeData, undefined);
                }
            )
            .subscribe();
    }

    async update(updater: (current: DBStructure) => DBStructure, notification?: AuctionNotification): Promise<boolean> {
        if (!this.supabase) return false;

        const { data: currentData, error: fetchError } = await this.supabase.from(this.TABLE_NAME).select('data').eq('id', 1).single();
        
        if (fetchError || !currentData) {
            console.error("Update failed: Could not fetch current state", fetchError);
            return false;
        }

        const safeCurrent = ensureStructure(currentData.data);
        const newData = updater(safeCurrent);
        
        if (!newData.state) newData.state = { ...DEFAULT_DB.state };
        newData.state.version = (newData.state.version || 0) + 1;

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .update({ data: newData })
            .eq('id', 1);

        if (error) console.error("Update failed:", error);
        return !error;
    }
}

// --- ADAPTER 2: LOCAL STORAGE (Fallback) ---
class LocalAdapter implements DatabaseAdapter {
    private channel: BroadcastChannel;
    private STORAGE_KEY = 'ipl_auction_db_v4';

    constructor() {
        this.channel = new BroadcastChannel('ipl_auction_live_feed');
    }

    async initialize(): Promise<DBStructure> {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) return ensureStructure(JSON.parse(stored));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_DB));
        return DEFAULT_DB;
    }

    subscribe(callback: (data: DBStructure, notification?: AuctionNotification) => void) {
        this.channel.onmessage = (event) => {
            const { notification: remoteNotification } = event.data;
            const freshData = localStorage.getItem(this.STORAGE_KEY);
            if (freshData) callback(ensureStructure(JSON.parse(freshData)), remoteNotification);
        };
        window.addEventListener('storage', (e) => {
             if (e.key === this.STORAGE_KEY && e.newValue) callback(ensureStructure(JSON.parse(e.newValue)));
        });
    }

    async update(updater: (current: DBStructure) => DBStructure, notification?: AuctionNotification): Promise<boolean> {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        const current = raw ? ensureStructure(JSON.parse(raw)) : DEFAULT_DB;
        const next = updater(current);
        next.state.version = (next.state.version || 0) + 1;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(next));
        this.channel.postMessage({ type: 'UPDATE', payload: { version: next.state.version }, notification });
        return true;
    }
}

// --- FACTORY ---
export const getDatabaseAdapter = (): DatabaseAdapter => {
    // Prioritize Supabase if configured, otherwise fallback to Local
    if (USE_SUPABASE && SUPABASE_URL && !SUPABASE_URL.includes("YOUR_SUPABASE_URL")) return new SupabaseAdapter();
    return new LocalAdapter();
};
