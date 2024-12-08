// services/BackgroundSync.ts
import SQLite from 'react-native-sqlite-storage';
import { checkInternetConnection } from '../utils/networkCheck';
import { CONFIG } from '../config/constants';
import { TaskModel, UserModel } from '../database';
import { SyncLogModel } from '../database/models/SyncLogModel';
import BackgroundTimer from 'react-native-background-timer';

// Initialize database
const db = SQLite.openDatabase(
  { name: 'myapp.db', location: 'default' },
  () => console.log('Database opened successfully'),
  error => console.error('Error opening database:', error)
);

const syncData = async () => {
  try {
    // Check internet connection
    // const isConnected = await checkInternetConnection();
    // if (!isConnected) {
    //   console.log('No internet connection. Skipping sync.');
    //   return;
    // }

    // Get data
    const users = await UserModel.getUsers();
    const tasks = await TaskModel.getTasks();
    
    // Get current timestamp
    const currentTimestamp = new Date().toISOString();

    // Prepare data with clientId
    const syncData = {
      clientId: CONFIG.CLIENT_ID,
      timestamp: currentTimestamp,
      data: { users, tasks }
    };

    // Send to server
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Log successful sync
    await SyncLogModel.create({
      clientId: CONFIG.CLIENT_ID,
      timestamp: currentTimestamp,
      status: 'success',
      lastSyncData: JSON.stringify({ users, tasks }) // Store the last synced data as string
    });

  } catch (error) {
    console.error('Sync error:', error);
    // Log failed sync
    await SyncLogModel.create({
      clientId: CONFIG.CLIENT_ID,
      timestamp: new Date().toISOString(),
      status: 'failure',
      errorMessage: error.message!,
      lastSyncData: '' // Empty string for failed syncs
    });
  }
};

export const startBackgroundSync = () => {
  BackgroundTimer.runBackgroundTimer(() => {
    syncData();
  }, 1000);
};

export const stopBackgroundSync = () => {
  BackgroundTimer.stopBackgroundTimer();
};

export default syncData;