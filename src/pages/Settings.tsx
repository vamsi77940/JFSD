import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Shield,
  RotateCcw,
  Download,
  Check,
} from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface SettingsProps {
  user: User;
  onUserUpdate: (u: User) => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  user,
  onUserUpdate,
  isDarkTheme,
  onToggleTheme,
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await api.updateUser({
      fullName: fullName.trim(),
      email: email.trim(),
      username: username.trim(),
    });
    onUserUpdate(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all transactions and budgets back to sample Indian records?')) {
      setIsResetting(true);
      await api.resetToSampleData();
      window.location.reload();
    }
  };

  const handleExportJSON = () => {
    const backup = {
      user,
      expenses: localStorage.getItem('rupeetrack_expenses'),
      income: localStorage.getItem('rupeetrack_income'),
      budgets: localStorage.getItem('rupeetrack_budgets'),
      categories: localStorage.getItem('rupeetrack_categories'),
      savingsGoals: localStorage.getItem('rupeetrack_savings_goals'),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rupeetrack_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-purple-400" />
          <span>Application Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account profile, regional Indian currency defaults, and database backups.
        </p>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-purple-400" />
          <span>User Profile Information</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Currency
              </label>
              <input
                type="text"
                value="Indian Rupee (INR ₹)"
                disabled
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Timezone: <span className="text-purple-400 font-mono">Asia/Kolkata (IST)</span>
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? 'Changes Saved!' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visual Theme and UI Options */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-white">Theme & UI Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-200 block">Theme Palette</span>
            <span className="text-xs text-slate-400">
              Currently {isDarkTheme ? 'Dark Navy with Purple Accents' : 'Light Mode'}
            </span>
          </div>
          <button
            onClick={onToggleTheme}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            Toggle {isDarkTheme ? 'Light Theme' : 'Dark Navy Theme'}
          </button>
        </div>
      </div>

      {/* Database Backup & Reset Operations */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Data Storage & Backups</span>
        </h3>
        <p className="text-xs text-slate-400">
          Export your complete database ledger for offline storage or restore initial Indian demo records.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Database (JSON)</span>
          </button>

          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 text-rose-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Sample Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
