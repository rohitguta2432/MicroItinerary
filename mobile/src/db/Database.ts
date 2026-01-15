import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('microitinerary.db');

export const initDatabase = () => {
    return new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
            // Trips Table
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS trips (
          id TEXT PRIMARY KEY,
          title TEXT,
          startDate TEXT,
          endDate TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          isDeleted INTEGER DEFAULT 0,
          dirty INTEGER DEFAULT 0
        );`
            );

            // Itinerary Items Table
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS itinerary_items (
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
        );`
            );

            // Packing Items Table
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS packing_items (
          id TEXT PRIMARY KEY,
          tripId TEXT,
          name TEXT,
          isChecked INTEGER DEFAULT 0,
          createdAt TEXT,
          updatedAt TEXT,
          isDeleted INTEGER DEFAULT 0,
          dirty INTEGER DEFAULT 0,
          FOREIGN KEY (tripId) REFERENCES trips (id)
        );`,
                [],
                () => resolve(),
                (_, error) => {
                    console.error('Error creating tables', error);
                    reject(error);
                    return false;
                }
            );
        });
    });
};

export const getDB = () => db;
