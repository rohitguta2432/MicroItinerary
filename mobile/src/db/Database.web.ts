import { Platform } from 'react-native';

// Mock database for Web environment using LocalStorage
// This is a simplified adapter to support the existing SQL-based store logic
// In a real production app, consider using a proper ORM or Repository pattern that abstracts the storage mechanism

class MockWebDatabase {
    private data: { trips: any[]; itinerary_items: any[]; packing_items: any[] };
    private storageKey = 'microitinerary_db_v1';

    constructor() {
        this.data = { trips: [], itinerary_items: [], packing_items: [] };
        this.load();
    }

    private load() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                try {
                    this.data = JSON.parse(stored);
                    console.log('[WebDB] Loaded data', this.data);
                } catch (e) {
                    console.error('[WebDB] Failed to parse stored data', e);
                }
            }
        }
    }

    private save() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        }
    }

    async execAsync(sql: string): Promise<void> {
        // Initial setup - mainly CREATE TABLE calls
        console.log('[WebDB] execAsync:', sql);
        // No-op for CREATE TABLE as we use a fixed JSON structure
        return Promise.resolve();
    }

    async runAsync(sql: string, params: any[] = []): Promise<any> {
        console.log('[WebDB] runAsync:', sql, params);

        // Simple naive SQL parser for the specific queries used in the app
        const normalizedSql = sql.trim();

        // INSERT INTO trips
        if (normalizedSql.includes('INSERT INTO trips')) {
            const [id, title, startDate, endDate, createdAt, updatedAt] = params;
            const newTrip = { id, title, startDate, endDate, createdAt, updatedAt, isDeleted: 0, dirty: 1 };
            this.data.trips.push(newTrip);
            this.save();
            return { changes: 1, lastInsertRowId: 1 };
        }

        // UPDATE trips
        if (normalizedSql.includes('UPDATE trips')) {
            // Check if it's a delete (soft delete)
            if (normalizedSql.includes('isDeleted = 1')) {
                const [updatedAt, id] = params;
                const trip = this.data.trips.find(t => t.id === id);
                if (trip) {
                    trip.isDeleted = 1;
                    trip.updatedAt = updatedAt;
                    trip.dirty = 1;
                    this.save();
                    return { changes: 1 };
                }
            } else {
                // Normal update
                const [title, startDate, endDate, updatedAt, id] = params;
                const trip = this.data.trips.find(t => t.id === id);
                if (trip) {
                    trip.title = title;
                    trip.startDate = startDate;
                    trip.endDate = endDate;
                    trip.updatedAt = updatedAt;
                    trip.dirty = 1;
                    this.save();
                    return { changes: 1 };
                }
            }
        }

        // INSERT INTO itinerary_items
        if (normalizedSql.includes('INSERT INTO itinerary_items')) {
            const [id, tripId, title, description, startTime, dayIndex, orderIndex, createdAt, updatedAt] = params;
            const newItem = { id, tripId, title, description, startTime, dayIndex, orderIndex, createdAt, updatedAt, isDeleted: 0, dirty: 1 };
            this.data.itinerary_items.push(newItem);
            this.save();
            return { changes: 1, lastInsertRowId: 1 };
        }

        // UPDATE itinerary_items (Reorder)
        if (normalizedSql.includes('UPDATE itinerary_items SET orderIndex')) {
            const [orderIndex, updatedAt, id] = params;
            const item = this.data.itinerary_items.find(i => i.id === id);
            if (item) {
                item.orderIndex = orderIndex;
                item.updatedAt = updatedAt;
                item.dirty = 1;
                this.save();
                return { changes: 1 };
            }
        }

        console.warn('[WebDB] Unhandled runAsync SQL:', sql);
        return { changes: 0 };
    }

    async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
        console.log('[WebDB] getAllAsync:', sql, params);

        // SELECT * FROM trips
        if (sql.includes('SELECT * FROM trips')) {
            return this.data.trips.filter(t => t.isDeleted === 0).sort((a, b) => a.startDate.localeCompare(b.startDate)) as unknown as T[];
        }

        // SELECT * FROM itinerary_items
        if (sql.includes('SELECT * FROM itinerary_items')) {
            const [tripId] = params;
            return this.data.itinerary_items
                .filter(i => i.tripId === tripId && i.isDeleted === 0)
                .sort((a, b) => {
                    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
                    return a.orderIndex - b.orderIndex;
                }) as unknown as T[];
        }

        return [];
    }

    async withTransactionAsync(callback: () => Promise<void>): Promise<void> {
        // Web mock doesn't need real transactions for now
        await callback();
    }
}

// Singleton instance
const db = new MockWebDatabase();

export const initDatabase = async () => {
    console.log('Initializing Web Database Adapter');
    // No async init needed for sync localStorage, but keeping interface
    return Promise.resolve();
};

export const getDB = () => {
    return db as any; // Cast to any to satisfy the SQLiteDatabase interface expectation in Store
};
