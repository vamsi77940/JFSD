import React, { useState, useEffect } from 'react';
import {
  Tags,
  PlusCircle,
  Trash2,
  Utensils,
  Coffee,
  Bus,
  ShoppingBag,
  Home,
  Zap,
  GraduationCap,
  HeartPulse,
  Film,
  Smartphone,
  Tv,
  Users,
  Plane,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import { Category, Expense } from '../types';
import { api } from '../services/api';
import { formatINR } from '../utils/formatters';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8b5cf6');

  const loadData = async () => {
    try {
      setLoading(true);
      const [catList, expList] = await Promise.all([
        api.getCategories(),
        api.getExpenses(),
      ]);
      setCategories(catList);
      setExpenses(expList);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await api.addCategory({
      name: newCatName.trim(),
      type: 'EXPENSE',
      icon: 'Tags',
      color: newCatColor,
      isCustom: true,
    });

    setNewCatName('');
    setIsAdding(false);
    await loadData();
  };

  const handleDeleteCategory = async (id: number) => {
    await api.deleteCategory(id);
    await loadData();
  };

  // Calculate expenditure per category
  const expenseMap = new Map<number, number>();
  expenses.forEach(e => {
    expenseMap.set(e.categoryId, (expenseMap.get(e.categoryId) || 0) + e.amount);
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'Bus':
        return <Bus className="w-4 h-4" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4" />;
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4" />;
      case 'Film':
        return <Film className="w-4 h-4" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'Tv':
        return <Tv className="w-4 h-4" />;
      case 'Users':
        return <Users className="w-4 h-4" />;
      case 'Plane':
        return <Plane className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const presetColors = ['#f97316', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#ef4444', '#a855f7'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-purple-400" />
            <span>Indian Expense Categories</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-configured with Indian daily contexts (Canteen & Mess, PG Rent, Metro, Jio Recharge) plus custom categories.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Custom Category</span>
        </button>
      </div>

      {/* Add Custom Category Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddCategory}
          className="p-5 rounded-xl bg-slate-900 border border-purple-800/40 shadow-xl space-y-4 animate-in fade-in"
        >
          <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Create Custom Category
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="e.g. Gym & Fitness, Chai Samosa Club, Pet Care"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Badge Color
              </label>
              <div className="flex items-center gap-2 py-1">
                {presetColors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                    style={{
                      backgroundColor: c,
                      borderColor: newCatColor === c ? '#ffffff' : 'transparent',
                    }}
                  >
                    {newCatColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => {
          const totalSpent = expenseMap.get(cat.id) || 0;
          return (
            <div
              key={cat.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                  >
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{cat.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      {cat.isCustom ? 'Custom Category' : 'Default Indian'}
                    </span>
                  </div>
                </div>

                {cat.isCustom && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete custom category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Spent:</span>
                <span className="font-mono tabular-nums font-semibold text-purple-300">
                  {formatINR(totalSpent)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
