// Mock database for Web environment using LocalStorage for Schema/Sync
// This duplicates some logic from Database.web.ts but focuses on the schema.ts exports

class MockWebSchemaDatabase {
    private data: { sync_queue: any[] };
    private storageKey = 'microitinerary_sync_db_v1';

    constructor() {
        this.data = { sync_queue: [] };
        this.load();
    }

    private load() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                try {
                    this.data = JSON.parse(stored);
                } catch (e) {
                    console.error('[WebDB] Failed to parse stored sync data', e);
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
        console.log('[WebSchemaDB] execAsync:', sql);
        return Promise.resolve();
    }

    async runAsync(sql: string, params: any[] = []): Promise<any> {
        console.log('[WebSchemaDB] runAsync:', sql, params);

        // INSERT INTO sync_queue
        if (sql.includes('INSERT INTO sync_queue')) {
            // entityType, entityId, operation, payload, createdAt
            const [entityType, entityId, operation, payload, createdAt] = params;
            // Mock ID autoincrement
            const id = Date.now();
            const newItem = { id, entityType, entityId, operation, payload, createdAt };
            this.data.sync_queue.push(newItem);
            this.save();
            return { changes: 1, lastInsertRowId: id };
        }

        // DELETE FROM sync_queue
        if (sql.includes('DELETE FROM sync_queue')) {
            // Simple clear or ID based delete
            if (sql.includes('WHERE id IN')) {
                // Very basic parsing for IN clause
                // Expected: DELETE FROM sync_queue WHERE id IN (1,2,3)
                const match = sql.match(/\(([^)]+)\)/);
                if (match) {
                    const idsToDelete = match[1].split(',').map(s => Number(s.trim()));
                    this.data.sync_queue = this.data.sync_queue.filter(i => !idsToDelete.includes(i.id));
                    this.save();
                    return { changes: idsToDelete.length };
                }
            }
        }

        return { changes: 0 };
    }

    async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
        console.log('[WebSchemaDB] getAllAsync:', sql);

        // SELECT * FROM sync_queue
        if (sql.includes('SELECT * FROM sync_queue')) {
            return this.data.sync_queue as unknown as T[];
        }

        return [];
    }
}

const db = new MockWebSchemaDatabase();

export const initDatabase = async () => {
    console.log('Initializing Web Schema Database');
    return Promise.resolve();
};

export const getDb = () => db as any;
