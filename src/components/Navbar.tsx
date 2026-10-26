import React, { useState, useEffect } from 'react';
import { PlusCircle, Database, Moon, Sun, Clock } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onOpenExpenseModal: () => void;
  onNavigateToArchitecture: () => void;
  activeTab: string;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenExpenseModal,
  onNavigateToArchitecture,
  isDarkTheme,
  onToggleTheme,
}) => {
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setIstTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shadow-purple-900/30">
          ₹
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            RupeeTrack
          </span>
          <span className="text-[10px] text-purple-400 font-medium tracking-wider uppercase">
            Spring Boot & React
          </span>
        </div>
      </div>

      {/* Middle Zone: Indian Time Context & Spring Boot Architecture Button */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">Asia/Kolkata (IST):</span>
          <span className="font-mono tabular-nums text-purple-300 font-medium">{istTime}</span>
        </div>

        <button
          onClick={onNavigateToArchitecture}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-950/40 border border-purple-800/50 text-xs text-purple-300 hover:bg-purple-900/40 hover:text-white transition-colors"
          title="Inspect Java Spring Boot & MySQL Architecture"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backend & MySQL Hub</span>
        </button>
      </div>

      {/* Right Action Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme mode"
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle Light / Dark Preview"
        >
          {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenExpenseModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm shadow-purple-600/30 whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-purple-300">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
              {user.fullName}
            </span>
            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
              {user.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
