
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface SavingsGoal {
  target: number;
  name: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ImageSize = '1K' | '2K' | '4K';
