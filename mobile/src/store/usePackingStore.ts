import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import { getDB } from '../db/Database';
import { addToSyncQueue } from '../services/syncService';

export interface PackingItem {
    id: string;
    tripId: string;
    name: string;
    isChecked: number; // 0 or 1
    isDeleted: number; // 0 or 1
    createdAt: string;
    updatedAt: string;
}

interface PackingState {
    packingItems: PackingItem[];
    isLoading: boolean;
    loadPackingItems: (tripId: string) => Promise<void>;
    addPackingItem: (tripId: string, name: string) => Promise<void>;
    togglePackingItem: (id: string, isChecked: boolean) => Promise<void>;
    deletePackingItem: (id: string) => Promise<void>;
}

export const usePackingStore = create<PackingState>((set, get) => ({
    packingItems: [],
    isLoading: false,

    loadPackingItems: async (tripId) => {
        set({ isLoading: true });
        try {
            const db = getDB();
            const packingItems = await db.getAllAsync<PackingItem>(
                'SELECT * FROM packing_items WHERE tripId = ? AND (isDeleted = 0 OR isDeleted IS NULL) ORDER BY createdAt ASC',
                [tripId]
            );
            set({ packingItems, isLoading: false });
        } catch (error) {
            console.error('Error loading packing items', error);
            set({ isLoading: false });
        }
    },

    addPackingItem: async (tripId, name) => {
        const db = getDB();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        try {
            await db.runAsync(
                `INSERT INTO packing_items (id, tripId, name, isChecked, isDeleted, createdAt, updatedAt)
                 VALUES (?, ?, ?, 0, 0, ?, ?)`,
                [id, tripId, name, now, now]
            );

            // Queue Sync
            await addToSyncQueue('PACKING_ITEM', id, 'CREATE', {
                id, tripId, name, isChecked: false, deleted: false, createdAt: now, updatedAt: now
            });

            await get().loadPackingItems(tripId);
        } catch (error) {
            console.error("Error adding packing item", error);
            throw error;
        }
    },

    togglePackingItem: async (id, isChecked) => {
        const db = getDB();
        const now = new Date().toISOString();
        const checkedVal = isChecked ? 1 : 0;

        // Optimistic update
        const items = get().packingItems.map(item =>
            item.id === id ? { ...item, isChecked: checkedVal } : item
        );
        set({ packingItems: items });

        try {
            await db.runAsync(
                `UPDATE packing_items SET isChecked = ?, updatedAt = ? WHERE id = ?`,
                [checkedVal, now, id]
            );

            // Queue Sync
            const item = get().packingItems.find(i => i.id === id);
            if (item) {
                await addToSyncQueue('PACKING_ITEM', id, 'UPDATE', {
                    id, tripId: item.tripId, name: item.name, isChecked: !!checkedVal, deleted: !!item.isDeleted, updatedAt: now
                });
            }

        } catch (error) {
            console.error("Error toggling packing item", error);
            await get().loadPackingItems(get().packingItems[0]?.tripId || ''); // Revert on error roughly
        }
    },

    deletePackingItem: async (id) => {
        const db = getDB();
        const now = new Date().toISOString();
        const item = get().packingItems.find(i => i.id === id);
        const tripId = item?.tripId || '';

        try {
            await db.runAsync(
                `UPDATE packing_items SET isDeleted = 1, updatedAt = ? WHERE id = ?`,
                [now, id]
            );

            // Queue Sync
            if (item) {
                await addToSyncQueue('PACKING_ITEM', id, 'DELETE', {
                    id, tripId: item.tripId, name: item.name, isChecked: !!item.isChecked, deleted: true, updatedAt: now
                });
            }

            await get().loadPackingItems(tripId);
        } catch (error) {
            console.error("Error deleting packing item", error);
            throw error;
        }
    }
}));
