import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import dayjs from 'dayjs';
import { getDB } from '../db/Database';

// Types
export interface Trip {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: number;
}

export interface ItineraryItem {
    id: string;
    tripId: string;
    title: string;
    description: string;
    startTime: string; // ISO string
    dayIndex: number; // 0-based index relative to start date
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: number;
}

interface TripState {
    trips: Trip[];
    itineraryItems: ItineraryItem[]; // Loaded for the current selected trip usually, or all if small app
    isLoading: boolean;
    loadTrips: () => Promise<void>;
    addTrip: (title: string, startDate: string, endDate: string) => Promise<void>;
    updateTrip: (id: string, title: string, startDate: string, endDate: string) => Promise<void>;
    deleteTrip: (id: string) => Promise<void>;

    // Itinerary Actions
    loadItinerary: (tripId: string) => Promise<void>;
    addItineraryItem: (tripId: string, title: string, dayIndex: number) => Promise<void>;
    reorderItineraryItems: (items: ItineraryItem[]) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
    trips: [],
    itineraryItems: [],
    isLoading: false,

    loadTrips: async () => {
        set({ isLoading: true });
        const db = getDB();
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM trips WHERE isDeleted = 0 ORDER BY startDate ASC',
                [],
                (_: any, { rows }: any) => {
                    set({ trips: rows._array, isLoading: false });
                },
                (_: any, error: any) => {
                    console.error('Error loading trips', error);
                    set({ isLoading: false });
                    return false;
                }
            );
        });
    },

    addTrip: async (title, startDate, endDate) => {
        const db = getDB();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        return new Promise<void>((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `INSERT INTO trips (id, title, startDate, endDate, createdAt, updatedAt, isDeleted, dirty)
             VALUES (?, ?, ?, ?, ?, ?, 0, 1)`,
                    [id, title, startDate, endDate, now, now],
                    () => {
                        get().loadTrips();
                        resolve();
                    },
                    (_: any, error: any) => {
                        console.error("Error adding trip", error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    },

    updateTrip: async (id, title, startDate, endDate) => {
        const db = getDB();
        const now = new Date().toISOString();
        return new Promise<void>((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `UPDATE trips 
                 SET title = ?, startDate = ?, endDate = ?, updatedAt = ?, dirty = 1 
                 WHERE id = ?`,
                    [title, startDate, endDate, now, id],
                    () => {
                        get().loadTrips();
                        resolve();
                    },
                    (_: any, error: any) => {
                        console.error("Error updating trip", error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    },

    deleteTrip: async (id) => {
        const db = getDB();
        const now = new Date().toISOString();
        return new Promise<void>((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `UPDATE trips SET isDeleted = 1, updatedAt = ?, dirty = 1 WHERE id = ?`,
                    [now, id],
                    () => {
                        get().loadTrips();
                        resolve();
                    },
                    (_: any, error: any) => {
                        console.error("Error deleting trip", error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    },

    loadItinerary: async (tripId) => {
        set({ isLoading: true });
        const db = getDB();
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM itinerary_items WHERE tripId = ? AND isDeleted = 0 ORDER BY dayIndex ASC, orderIndex ASC',
                [tripId],
                (_: any, { rows }: any) => {
                    set({ itineraryItems: rows._array, isLoading: false });
                },
                (_: any, error: any) => {
                    console.error("Error loading itinerary", error);
                    set({ isLoading: false });
                    return false;
                }
            );
        });
    },

    addItineraryItem: async (tripId, title, dayIndex) => {
        const db = getDB();
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        // Get current max order index for the day to append
        const currentItems = get().itineraryItems.filter(i => i.dayIndex === dayIndex);
        const nextOrderIndex = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.orderIndex)) + 1 : 0;

        return new Promise<void>((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `INSERT INTO itinerary_items (id, tripId, title, description, startTime, dayIndex, orderIndex, createdAt, updatedAt, isDeleted, dirty)
                    VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, 0, 1)`,
                    [id, tripId, title, now, dayIndex, nextOrderIndex, now, now],
                    () => {
                        get().loadItinerary(tripId);
                        resolve();
                    },
                    (_: any, error: any) => {
                        console.error("Error adding itinerary item", error);
                        reject(error);
                        return false;
                    }
                );
            });
        });
    },

    reorderItineraryItems: async (items) => {
        // Optimistically update state
        set({ itineraryItems: items });

        const db = getDB();
        const now = new Date().toISOString();

        db.transaction((tx: any) => {
            items.forEach((item, index) => {
                if (item.orderIndex !== index) {
                    tx.executeSql(
                        `UPDATE itinerary_items SET orderIndex = ?, updatedAt = ?, dirty = 1 WHERE id = ?`,
                        [index, now, item.id]
                    );
                }
            });
        }, (error: any) => console.error("Error reordering", error));
    }
}));
