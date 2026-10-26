/**
 * RupeeTrack API Service
 * All data goes through the Spring Boot backend REST API.
 * JWT token is persisted in localStorage under 'rupeetrack_auth_token'.
 */

import {
  User,
  Category,
  Expense,
  Income,
  Budget,
  SavingsGoal,
  DashboardSummary,
} from '../types';

// ─── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'rupeetrack_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Base HTTP helper ──────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 204) return undefined as unknown as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      body?.message ||
      body?.error ||
      `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return body as T;
}

function get<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}
function post<T>(path: string, data?: unknown) {
  return request<T>(path, { method: 'POST', body: JSON.stringify(data) });
}
function put<T>(path: string, data?: unknown) {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(data) });
}
function del<T>(path: string) {
  return request<T>(path, { method: 'DELETE' });
}

// ─── Auth response shape from backend ─────────────────────────────────────────

interface AuthResponse {
  token: string;
  user: User;
}

// ─── Backend shape adapters ────────────────────────────────────────────────────

/** Backend sends both `expenseDate` and `date`; normalise to `date`. */
function normaliseExpense(e: Expense & { expenseDate?: string }): Expense {
  return { ...e, date: (e.date ?? e.expenseDate) as string };
}

/** Backend sends both `incomeDate` and `date`; normalise to `date`. */
function normaliseIncome(
  i: Income & { incomeDate?: string; sourceLabel?: string }
): Income {
  return { ...i, date: (i.date ?? i.incomeDate) as string };
}

/** Backend `DashboardSummaryResponse` — normalise nested expense/income arrays. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseDashboard(raw: any): DashboardSummary {
  return {
    availableBalance: Number(raw.availableBalance ?? 0),
    totalMonthlyIncome: Number(raw.totalMonthlyIncome ?? 0),
    totalMonthlyExpenses: Number(raw.totalMonthlyExpenses ?? 0),
    remainingMonthlyBudget: Number(raw.remainingMonthlyBudget ?? 0),
    dailyAverageSpending: Number(raw.dailyAverageSpending ?? 0),
    monthlyBudgetTotal: Number(
      raw.monthlyBudgetTotal ?? raw.monthlyBudgetLimit ?? 0
    ),
    budgetUsagePercent: Number(raw.budgetUsagePercent ?? 0),
    recentExpenses: (raw.recentExpenses ?? []).map(normaliseExpense),
    recentIncome: (raw.recentIncome ?? []).map(normaliseIncome),
    categoryBreakdown: (raw.categoryBreakdown ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => ({
        categoryName: c.categoryName,
        color: c.color,
        amount: Number(c.amount),
        percentage: Number(c.percentage),
      })
    ),
    spendingTrends: (raw.spendingTrends ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) => ({
        date: t.date,
        displayDate: t.displayDate,
        amount: Number(t.amount),
      })
    ),
  };
}

// ─── Budget normaliser ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseBudget(b: any): Budget {
  return {
    id: b.id,
    month: b.month ?? b.budgetMonth,
    categoryId: b.categoryId ?? null,
    categoryName: b.categoryName,
    amount: Number(b.amount),
    spent: Number(b.spent ?? 0),
    userId: b.userId,
    createdAt: b.createdAt,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<User> {
    const res = await post<AuthResponse>('/auth/login', { email, password });
    saveToken(res.token);
    return res.user;
  },

  async register(
    fullName: string,
    username: string,
    email: string,
    password: string
  ): Promise<User> {
    const res = await post<AuthResponse>('/auth/register', {
      fullName,
      username,
      email,
      password,
    });
    saveToken(res.token);
    return res.user;
  },

  async getCurrentUser(): Promise<User> {
    return get<User>('/auth/me');
  },

  async updateUser(data: Partial<User>): Promise<User> {
    return put<User>('/auth/me', data);
  },

  logout(): void {
    clearToken();
  },

  // ── Categories ───────────────────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    return get<Category[]>('/categories');
  },

  async addCategory(cat: Omit<Category, 'id' | 'userId' | 'createdAt'>): Promise<Category> {
    return post<Category>('/categories', cat);
  },

  async deleteCategory(id: number): Promise<void> {
    return del<void>(`/categories/${id}`);
  },

  // ── Expenses ─────────────────────────────────────────────────────────────────

  async getExpenses(): Promise<Expense[]> {
    const list = await get<Expense[]>('/expenses');
    return list.map(normaliseExpense);
  },

  async addExpense(
    expense: Omit<Expense, 'id' | 'createdAt' | 'userId' | 'categoryName'>
  ): Promise<Expense> {
    const payload = {
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod,
      expenseDate: expense.date, // backend field name
      notes: expense.notes,
    };
    const res = await post<Expense>('/expenses', payload);
    return normaliseExpense(res);
  },

  async updateExpense(
    id: number,
    expense: Partial<Expense>
  ): Promise<Expense> {
    const payload = {
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod,
      expenseDate: expense.date,
      notes: expense.notes,
    };
    const res = await put<Expense>(`/expenses/${id}`, payload);
    return normaliseExpense(res);
  },

  async deleteExpense(id: number): Promise<void> {
    return del<void>(`/expenses/${id}`);
  },

  // ── Income ───────────────────────────────────────────────────────────────────

  async getIncome(): Promise<Income[]> {
    const list = await get<Income[]>('/income');
    return list.map(normaliseIncome);
  },

  async addIncome(
    income: Omit<Income, 'id' | 'createdAt' | 'userId' | 'sourceLabel'>
  ): Promise<Income> {
    const payload = {
      title: income.title,
      amount: income.amount,
      source: income.source,
      incomeDate: income.date, // backend field name
      notes: income.notes,
    };
    const res = await post<Income>('/income', payload);
    return normaliseIncome(res);
  },

  async updateIncome(id: number, income: Partial<Income>): Promise<Income> {
    const payload = {
      title: income.title,
      amount: income.amount,
      source: income.source,
      incomeDate: income.date,
      notes: income.notes,
    };
    const res = await put<Income>(`/income/${id}`, payload);
    return normaliseIncome(res);
  },

  async deleteIncome(id: number): Promise<void> {
    return del<void>(`/income/${id}`);
  },

  // ── Budgets ──────────────────────────────────────────────────────────────────

  async getBudgets(month?: string): Promise<Budget[]> {
    const query = month ? `?month=${month}` : '';
    const list = await get<Budget[]>(`/budgets${query}`);
    return list.map(normaliseBudget);
  },

  async setBudget(
    budget: Omit<Budget, 'id' | 'createdAt' | 'userId' | 'spent' | 'categoryName'>
  ): Promise<Budget> {
    const payload = {
      month: budget.month,
      categoryId: budget.categoryId ?? null,
      amount: budget.amount,
    };
    const res = await post<Budget>('/budgets', payload);
    return normaliseBudget(res);
  },

  async deleteBudget(id: number): Promise<void> {
    return del<void>(`/budgets/${id}`);
  },

  // ── Savings Goals (localStorage fallback — backend not yet implemented) ───────

  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const raw = localStorage.getItem('rupeetrack_savings_goals');
    return raw ? (JSON.parse(raw) as SavingsGoal[]) : [];
  },

  async addSavingsGoal(
    goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'userId'>
  ): Promise<SavingsGoal> {
    const goals = await this.getSavingsGoals();
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now(),
      userId: 0,
      createdAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    localStorage.setItem('rupeetrack_savings_goals', JSON.stringify(goals));
    return newGoal;
  },

  async updateSavingsGoal(
    id: number,
    data: Partial<SavingsGoal>
  ): Promise<SavingsGoal> {
    const goals = await this.getSavingsGoals();
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Savings goal not found');
    goals[idx] = { ...goals[idx], ...data };
    localStorage.setItem('rupeetrack_savings_goals', JSON.stringify(goals));
    return goals[idx];
  },

  async deleteSavingsGoal(id: number): Promise<void> {
    const goals = await this.getSavingsGoals();
    const updated = goals.filter(g => g.id !== id);
    localStorage.setItem('rupeetrack_savings_goals', JSON.stringify(updated));
  },

  // ── Dashboard ────────────────────────────────────────────────────────────────

  async getDashboardSummary(): Promise<DashboardSummary> {
    const raw = await get<unknown>('/dashboard/summary');
    return normaliseDashboard(raw);
  },
};

/** @deprecated  initDatabase() was used for localStorage mock. No longer needed. */
export function initDatabase(): void {
  // No-op: real data now served from Spring Boot + MySQL.
}

/** Default categories constant kept for any component that still references it. */
export const DEFAULT_CATEGORIES: Category[] = [];
