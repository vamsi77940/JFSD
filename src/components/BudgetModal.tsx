import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../types';
import { getKolkataCurrentMonth } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { month: string; categoryId: number | null; amount: number }) => Promise<void>;
  categories: Category[];
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
}) => {
  const [month, setMonth] = useState(getKolkataCurrentMonth());
  const [budgetType, setBudgetType] = useState<'OVERALL' | 'CATEGORY'>('OVERALL');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        month,
        categoryId: budgetType === 'CATEGORY' ? categoryId : null,
        amount: parsedAmount,
      });
      onClose();
    } catch {
      setError('Failed to set budget limit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-semibold text-white">Set Monthly Budget Limit</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/50 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Budget Target Month *
            </label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Budget Scope *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setBudgetType('OVERALL')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  budgetType === 'OVERALL'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overall Monthly
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('CATEGORY')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                  budgetType === 'CATEGORY'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Category Specific
              </button>
            </div>
          </div>

          {budgetType === 'CATEGORY' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Expense Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Budget Limit (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-purple-400">
                ₹
              </span>
              <input
                type="number"
                step="100"
                min="100"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="25000"
                className="w-full pl-8 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white font-mono tabular-nums placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              You will receive automatic alerts when spending hits 80% and 100%.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Set Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
