import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertTriangle,
  Smartphone,
  Banknote,
  CreditCard,
  Landmark,
  Receipt,
} from 'lucide-react';
import { Expense, Category, PaymentMethod } from '../types';
import { formatINR, formatIndianDate, PAYMENT_METHOD_CONFIG } from '../utils/formatters';

interface ExpenseTableProps {
  expenses: Expense[];
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => Promise<void>;
  onOpenAddModal: () => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  categories,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'>('NEWEST');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & sort
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesSearch =
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === 'ALL' || e.categoryId === Number(categoryFilter);
        const matchesPayment = paymentFilter === 'ALL' || e.paymentMethod === paymentFilter;
        return matchesSearch && matchesCategory && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'OLDEST') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'HIGHEST') return b.amount - a.amount;
        if (sortBy === 'LOWEST') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchQuery, categoryFilter, paymentFilter, sortBy]);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await onDelete(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'CASH':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'DEBIT_CARD':
      case 'CREDIT_CARD':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'BANK_TRANSFER':
        return <Landmark className="w-3.5 h-3.5" />;
      default:
        return <Receipt className="w-3.5 h-3.5" />;
    }
  };

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 bg-slate-900/70 border border-slate-800/80 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search expenses by title or note..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="NEWEST" className="bg-slate-900">Newest First</option>
              <option value="OLDEST" className="bg-slate-900">Oldest First</option>
              <option value="HIGHEST" className="bg-slate-900">Highest Amount</option>
              <option value="LOWEST" className="bg-slate-900">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-900/60 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-medium">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Expense Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Payment Mode</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-200">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <p className="text-sm">No expense records found matching your filters.</p>
                  <button
                    onClick={onOpenAddModal}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs hover:bg-purple-600 hover:text-white transition-colors"
                  >
                    Log New Expense
                  </button>
                </td>
              </tr>
            ) : (
              filteredExpenses.map(expense => {
                const category = catMap.get(expense.categoryId);
                const paymentCfg = PAYMENT_METHOD_CONFIG[expense.paymentMethod];

                return (
                  <tr key={expense.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                      {formatIndianDate(expense.date)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{expense.title}</div>
                      {expense.notes && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {expense.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-300 font-medium">
                        {category ? category.name : expense.categoryName || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        {getMethodIcon(expense.paymentMethod)}
                        <span className="text-[11px]">{paymentCfg?.label.split(' ')[0] || expense.paymentMethod}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-rose-400 whitespace-nowrap">
                      -{formatINR(expense.amount)}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(expense)}
                          className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-purple-950/40 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(expense.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count & total summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <span>Showing {filteredExpenses.length} of {expenses.length} expenses</span>
        <span className="font-mono tabular-nums font-medium text-slate-300">
          Filtered Total: {formatINR(filteredExpenses.reduce((s, e) => s + e.amount, 0))}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Delete Expense Record?</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this expense record? This will permanently remove it from your financial records and re-calculate your available balance.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
