import axios from 'axios';
import { getDB } from '../db/Database';

// Replace with your actual local IP for testing on device/emulator
const API_URL = 'http://10.0.2.2:8080/api/sync';

export const syncData = async () => {
    try {
        const db = getDB();
        const changes = await getLocalChanges(db);
        const lastSyncTimestamp = await getLastSyncTimestamp(); // You'll need to persist this somewhere

        const response = await axios.post(API_URL, {
            lastSyncTimestamp,
            trips: changes.trips,
            itineraryItems: changes.itineraryItems,
            packingItems: changes.packingItems,
        });

        const serverData = response.data;

        await applyServerChanges(db, serverData);
        await markLocalChangesAsClean(db, changes);
        await saveLastSyncTimestamp(serverData.syncTimestamp);

        console.log('Sync completed successfully');
    } catch (error) {
        console.error('Sync failed', error);
    }
};

const getLocalChanges = (db: any): Promise<any> => {
    return new Promise((resolve) => {
        const changes = { trips: [], itineraryItems: [], packingItems: [] };
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM trips WHERE dirty = 1',
                [],
                (_: any, { rows }: any) => { changes.trips = rows._array; }
            );
            tx.executeSql(
                'SELECT * FROM itinerary_items WHERE dirty = 1',
                [],
                (_: any, { rows }: any) => { changes.itineraryItems = rows._array; }
            );
            tx.executeSql(
                'SELECT * FROM packing_items WHERE dirty = 1',
                [],
                (_: any, { rows }: any) => {
                    changes.packingItems = rows._array;
                    resolve(changes);
                }
            );
        });
    });
};

const applyServerChanges = (db: any, serverData: any) => {
    return new Promise<void>((resolve) => {
        db.transaction((tx: any) => {
            // Apply Trips
            serverData.trips.forEach((trip: any) => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO trips (id, title, startDate, endDate, createdAt, updatedAt, isDeleted, dirty)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
                    [trip.id, trip.title, trip.startDate, trip.endDate, trip.createdAt, trip.updatedAt, trip.isDeleted]
                );
            });
            // Apply Itinerary Items
            serverData.itineraryItems.forEach((item: any) => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO itinerary_items (id, tripId, title, description, startTime, dayIndex, orderIndex, createdAt, updatedAt, isDeleted, dirty)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                    [item.id, item.tripId, item.title, item.description, item.startTime, item.dayIndex, item.orderIndex, item.createdAt, item.updatedAt, item.isDeleted]
                );
            });
            // Apply Packing Items
            serverData.packingItems.forEach((item: any) => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO packing_items (id, tripId, name, isChecked, createdAt, updatedAt, isDeleted, dirty)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
                    [item.id, item.tripId, item.name, item.isChecked, item.createdAt, item.updatedAt, item.isDeleted]
                );
            });
        }, (error: any) => console.error('Error applying server changes', error), resolve);
    });
}

const markLocalChangesAsClean = (db: any, changes: any) => {
    return new Promise<void>((resolve) => {
        db.transaction((tx: any) => {
            changes.trips.forEach((t: any) => tx.executeSql('UPDATE trips SET dirty = 0 WHERE id = ?', [t.id]));
            changes.itineraryItems.forEach((t: any) => tx.executeSql('UPDATE itinerary_items SET dirty = 0 WHERE id = ?', [t.id]));
            changes.packingItems.forEach((t: any) => tx.executeSql('UPDATE packing_items SET dirty = 0 WHERE id = ?', [t.id]));
        }, (error: any) => console.error(error), resolve);
    });
}

// Simple in-memory storage for timestamp for now (should utilize AsyncStorage)
let lastTimestamp: string | null = null;
const getLastSyncTimestamp = async () => lastTimestamp;
const saveLastSyncTimestamp = async (ts: string) => { lastTimestamp = ts; };
