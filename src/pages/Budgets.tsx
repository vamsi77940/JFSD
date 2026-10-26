import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  Sliders,
  Target,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Budget, SavingsGoal, Category } from '../types';
import { api } from '../services/api';
import { BudgetModal } from '../components/BudgetModal';
import { SavingsGoalModal } from '../components/SavingsGoalModal';
import { formatINR, formatIndianDate, getKolkataCurrentMonth } from '../utils/formatters';

export const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(getKolkataCurrentMonth());

  const loadData = async () => {
    try {
      setLoading(true);
      const [bList, gList, cList] = await Promise.all([
        api.getBudgets(currentMonth),
        api.getSavingsGoals(),
        api.getCategories(),
      ]);
      setBudgets(bList);
      setSavingsGoals(gList);
      setCategories(cList);
    } catch (err) {
      console.error('Failed to load budgets and savings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const handleSetBudget = async (data: { month: string; categoryId: number | null; amount: number }) => {
    await api.setBudget(data);
    await loadData();
    setIsBudgetModalOpen(false);
  };

  const handleDeleteBudget = async (id: number) => {
    await api.deleteBudget(id);
    await loadData();
  };

  const handleAddSavingsGoal = async (data: {
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }) => {
    await api.addSavingsGoal(data);
    await loadData();
    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = async (id: number) => {
    await api.deleteSavingsGoal(id);
    await loadData();
  };

  return (
    <div className="space-y-8">
      {/* Top Header with month switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-purple-400" />
            <span>Budgets & Savings Goals</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enforce spending discipline with category-wise limits, 80% & 100% threshold alerts, and savings milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <input
              type="month"
              value={currentMonth}
              onChange={e => setCurrentMonth(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Monthly Budgets & Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Monthly Budget Limits ({currentMonth})</span>
          </h3>
          <span className="text-xs text-slate-400">
            {budgets.length} active limits
          </span>
        </div>

        {budgets.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">No budget set for {currentMonth}.</p>
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs hover:bg-purple-600 hover:text-white transition-colors"
            >
              Set Monthly Limit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map(b => {
              const spent = b.spent || 0;
              const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
              const remaining = b.amount - spent;
              const isOver = percent >= 100;
              const isWarning = percent >= 80 && percent < 100;

              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isOver
                      ? 'bg-rose-950/20 border-rose-800/60'
                      : isWarning
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : 'bg-slate-900/80 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        {b.categoryName || 'Overall Budget'}
                      </span>
                      <span className="text-xs text-slate-400">
                        Budget Limit: {formatINR(b.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOver && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Exceeded
                        </span>
                      )}
                      {isWarning && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          80% Alert
                        </span>
                      )}
                      {!isOver && !isWarning && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          On Track
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteBudget(b.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors ml-1"
                        title="Delete budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono tabular-nums">
                      <span className="text-slate-400">Spent: {formatINR(spent)}</span>
                      <span
                        className={`font-semibold ${
                          isOver ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-purple-400'
                        }`}
                      >
                        {Math.round(percent)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400 flex justify-between">
                    <span>
                      {remaining >= 0 ? 'Remaining' : 'Overspent by'}:
                    </span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        remaining >= 0 ? 'text-slate-200' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(Math.abs(remaining))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Savings Goals */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>India Savings Goals</span>
            </h3>
            <p className="text-xs text-slate-400">Track target funds for festivals, tech upgrades, or emergencies</p>
          </div>

          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Savings Goal</span>
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">No savings goals created yet.</p>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-600 hover:text-white transition-colors"
            >
              Add First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map(goal => {
              const progress =
                goal.targetAmount > 0
                  ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
                  : 0;

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{goal.title}</h4>
                      <span className="text-xs text-slate-400">
                        Deadline: {formatIndianDate(goal.targetDate)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono tabular-nums">
                      <span className="text-slate-400">
                        Saved: {formatINR(goal.currentAmount)} of {formatINR(goal.targetAmount)}
                      </span>
                      <span className="font-semibold text-emerald-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Pending Target:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-200">
                      {formatINR(Math.max(0, goal.targetAmount - goal.currentAmount))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleSetBudget}
        categories={categories}
      />

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleAddSavingsGoal}
      />
    </div>
  );
};
