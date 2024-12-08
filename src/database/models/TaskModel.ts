// models/TaskModel.ts
import SQLite from 'react-native-sqlite-storage';
import { Task } from '../types';

export class TaskModel {
  static async createTable(): Promise<void> {
    const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
    
    const query = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        completed BOOLEAN NOT NULL,
        client_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `;
    
    try {
      await db.executeSql(query);
    } catch (error) {
      console.error('Error creating tasks table:', error);
      throw error;
    }
  }

  static async addTask(task: Task): Promise<void> {
    const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
    
    const query = `
      INSERT INTO tasks (title, description, user_id, completed, client_id)
      VALUES (?, ?, ?, ?, ?);
    `;
    
    try {
      await db.executeSql(query, [
        task.title,
        task.description,
        task.userId,
        task.completed ? 1 : 0,
        task.clientId
      ]);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  static async getTasks(): Promise<Task[]> {
    try {
      const db = await SQLite.openDatabase({ name: 'myapp.db', location: 'default' });
      
      return new Promise((resolve, reject) => {
        db.transaction((tx) => {
          tx.executeSql(
            'SELECT * FROM tasks;',
            [],
            (_, results) => {
              const tasks: Task[] = [];
              const len = results.rows.length;
  
              for (let i = 0; i < len; i++) {
                const row = results.rows.item(i);
                tasks.push({
                  id: row.id,
                  title: row.title,
                  description: row.description,
                  userId: row.user_id,
                  completed: Boolean(row.completed),
                  clientId: row.client_id
                });
              }
              resolve(tasks);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        });
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }
}