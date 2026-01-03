
/* Added 'Bills' to the Category union to match usage in App.tsx */
export type Category = 'Food' | 'Transport' | 'Shopping' | 'Rent' | 'Education' | 'Entertainment' | 'Other' | 'Income' | 'Bills';

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
  type: 'expense' | 'income';
  isAutopay?: boolean;
}

export interface AutopayItem {
  id: string;
  name: string;
  amount: number;
  category: Category;
  nextDate: string;
  frequency: 'Monthly' | 'Yearly' | 'Weekly';
  status: 'active' | 'paused';
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface CircleMember {
  id: string;
  name: string;
  savingsRate: number;
  avatar: string;
}

export interface FinancialCircle {
  id: string;
  name: string;
  members: CircleMember[];
  challengeName: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  currency: string;
  preferences: {
    notifications: boolean;
    privateMode: boolean;
    theme: 'dark' | 'light' | 'amoled';
  };
}
