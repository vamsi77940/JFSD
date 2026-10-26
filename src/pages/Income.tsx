import React, { useState, useEffect } from 'react';
import { PlusCircle, Wallet, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import type { Income as IncomeItem } from '../types';
import { api } from '../services/api';
import { IncomeForm } from '../components/IncomeForm';
import { formatINR, formatIndianDate, INCOME_SOURCE_CONFIG } from '../utils/formatters';

interface IncomePageProps {
  onOpenGlobalAddModal: () => void;
}

export const Income: React.FC<IncomePageProps> = () => {
  const [incomeList, setIncomeList] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getIncome();
      setIncomeList(data);
    } catch (err) {
      console.error('Failed to load income data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (data: Omit<IncomeItem, 'id' | 'createdAt' | 'userId'>) => {
    if (editingIncome) {
      await api.updateIncome(editingIncome.id, data);
    } else {
      await api.addIncome(data);
    }
    await loadData();
    setIsFormOpen(false);
    setEditingIncome(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await api.deleteIncome(deleteTargetId);
      setDeleteTargetId(null);
      await loadData();
    } finally {
      setIsDeleting(false);
    }
  };

  const totalIncome = incomeList.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Income Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record earnings, salary credits, freelance gigs, allowances, and festive gifts.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingIncome(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Income</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Total Income Logged</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400 block mt-1">
            {formatINR(totalIncome)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">{incomeList.length} transactions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Primary Source</span>
          <span className="text-2xl font-bold text-white block mt-1">
            {incomeList.length > 0
              ? INCOME_SOURCE_CONFIG[incomeList[0].source]?.label || 'Salary'
              : 'None'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Highest frequency</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Average Per Credit</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-white block mt-1">
            {incomeList.length > 0 ? formatINR(totalIncome / incomeList.length) : '₹0.00'}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Per incoming transfer</span>
        </div>
      </div>

      {/* Income Table */}
      <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-900/60 shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-medium">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Income Description</th>
              <th className="py-3 px-4">Source Category</th>
              <th className="py-3 px-4 text-right">Amount (₹)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-200">
            {incomeList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <p className="text-sm">No income transactions found.</p>
                  <button
                    onClick={() => {
                      setEditingIncome(null);
                      setIsFormOpen(true);
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    Log First Income
                  </button>
                </td>
              </tr>
            ) : (
              incomeList.map(item => {
                const sourceConfig = INCOME_SOURCE_CONFIG[item.source];
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                      {formatIndianDate(item.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{item.title}</div>
                      {item.notes && <div className="text-[11px] text-slate-500">{item.notes}</div>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-300 font-medium">
                        {sourceConfig?.label || item.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-400 whitespace-nowrap">
                      +{formatINR(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingIncome(item);
                            setIsFormOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
                          title="Edit Income"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Income"
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

      {/* Delete Modal */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-800/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Delete Income Record?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this income entry? Your available balance will automatically reflect this removal.
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
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal Form */}
      <IncomeForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingIncome(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingIncome}
      />
    </div>
  );
};
