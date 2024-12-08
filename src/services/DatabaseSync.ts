// src/services/DatabaseSync.ts
import cron from 'node-cron';
import { Pool } from 'pg';
import { UserModel, TaskModel } from '../database';

const pgPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'your_db_name',
  password: 'password',
  port: 5432,
});

export class DatabaseSync {
  static startCronJob() {
    cron.schedule('*/5 * * * *', async () => {
      try {
        // Get local data
        const users = await UserModel.getUsers();
        const tasks = await TaskModel.getTasks();

        // Insert into Postgres
        const client = await pgPool.connect();
        
        try {
          await client.query('BEGIN');

          // Sync users
          for (const user of users) {
            await client.query(
              'INSERT INTO users (id, name, email, age) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, email = $3, age = $4',
              [user.id, user.name, user.email, user.age]
            );
          }

          // Sync tasks
          for (const task of tasks) {
            await client.query(
              'INSERT INTO tasks (id, title, description, user_id, completed) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET title = $2, description = $3, user_id = $4, completed = $5',
              [task.id, task.title, task.description, task.userId, task.completed]
            );
          }

          await client.query('COMMIT');
          console.log('Data synced successfully');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    });
  }
}

