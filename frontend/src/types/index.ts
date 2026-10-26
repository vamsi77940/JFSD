export type PaymentMethod = 'UPI' | 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'OTHER';

export type IncomeSource = 'SALARY' | 'POCKET_MONEY' | 'FREELANCE' | 'BUSINESS' | 'GIFTS' | 'OTHER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  currency: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
  isCustom: boolean;
  userId?: number;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  categoryId: number;
  categoryName?: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  notes?: string;
  userId: number;
  createdAt: string;
}

export interface Income {
  id: number;
  title: string;
  amount: number;
  source: IncomeSource;
  sourceLabel?: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  userId: number;
  createdAt: string;
}

export interface Budget {
  id: number;
  month: string; // YYYY-MM
  categoryId?: number | null; // null for overall monthly budget
  categoryName?: string;
  amount: number;
  spent?: number;
  userId: number;
  createdAt: string;
}

export interface SavingsGoal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  userId: number;
  createdAt: string;
}

export interface DashboardSummary {
  availableBalance: number;
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  remainingMonthlyBudget: number;
  dailyAverageSpending: number;
  monthlyBudgetTotal: number;
  budgetUsagePercent: number;
  recentExpenses: Expense[];
  recentIncome: Income[];
  categoryBreakdown: {
    categoryName: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
  spendingTrends: {
    date: string;
    displayDate: string;
    amount: number;
  }[];
}
