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

interface TripState {
    trips: Trip[];
    isLoading: boolean;
    loadTrips: () => Promise<void>;
    addTrip: (title: string, startDate: string, endDate: string) => Promise<void>;
    updateTrip: (id: string, title: string, startDate: string, endDate: string) => Promise<void>;
    deleteTrip: (id: string) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
    trips: [],
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
    }
}));
