/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Expense, Income, Category } from './types';
import { ApiError, api, getToken } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ExpenseForm } from './components/ExpenseForm';
import { IncomeForm } from './components/IncomeForm';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Income as IncomePage } from './pages/Income';
import { Budgets } from './pages/Budgets';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { SpringBootHub } from './pages/SpringBootHub';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const TAB_PATHS = new Set([
  'dashboard',
  'expenses',
  'income',
  'budgets',
  'categories',
  'reports',
  'settings',
  'springboot',
]);

function getTabFromPath(pathname: string): string {
  const path = pathname.replace(/^\/+|\/+$/g, '');
  return TAB_PATHS.has(path) ? path : 'dashboard';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPath(window.location.pathname));
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // Initialize and load user
  useEffect(() => {
    if (getToken()) {
      api.getCurrentUser()
        .then(u => {
          setCurrentUser(u);
          return api.getCategories()
            .then(setCategories)
            .catch(error => console.error('Failed to load categories', error));
        })
        .catch(error => {
          if (error instanceof ApiError && error.status === 401) {
            api.logout();
            setCurrentUser(null);
            return;
          }
          console.error('Failed to restore authenticated session', error);
        });
    }

    const savedTheme = localStorage.getItem('rupeetrack_theme');
    if (savedTheme === 'light') {
      setIsDarkTheme(false);
    }

    const syncTabWithLocation = () => setActiveTab(getTabFromPath(window.location.pathname));
    window.addEventListener('popstate', syncTabWithLocation);
    return () => window.removeEventListener('popstate', syncTabWithLocation);
  }, []);

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    const path = tab === 'dashboard' ? '/' : `/${tab}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const handleAuthenticationSuccess = (user: User) => {
    setCategories([]);
    setCurrentUser(user);
    void api.getCategories()
      .then(setCategories)
      .catch(error => console.error('Failed to load categories', error));
  };

  const handleToggleTheme = () => {
    const nextTheme = !isDarkTheme;
    setIsDarkTheme(nextTheme);
    localStorage.setItem('rupeetrack_theme', nextTheme ? 'dark' : 'light');
  };

  const handleGlobalAddExpense = async (data: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => {
    await api.addExpense(data);
    setIsExpenseModalOpen(false);
    setRefreshKey(key => key + 1);
  };

  const handleGlobalAddIncome = async (data: Omit<Income, 'id' | 'createdAt' | 'userId'>) => {
    await api.addIncome(data);
    setIsIncomeModalOpen(false);
    setRefreshKey(key => key + 1);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCategories([]);
    setAuthView('LOGIN');
  };

  // If user is not authenticated, render Login/Register
  if (!currentUser) {
    if (authView === 'REGISTER') {
      return (
        <Register
          onRegisterSuccess={handleAuthenticationSuccess}
          onNavigateToLogin={() => setAuthView('LOGIN')}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleAuthenticationSuccess}
        onNavigateToRegister={() => setAuthView('REGISTER')}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkTheme
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 text-slate-900'
      } flex flex-col font-sans transition-colors duration-200`}
    >
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onNavigateToArchitecture={() => navigateToTab('springboot')}
        activeTab={activeTab}
        isDarkTheme={isDarkTheme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={navigateToTab}
          onLogout={handleLogout}
        />

        <main key={refreshKey} className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
              onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
              onNavigateTab={navigateToTab}
            />
          )}

          {activeTab === 'expenses' && (
            <Expenses
              onOpenGlobalAddModal={() => setIsExpenseModalOpen(true)}
            />
          )}

          {activeTab === 'income' && (
            <IncomePage
              onOpenGlobalAddModal={() => setIsIncomeModalOpen(true)}
            />
          )}

          {activeTab === 'budgets' && <Budgets />}

          {activeTab === 'categories' && <Categories />}

          {activeTab === 'reports' && <Reports />}

          {activeTab === 'springboot' && <SpringBootHub />}

          {activeTab === 'settings' && (
            <Settings
              user={currentUser}
              onUserUpdate={setCurrentUser}
              isDarkTheme={isDarkTheme}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>
      </div>

      {/* Global Add Expense Modal */}
      <ExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleGlobalAddExpense}
        categories={categories}
      />

      {/* Global Add Income Modal */}
      <IncomeForm
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSubmit={handleGlobalAddIncome}
      />
    </div>
  );
}
