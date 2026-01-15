import { create } from 'zustand';

interface SyncState {
    isSycing: boolean;
    lastSync: Date | null;
    setSyncing: (status: boolean) => void;
    setLastSync: (date: Date) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    isSycing: false,
    lastSync: null,
    setSyncing: (status) => set({ isSycing: status }),
    setLastSync: (date) => set({ lastSync: date }),
}));
