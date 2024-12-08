import SQLite from 'react-native-sqlite-storage';

export const db = SQLite.openDatabase(
  { name: 'myapp.db', location: 'default' },
  () => console.log('Database opened successfully'),
  error => console.error('Error opening database:', error)
 );