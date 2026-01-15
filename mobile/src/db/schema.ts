import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('microitinerary.db');

export const initDatabase = () => {
    db.transaction(tx => {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        name TEXT,
        location TEXT,
        startDate TEXT,
        endDate TEXT,
        travelType TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`
        );
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS activities (
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
      );`
        );
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT,
        entityId TEXT,
        operation TEXT,
        payload TEXT,
        createdAt TEXT
      );`
        );
    });
};

export const getDb = () => db;
