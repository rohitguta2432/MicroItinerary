import axios from 'axios';
import * as Network from 'expo-network';
import { getDb } from '../db/schema';
import { useSyncStore } from '../store/syncStore';
import { Platform } from 'react-native';

const BASE_URL = 'http://localhost:8080/api'; // Use 10.0.2.2 for Android Emulator

// Helper to get correct URL based on platform
const getApiUrl = (endpoint: string) => {
    // Basic heuristic: if in emulator (often 'localhost' fails on Android), use 10.0.2.2
    // If running on physical device, you need LAN IP.
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:8080/api${endpoint}`;
};

export const addToSyncQueue = async (entityType: string, entityId: string, operation: string, payload: any) => {
    const db = getDb();
    const jsonPayload = JSON.stringify(payload);
    const createdAt = new Date().toISOString();

    try {
        await db.runAsync(
            'INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt) VALUES (?, ?, ?, ?, ?)',
            [entityType, entityId, operation, jsonPayload, createdAt]
        );
        // Try to sync immediately if online
        triggerSync();
    } catch (error) {
        console.error("Error adding to sync queue", error);
    }
};

export const triggerSync = async () => {
    const { isSycing, setSyncing, setLastSync } = useSyncStore.getState();
    if (isSycing) return;

    const netInfo = await Network.getNetworkStateAsync();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) return;

    setSyncing(true);

    try {
        await pushChanges();
        await pullChanges();
        setLastSync(new Date());
    } catch (error) {
        // console.error("Sync failed:", error); // Silent fail or toast
    } finally {
        setSyncing(false);
    }
};

const pushChanges = async () => {
    const db = getDb();

    // 1. Get queued items
    try {
        const items = await db.getAllAsync<any>('SELECT * FROM sync_queue ORDER BY id ASC');

        if (items.length === 0) {
            return;
        }

        // 2. Transform to API format
        const operations = items.map(item => {
            const payload = JSON.parse(item.payload);
            return {
                ...payload,
                id: item.entityId, // Ensure ID matches
                operation: item.operation,
                clientUpdatedAt: item.createdAt, // Use queue creation time as client update time
                entityType: item.entityType
            };
        });

        // 3. Send to Backend
        await axios.post(getApiUrl('/sync/push'), { operations });

        // 4. Clear queue on success
        const ids = items.map(i => i.id).join(',');
        await db.runAsync(`DELETE FROM sync_queue WHERE id IN (${ids})`);

    } catch (error) {
        console.error("Error pushing changes", error);
        throw error;
    }
};

const pullChanges = async () => {
    const { lastSync, setLastSync } = useSyncStore.getState();
    const db = getDb();

    // Default to epoch if no last sync
    const since = lastSync ? lastSync.toISOString() : '2000-01-01T00:00:00';

    try {
        const response = await axios.get(getApiUrl(`/sync/pull?since=${since}`));
        const { lastSyncTimestamp, changes } = response.data;

        if (!changes || changes.length === 0) {
            setLastSync(new Date());
            return;
        }

        for (const item of changes) {
            // Determine type based on fields
            if (item.hasOwnProperty('travelType')) {
                // It's a Trip
                await upsertTrip(db, item);
            } else if (item.hasOwnProperty('placeName')) {
                // It's an Activity
                await upsertActivity(db, item);
            } else if (item.hasOwnProperty('isChecked')) {
                // It's a Packing Item
                await upsertPackingItem(db, item);
            }
        }

        setLastSync(new Date());

        // Refresh stores
        // Ideally stores should listen to DB changes, but for now trigger reloads
        // We can't easily access store instances here without importing them or using events.
        // Simple reload of current view data if needed, or let user pull to refresh.

    } catch (error) {
        console.error("Error pulling changes", error);
    }
};

const upsertTrip = async (db: any, trip: any) => {
    // Check if exists
    const results = await db.getAllAsync('SELECT updatedAt FROM trips WHERE id = ?', [trip.id]);
    const existing = results.length > 0 ? results[0] : null;
    if (existing) {
        // Update
        await db.runAsync(
            `UPDATE trips SET name=?, location=?, startDate=?, endDate=?, travelType=?, updatedAt=?, isDeleted=? WHERE id=?`,
            [trip.name, trip.location, trip.startDate, trip.endDate, trip.travelType, trip.updatedAt, 0, trip.id] // Assuming server sends 0 for isDeleted? Or need handling
        );
    } else {
        // Insert
        await db.runAsync(
            `INSERT INTO trips (id, name, location, startDate, endDate, travelType, createdAt, updatedAt, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
            [trip.id, trip.name, trip.location, trip.startDate, trip.endDate, trip.travelType, trip.createdAt || trip.updatedAt, trip.updatedAt]
        );
    }
};

const upsertActivity = async (db: any, activity: any) => {
    const results = await db.getAllAsync('SELECT updatedAt FROM activities WHERE id = ?', [activity.id]);
    const existing = results.length > 0 ? results[0] : null;
    const status = activity.status || 'PLANNED';
    if (existing) {
        await db.runAsync(
            `UPDATE activities SET tripId=?, dayId=?, placeName=?, notes=?, startTime=?, sortOrder=?, status=?, updatedAt=? WHERE id=?`,
            [activity.tripId, activity.dayId, activity.placeName, activity.notes, activity.startTime, activity.sortOrder, status, activity.updatedAt, activity.id]
        );
    } else {
        await db.runAsync(
            `INSERT INTO activities (id, tripId, dayId, placeName, notes, startTime, sortOrder, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [activity.id, activity.tripId, activity.dayId, activity.placeName, activity.notes, activity.startTime, activity.sortOrder, status, activity.createdAt || activity.updatedAt, activity.updatedAt]
        );
    }
};

const upsertPackingItem = async (db: any, item: any) => {
    const results = await db.getAllAsync('SELECT updatedAt FROM packing_items WHERE id = ?', [item.id]);
    const existing = results.length > 0 ? results[0] : null;
    const isChecked = item.checked ? 1 : 0; // Check java field name 'checked' vs 'isChecked'
    const isDeleted = item.deleted ? 1 : 0;

    if (existing) {
        await db.runAsync(
            `UPDATE packing_items SET tripId=?, name=?, isChecked=?, isDeleted=?, updatedAt=? WHERE id=?`,
            [item.tripId, item.name, isChecked, isDeleted, item.updatedAt, item.id]
        );
    } else {
        await db.runAsync(
            `INSERT INTO packing_items (id, tripId, name, isChecked, isDeleted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.id, item.tripId, item.name, isChecked, isDeleted, item.createdAt || item.updatedAt, item.updatedAt]
        );
    }
};
