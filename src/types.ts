import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  createdAt: Timestamp;
}

export interface Transaction {
  id?: string; // Optional for new transactions
  userId: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  description?: string;
  budgetId?: string;
  createdAt: Timestamp;
}

export interface Budget {
  id?: string; // Optional for new budgets
  userId: string;
  name: string;
  budgeted: number;
  createdAt: Timestamp;
}