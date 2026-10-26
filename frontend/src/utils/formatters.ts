import { PaymentMethod, IncomeSource } from '../types';

/**
 * Formats a number into Indian Rupee currency format (e.g. ₹1,25,000.00)
 */
export function formatINR(amount: number, showDecimals = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}

/**
 * Formats standard ISO YYYY-MM-DD to Indian DD/MM/YYYY
 */
export function formatIndianDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns current date in Asia/Kolkata timezone as YYYY-MM-DD
 */
export function getKolkataCurrentDate(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/**
 * Returns current month string in Asia/Kolkata as YYYY-MM
 */
export function getKolkataCurrentMonth(): string {
  return getKolkataCurrentDate().substring(0, 7);
}

export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; bg: string; text: string; icon: string }
> = {
  UPI: {
    label: 'UPI (GPay / PhonePe / Paytm)',
    bg: 'bg-emerald-950/60 border-emerald-800/40',
    text: 'text-emerald-400',
    icon: 'Smartphone',
  },
  CASH: {
    label: 'Cash',
    bg: 'bg-amber-950/60 border-amber-800/40',
    text: 'text-amber-400',
    icon: 'Banknote',
  },
  DEBIT_CARD: {
    label: 'Debit Card',
    bg: 'bg-blue-950/60 border-blue-800/40',
    text: 'text-blue-400',
    icon: 'CreditCard',
  },
  CREDIT_CARD: {
    label: 'Credit Card',
    bg: 'bg-purple-950/60 border-purple-800/40',
    text: 'text-purple-400',
    icon: 'CreditCard',
  },
  BANK_TRANSFER: {
    label: 'Net Banking / IMPS / NEFT',
    bg: 'bg-cyan-950/60 border-cyan-800/40',
    text: 'text-cyan-400',
    icon: 'Landmark',
  },
  OTHER: {
    label: 'Other Method',
    bg: 'bg-slate-900 border-slate-700/40',
    text: 'text-slate-400',
    icon: 'Receipt',
  },
};

export const INCOME_SOURCE_CONFIG: Record<
  IncomeSource,
  { label: string; color: string }
> = {
  SALARY: { label: 'Monthly Salary', color: '#10b981' },
  POCKET_MONEY: { label: 'Pocket Money', color: '#8b5cf6' },
  FREELANCE: { label: 'Freelance & Gigs', color: '#3b82f6' },
  BUSINESS: { label: 'Business & Trade', color: '#f59e0b' },
  GIFTS: { label: 'Gifts & Festive', color: '#ec4899' },
  OTHER: { label: 'Other Income', color: '#64748b' },
};

/**
 * Downloads a structured CSV file
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
