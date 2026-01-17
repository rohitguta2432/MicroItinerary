import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import dayjs from 'dayjs';
import { getDB } from '../db/Database';

// Types
// Types
export interface Trip {
    id: string;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    travelType?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: number;
}

export interface ItineraryItem {
    id: string;
    tripId: string;
    placeName: string;
    notes: string;
    startTime: string; // ISO string
    dayId: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: number;
}

interface TripState {
    trips: Trip[];
    itineraryItems: ItineraryItem[];
    isLoading: boolean;
    loadTrips: () => Promise<void>;
    addTrip: (name: string, location: string, startDate: string, endDate: string) => Promise<void>;
    updateTrip: (id: string, name: string, startDate: string, endDate: string) => Promise<void>;
    deleteTrip: (id: string) => Promise<void>;

    // Itinerary Actions
    loadItinerary: (tripId: string) => Promise<void>;
    addItineraryItem: (tripId: string, placeName: string, dayId: string) => Promise<void>;
    reorderItineraryItems: (items: ItineraryItem[]) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
    trips: [],
    itineraryItems: [],
    isLoading: false,

    loadTrips: async () => {
        set({ isLoading: true });
        try {
            const db = getDB();
            const trips = await db.getAllAsync<Trip>('SELECT * FROM trips WHERE isDeleted = 0 OR isDeleted IS NULL ORDER BY startDate ASC');
            set({ trips, isLoading: false });
        } catch (error) {
            console.error('Error loading trips', error);
            set({ isLoading: false });
        }
    },

    addTrip: async (name, location, startDate, endDate) => {
        const db = getDB();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        try {
            await db.runAsync(
                `INSERT INTO trips (id, name, location, startDate, endDate, createdAt, updatedAt, isDeleted)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
                [id, name, location, startDate, endDate, now, now]
            );
            await get().loadTrips();
        } catch (error) {
            console.error("Error adding trip", error);
            throw error;
        }
    },

    updateTrip: async (id, name, startDate, endDate) => {
        const db = getDB();
        const now = new Date().toISOString();
        try {
            await db.runAsync(
                `UPDATE trips 
                 SET name = ?, startDate = ?, endDate = ?, updatedAt = ? 
                 WHERE id = ?`,
                [name, startDate, endDate, now, id]
            );
            await get().loadTrips();
        } catch (error) {
            console.error("Error updating trip", error);
            throw error;
        }
    },

    deleteTrip: async (id) => {
        const db = getDB();
        const now = new Date().toISOString();
        try {
            await db.runAsync(
                `UPDATE trips SET isDeleted = 1, updatedAt = ? WHERE id = ?`,
                [now, id]
            );
            await get().loadTrips();
        } catch (error) {
            console.error("Error deleting trip", error);
            throw error;
        }
    },

    loadItinerary: async (tripId) => {
        set({ isLoading: true });
        try {
            const db = getDB();
            const itineraryItems = await db.getAllAsync<ItineraryItem>(
                'SELECT * FROM activities WHERE tripId = ? AND (status != "DELETED" OR status IS NULL) ORDER BY dayId ASC, sortOrder ASC',
                [tripId]
            );
            set({ itineraryItems, isLoading: false });
        } catch (error) {
            console.error("Error loading itinerary", error);
            set({ isLoading: false });
        }
    },

    addItineraryItem: async (tripId, placeName, dayId) => {
        const db = getDB();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // Get current max order index for the day to append
        const currentItems = get().itineraryItems.filter(i => i.dayId === dayId);
        // Safely calculate nextSortOrder
        const maxOrder = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.sortOrder || 0)) : 0;
        const nextSortOrder = maxOrder + 1;

        try {
            await db.runAsync(
                `INSERT INTO activities (id, tripId, placeName, dayId, sortOrder, status, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, 'PLANNED', ?, ?)`,
                [id, tripId, placeName, dayId, nextSortOrder, now, now]
            );
            await get().loadItinerary(tripId);
        } catch (error) {
            console.error("Error adding itinerary item", error);
            throw error;
        }
    },

    reorderItineraryItems: async (items) => {
        // Optimistically update state
        set({ itineraryItems: items });

        const db = getDB();
        const now = new Date().toISOString();

        try {
            await db.withTransactionAsync(async () => {
                for (let index = 0; index < items.length; index++) {
                    const item = items[index];
                    // Note: This logic assumes items are passed in the desired order
                    if (item.sortOrder !== index) {
                        await db.runAsync(
                            `UPDATE activities SET sortOrder = ?, updatedAt = ? WHERE id = ?`,
                            [index, now, item.id]
                        );
                    }
                }
            });
        } catch (error) {
            console.error("Error reordering", error);
            // Optionally revert state here if needed
        }
    }
}));

