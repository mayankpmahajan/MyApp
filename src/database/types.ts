export interface User {
  id?: number;
  name: string;
  email: string;
  age: number;
  clientId: string;
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  userId: number;
  completed: boolean;
  clientId: string;
}

export interface SyncLog {
  id?: number;
  clientId: string;
  timestamp: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  dataHash: string;
}