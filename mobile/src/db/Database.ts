import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

try {
    db = SQLite.openDatabaseSync('microitinerary.db');
} catch (error) {
    console.error("Failed to open database synchronously, falling back to openDatabase", error);
    // Fallback or re-throw depending on stricter requirements. 
    // For SDK 50->54 migration, openDatabaseSync is the standard replacement.
    db = SQLite.openDatabaseSync('microitinerary.db');
}

export const initDatabase = async () => {
    try {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        title TEXT,
        startDate TEXT,
        endDate TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        isDeleted INTEGER DEFAULT 0,
        dirty INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS itinerary_items (
        id TEXT PRIMARY KEY,
        tripId TEXT,
        title TEXT,
        description TEXT,
        startTime TEXT,
        dayIndex INTEGER,
        orderIndex INTEGER,
        createdAt TEXT,
        updatedAt TEXT,
        isDeleted INTEGER DEFAULT 0,
        dirty INTEGER DEFAULT 0,
        FOREIGN KEY (tripId) REFERENCES trips (id)
      );

      CREATE TABLE IF NOT EXISTS packing_items (
        id TEXT PRIMARY KEY,
        tripId TEXT,
        name TEXT,
        isChecked INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT,
        isDeleted INTEGER DEFAULT 0,
        dirty INTEGER DEFAULT 0,
        FOREIGN KEY (tripId) REFERENCES trips (id)
      );
    `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export const getDB = () => db;
