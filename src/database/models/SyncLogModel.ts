// database/models/SyncLogModel.ts
import SQLite from 'react-native-sqlite-storage';

export interface SyncLog {
  id?: number;
  clientId: string;
  timestamp: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  lastSyncData: string;  // Changed from dataHash to lastSyncData
}

export class SyncLogModel {
  static async createTable(db: SQLite.SQLiteDatabase): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL,
        error_message TEXT,
        last_sync_data TEXT NOT NULL
      );
    `;
    
    try {
      await db.executeSql(query);
    } catch (error) {
      console.error('Error creating sync_logs table:', error);
      throw error;
    }
  }

  static async create(syncLog: SyncLog): Promise<void> {
    const query = `
      INSERT INTO sync_logs (client_id, timestamp, status, error_message, last_sync_data)
      VALUES (?, ?, ?, ?, ?);
    `;
    
    const params = [
      syncLog.clientId,
      syncLog.timestamp,
      syncLog.status,
      syncLog.errorMessage || null,
      syncLog.lastSyncData
    ];

    try {
      const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
      await db.executeSql(query, params);
    } catch (error) {
      console.error('Error creating sync log:', error);
      throw error;
    }
  }

  static async getLastSuccessfulSync(clientId: string): Promise<SyncLog | null> {
    const query = `
      SELECT * FROM sync_logs
      WHERE client_id = ? AND status = 'success'
      ORDER BY timestamp DESC
      LIMIT 1;
    `;

    try {
      const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
      const [results] = await db.executeSql(query, [clientId]);
      if (results.rows.length > 0) {
        const item = results.rows.item(0);
        return {
          id: item.id,
          clientId: item.client_id,
          timestamp: item.timestamp,
          status: item.status,
          errorMessage: item.error_message,
          lastSyncData: item.last_sync_data
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting last successful sync:', error);
      throw error;
    }
  }
}