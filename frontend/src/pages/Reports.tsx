import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Expense, Income, Category } from '../types';
import { api } from '../services/api';
import { formatINR, formatIndianDate, exportToCSV, getKolkataCurrentMonth } from '../utils/formatters';

export const Reports: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getKolkataCurrentMonth());
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expList, incList, catList] = await Promise.all([
        api.getExpenses(),
        api.getIncome(),
        api.getCategories(),
      ]);
      setExpenses(expList);
      setIncome(incList);
      setCategories(catList);
    } catch (err) {
      console.error('Failed to load reports data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter current month
  const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  const monthIncome = income.filter(i => i.date.startsWith(selectedMonth));

  const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = monthIncome.reduce((s, i) => s + i.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  // Category map
  const catMap = new Map(categories.map(c => [c.id, c]));

  // Category breakdown
  const catSpendingMap = new Map<number, number>();
  monthExpenses.forEach(e => {
    catSpendingMap.set(e.categoryId, (catSpendingMap.get(e.categoryId) || 0) + e.amount);
  });

  const categoryChartData = Array.from(catSpendingMap.entries())
    .map(([catId, amount]) => {
      const cat = catMap.get(catId);
      return {
        name: cat ? cat.name : 'Unknown',
        amount,
        color: cat ? cat.color : '#8b5cf6',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Month-to-month comparison data (last 4 months)
  const comparisonData: { month: string; income: number; expenses: number; savings: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).substring(0, 7);
    const mExp = expenses.filter(e => e.date.startsWith(mStr)).reduce((s, e) => s + e.amount, 0);
    const mInc = income.filter(incom => incom.date.startsWith(mStr)).reduce((s, incom) => s + incom.amount, 0);
    comparisonData.push({
      month: mStr,
      income: mInc,
      expenses: mExp,
      savings: mInc - mExp,
    });
  }

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Type', 'Date (DD/MM/YYYY)', 'Title', 'Category / Source', 'Payment Method', 'Amount (INR)', 'Notes'];
    const rows: (string | number)[][] = [];

    monthExpenses.forEach(e => {
      rows.push([
        'EXPENSE',
        formatIndianDate(e.date),
        e.title,
        e.categoryName || 'General',
        e.paymentMethod,
        e.amount,
        e.notes || '',
      ]);
    });

    monthIncome.forEach(i => {
      rows.push([
        'INCOME',
        formatIndianDate(i.date),
        i.title,
        i.source,
        'DIRECT_CREDIT',
        i.amount,
        i.notes || '',
      ]);
    });

    exportToCSV(`rupeetrack_report_${selectedMonth}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span>Financial Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Examine cashflow trends, month-to-month savings velocity, and export verified ledger statements to CSV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* High-level metrics strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Monthly Income</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1 block">
            {formatINR(totalIncome)}
          </span>
          <span className="text-[11px] text-slate-500">{monthIncome.length} incoming credits</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Monthly Expenses</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1 block">
            {formatINR(totalExpense)}
          </span>
          <span className="text-[11px] text-slate-500">{monthExpenses.length} transactions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Net Month Savings</span>
          <span
            className={`text-2xl font-bold font-mono tabular-nums mt-1 block ${
              netSavings >= 0 ? 'text-purple-400' : 'text-rose-400'
            }`}
          >
            {formatINR(netSavings)}
          </span>
          <span className="text-[11px] text-slate-500">
            {netSavings >= 0 ? 'Positive financial surplus' : 'Deficit in current month'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-wide block">Savings Velocity</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-white mt-1 block">
            {Math.round(savingsRate)}%
          </span>
          <span className="text-[11px] text-slate-500">Percent of income preserved</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Comparison Chart */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Month-to-Month Cashflow (INR)</h4>
            <p className="text-xs text-slate-400">Comparing total income against total expenses</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Category Allocation for {selectedMonth}</h4>
              <p className="text-xs text-slate-400">Distribution across Indian expense segments</p>
            </div>
            <PieIcon className="w-4 h-4 text-purple-400" />
          </div>

          {categoryChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No expenses recorded in {selectedMonth}
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), 'Spent']}
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Highest Spending Categories Table */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Top Outflow Drivers ({selectedMonth})</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Total Outflow</th>
                <th className="py-2.5 px-3 text-right">Share of Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {categoryChartData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No records found for this month.
                  </td>
                </tr>
              ) : (
                categoryChartData.map((item, idx) => {
                  const share = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-rose-400">
                        {formatINR(item.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                        {Math.round(share * 10) / 10}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
