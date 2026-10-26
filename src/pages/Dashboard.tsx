import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertTriangle,
  PlusCircle,
  ArrowUpRight,
  PieChart as PieIcon,
  Sliders,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardSummary } from '../types';
import { api } from '../services/api';
import { SummaryCard } from '../components/SummaryCard';
import { formatINR, formatIndianDate } from '../utils/formatters';

interface DashboardProps {
  onOpenExpenseModal: () => void;
  onOpenIncomeModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenExpenseModal,
  onOpenIncomeModal,
  onNavigateTab,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-28 rounded-xl bg-slate-900/60 border border-slate-800" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-slate-900/60 border border-slate-800" />
      </div>
    );
  }

  const isBudgetWarning = summary.budgetUsagePercent >= 80 && summary.budgetUsagePercent < 100;
  const isBudgetExceeded = summary.budgetUsagePercent >= 100;

  return (
    <div className="space-y-6">
      {/* Top Banner / Budget Alert if nearing limit */}
      {(isBudgetWarning || isBudgetExceeded) && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-xs ${
            isBudgetExceeded
              ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
              : 'bg-amber-950/50 border-amber-800/60 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-semibold block">
                {isBudgetExceeded ? 'Budget Limit Exceeded!' : 'Budget Warning: 80% Threshold Reached'}
              </span>
              <span>
                You have spent {formatINR(summary.totalMonthlyExpenses)} of your{' '}
                {formatINR(summary.monthlyBudgetTotal)} monthly budget limit (
                {Math.round(summary.budgetUsagePercent)}%).
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('budgets')}
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-medium hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Available Balance"
          value={formatINR(summary.availableBalance)}
          subtext="Net liquidity in INR"
          icon={Wallet}
          iconColor="text-emerald-400"
          badge={{
            text: summary.availableBalance >= 0 ? 'Surplus' : 'Deficit',
            variant: summary.availableBalance >= 0 ? 'positive' : 'danger',
          }}
        />

        <SummaryCard
          title="Monthly Income"
          value={formatINR(summary.totalMonthlyIncome)}
          subtext="Current month earnings"
          icon={TrendingUp}
          iconColor="text-emerald-400"
          badge={{ text: 'Credited', variant: 'positive' }}
        />

        <SummaryCard
          title="Monthly Expenses"
          value={formatINR(summary.totalMonthlyExpenses)}
          subtext="Current month outflows"
          icon={TrendingDown}
          iconColor="text-rose-400"
          badge={{ text: 'Debited', variant: 'danger' }}
        />

        <SummaryCard
          title="Remaining Budget"
          value={formatINR(summary.remainingMonthlyBudget)}
          subtext={
            summary.monthlyBudgetTotal > 0
              ? `From ${formatINR(summary.monthlyBudgetTotal)} budget`
              : 'No budget set'
          }
          icon={CreditCard}
          iconColor="text-purple-400"
          badge={{
            text: `${Math.round(summary.budgetUsagePercent)}% used`,
            variant: isBudgetExceeded ? 'danger' : isBudgetWarning ? 'warning' : 'neutral',
          }}
        />

        <SummaryCard
          title="Daily Average"
          value={formatINR(summary.dailyAverageSpending)}
          subtext="Per day in current month"
          icon={Calendar}
          iconColor="text-cyan-400"
        />
      </div>

      {/* Monthly Budget Progress Bar */}
      {summary.monthlyBudgetTotal > 0 && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Monthly Overall Budget Progress</span>
              <span className="text-slate-400">
                ({formatINR(summary.totalMonthlyExpenses)} spent of {formatINR(summary.monthlyBudgetTotal)})
              </span>
            </div>
            <span
              className={`font-mono tabular-nums font-semibold ${
                isBudgetExceeded ? 'text-rose-400' : isBudgetWarning ? 'text-amber-400' : 'text-purple-400'
              }`}
            >
              {Math.round(summary.budgetUsagePercent)}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBudgetExceeded
                  ? 'bg-rose-500'
                  : isBudgetWarning
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, summary.budgetUsagePercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900/60 border border-slate-800/70 rounded-xl">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-2">
          Quick Actions:
        </span>
        <button
          onClick={onOpenExpenseModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm shadow-purple-600/30 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
        <button
          onClick={onOpenIncomeModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Add Income</span>
        </button>
        <button
          onClick={() => onNavigateTab('budgets')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Manage Budgets</span>
        </button>
        <button
          onClick={() => onNavigateTab('reports')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          <span>Export Reports</span>
        </button>
      </div>

      {/* Charts Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trends Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Spending Trajectory</h4>
              <p className="text-xs text-slate-400">Daily expenses in Indian Rupees (₹)</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
            >
              <span>Detailed Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.spendingTrends}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="displayDate"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={val => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs shadow-xl">
                          <span className="text-slate-400 block">{payload[0].payload.date}</span>
                          <span className="font-mono tabular-nums font-bold text-purple-400">
                            {formatINR(Number(payload[0].value))}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (1 Col) */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Expense Breakdown</h4>
              <p className="text-xs text-slate-400">By category this month</p>
            </div>
            <PieIcon className="w-4 h-4 text-purple-400" />
          </div>

          {summary.categoryBreakdown.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              No expenses recorded this month
            </div>
          ) : (
            <>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.categoryBreakdown}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {summary.categoryBreakdown.map((entry, index) => (
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
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top 3 categories list */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                {summary.categoryBreakdown.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 truncate max-w-[120px]">{item.categoryName}</span>
                    </div>
                    <div className="font-mono tabular-nums text-slate-200">
                      {formatINR(item.amount)}
                      <span className="text-slate-500 ml-1.5 text-[11px]">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Transactions Strip */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Recent Transactions</h4>
            <p className="text-xs text-slate-400">Latest expense entries recorded in database</p>
          </div>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            <span>View All Expenses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {summary.recentExpenses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent expenses found. Click &quot;Add Expense&quot; above to log your first transaction.
            </div>
          ) : (
            summary.recentExpenses.map(expense => (
              <div key={expense.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400 font-bold">
                    ₹
                  </div>
                  <div>
                    <span className="font-medium text-white block">{expense.title}</span>
                    <span className="text-slate-400 text-[11px]">
                      {expense.categoryName} · {formatIndianDate(expense.date)} · {expense.paymentMethod}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono tabular-nums font-semibold text-rose-400 block">
                    -{formatINR(expense.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
