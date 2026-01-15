import axios from 'axios';
import * as Network from 'expo-network';
import { getDb } from '../db/schema';
import { useSyncStore } from '../store/syncStore';
import { Platform } from 'react-native';

const BASE_URL = 'http://localhost:8080/api'; // Use 10.0.2.2 for Android Emulator

// Helper to get correct URL based on platform
const getApiUrl = (endpoint: string) => {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${host}:8080/api${endpoint}`;
};

export const addToSyncQueue = async (entityType: string, entityId: string, operation: string, payload: any) => {
    const db = getDb();
    const jsonPayload = JSON.stringify(payload);
    const createdAt = new Date().toISOString();

    // Optimistic Update: Assume success locally, just queue it for later
    db.transaction(tx => {
        tx.executeSql(
            'INSERT INTO sync_queue (entityType, entityId, operation, payload, createdAt) VALUES (?, ?, ?, ?, ?)',
            [entityType, entityId, operation, jsonPayload, createdAt]
        );
    });

    // Try to sync immediately if online
    triggerSync();
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
        console.error("Sync failed:", error);
    } finally {
        setSyncing(false);
    }
};

const pushChanges = async () => {
    const db = getDb();

    // 1. Get queued items
    return new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM sync_queue ORDER BY id ASC', [], async (_, { rows }) => {
                const items = rows._array;
                if (items.length === 0) {
                    resolve();
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
                        type: item.entityType // mapping needed? depends on backend DTO
                    };
                });

                // 3. Send to Backend
                try {
                    await axios.post(getApiUrl('/sync/push'), { operations });

                    // 4. Clear queue on success
                    const ids = items.map(i => i.id).join(',');
                    db.transaction(cleanupTx => {
                        cleanupTx.executeSql(`DELETE FROM sync_queue WHERE id IN (${ids})`);
                    });

                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
};

const pullChanges = async () => {
    // Basic pull implementation
    // In real app, store lastSyncTimestamp in SecureStore or DB
    const response = await axios.get(getApiUrl('/sync/pull'));
    // Process response...
};
