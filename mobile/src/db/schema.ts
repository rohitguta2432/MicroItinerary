import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

try {
  db = SQLite.openDatabaseSync('microitinerary.db');
} catch (error) {
  // console.error("Failed to open database synchronously", error);
  db = SQLite.openDatabaseSync('microitinerary.db');
}

export const initDatabase = async () => {
  try {
    await db.execAsync(`
            PRAGMA journal_mode = WAL;

            CREATE TABLE IF NOT EXISTS trips (
                id TEXT PRIMARY KEY,
                name TEXT,
                location TEXT,
                startDate TEXT,
                endDate TEXT,
                travelType TEXT,
                createdAt TEXT,
                updatedAt TEXT,
                isDeleted INTEGER DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS activities (
                id TEXT PRIMARY KEY,
                tripId TEXT,
                dayId TEXT,
                timeBlock TEXT,
                sortOrder INTEGER,
                placeName TEXT,
                notes TEXT,
                durationMinutes INTEGER,
                estimatedCost REAL,
                status TEXT,
                startTime TEXT,
                createdAt TEXT,
                updatedAt TEXT
            );

            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entityType TEXT,
                entityId TEXT,
                operation TEXT,
                payload TEXT,
                createdAt TEXT
            );
            
            CREATE TABLE IF NOT EXISTS packing_items (
                id TEXT PRIMARY KEY,
                tripId TEXT,
                name TEXT,
                isChecked INTEGER DEFAULT 0,
                isDeleted INTEGER DEFAULT 0,
                createdAt TEXT,
                updatedAt TEXT
            );

            -- Migration for existing tables
            try {
                await db.execAsync('ALTER TABLE trips ADD COLUMN isDeleted INTEGER DEFAULT 0');
            } catch (e) {
                // Ignore if column exists
            }
        `);
  } catch (error) {
    console.error("Error initializing schema database", error);
  }
};

export const getDb = () => db;
