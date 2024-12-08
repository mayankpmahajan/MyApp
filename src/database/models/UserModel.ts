// models/UserModel.ts
import SQLite from 'react-native-sqlite-storage';
import { User } from '../types';

export class UserModel {
  static async createTable(): Promise<void> {
    const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
    
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        age INTEGER NOT NULL,
        client_id TEXT NOT NULL
      );
    `;
    
    try {
      await db.executeSql(query);
    } catch (error) {
      console.error('Error creating users table:', error);
      throw error;
    }
  }

  static async addUser(user: User): Promise<void> {
    const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
    
    const query = `
      INSERT INTO users (name, email, age, client_id)
      VALUES (?, ?, ?, ?);
    `;
    
    try {
      await db.executeSql(query, [
        user.name,
        user.email,
        user.age,
        user.clientId || 'client1'
      ]);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  static async getUsers(): Promise<User[]> {
    try {
      const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
      
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM users;',
            [],
            (_, results) => {
              const users: User[] = [];
              const len = results.rows.length;

              for (let i = 0; i < len; i++) {
                const row = results.rows.item(i);
                users.push({
                  id: row.id,
                  name: row.name,
                  email: row.email,
                  age: row.age,
                  clientId: row.client_id
                });
              }
              resolve(users);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  static async deleteAllUsers(): Promise<void> {
    try {
      const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
      
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            'DELETE FROM users;',
            [],
            (_, result) => {
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (error) {
      console.error('Error deleting all users:', error);
      throw error;
    }
  }
}