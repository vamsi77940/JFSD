import React, { useState, useEffect } from 'react';
import { PlusCircle, ReceiptText, Smartphone, Banknote, CreditCard } from 'lucide-react';
import { Expense, Category } from '../types';
import { api } from '../services/api';
import { ExpenseTable } from '../components/ExpenseTable';
import { ExpenseForm } from '../components/ExpenseForm';
import { formatINR } from '../utils/formatters';

interface ExpensesProps {
  onOpenGlobalAddModal: () => void;
}

export const Expenses: React.FC<ExpensesProps> = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expList, catList] = await Promise.all([
        api.getExpenses(),
        api.getCategories(),
      ]);
      setExpenses(expList);
      setCategories(catList);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (data: Omit<Expense, 'id' | 'createdAt' | 'userId'>) => {
    if (editingExpense) {
      await api.updateExpense(editingExpense.id, data);
    } else {
      await api.addExpense(data);
    }
    await loadData();
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = async (id: number) => {
    await api.deleteExpense(id);
    await loadData();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  // Compute breakdown stats
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const upiTotal = expenses.filter(e => e.paymentMethod === 'UPI').reduce((s, e) => s + e.amount, 0);
  const cashTotal = expenses.filter(e => e.paymentMethod === 'CASH').reduce((s, e) => s + e.amount, 0);
  const cardTotal = expenses.filter(e => e.paymentMethod === 'DEBIT_CARD' || e.paymentMethod === 'CREDIT_CARD').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-purple-400" />
            <span>Expense Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track and filter all your daily Indian expenses across UPI, cash, and card channels.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingExpense(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm shadow-purple-600/30 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Expense</span>
        </button>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide block">Total Outflow</span>
          <span className="text-lg font-bold text-white font-mono tabular-nums">{formatINR(totalAmount)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wide block">UPI Spending</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">{formatINR(upiTotal)}</span>
          </div>
          <Smartphone className="w-5 h-5 text-emerald-400/60" />
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wide block">Cash Spending</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">{formatINR(cashTotal)}</span>
          </div>
          <Banknote className="w-5 h-5 text-amber-400/60" />
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wide block">Cards Spending</span>
            <span className="text-lg font-bold text-white font-mono tabular-nums">{formatINR(cardTotal)}</span>
          </div>
          <CreditCard className="w-5 h-5 text-blue-400/60" />
        </div>
      </div>

      {/* Expense Table */}
      {loading ? (
        <div className="h-64 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse" />
      ) : (
        <ExpenseTable
          expenses={expenses}
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenAddModal={() => {
            setEditingExpense(null);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Modal Form */}
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingExpense}
        categories={categories}
      />
    </div>
  );
};
