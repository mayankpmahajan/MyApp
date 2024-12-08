// database/index.ts
import SQLite from 'react-native-sqlite-storage';
import { UserModel } from './models/UserModel';
import { TaskModel } from './models/TaskModel';
import { SyncLogModel } from './models/SyncLogModel';

const db = SQLite.openDatabase(
 { name: 'myapp.db', location: 'default' },
 () => console.log('Database opened successfully'),
 error => console.error('Error opening database:', error)
);

const initializeDatabase = async (): Promise<void> => {
 try {
   // Create tables
   await UserModel.createTable();
   await TaskModel.createTable();
   await SyncLogModel.createTable(db);
   
   // Initialize sample data
   await UserModel.addUser({
     name: 'John Doe',
     email: 'john@example.com', 
     age: 25,
     clientId: 'client1' // Add clientId
   });
   
   await UserModel.addUser({
     name: 'Jane Smith',
     email: 'jane@example.com',
     age: 30,
     clientId: 'client1' // Add clientId
   });
   
   await TaskModel.addTask({
     title: 'Complete Project',
     description: 'Finish the React Native app',
     userId: 1,
     completed: false,
     clientId: 'client1' // Add clientId
   });
   
   await TaskModel.addTask({
     title: 'Review Code', 
     description: 'Review pull requests',
     userId: 2,
     completed: true,
     clientId: 'client1' // Add clientId
   });
   
   console.log('Database initialized successfully');
 } catch (error) {
   console.error('Error initializing database:', error);
 }
};

export { UserModel, TaskModel, SyncLogModel, initializeDatabase };