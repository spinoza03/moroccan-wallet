import { useState, useEffect, useCallback } from 'react';

// Types
export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'fixed' | 'variable';
  label: string;
  amount: number;
  moroccanCategory: string;
}

export interface DebtProfile {
  id: string;
  name: string;
  type: 'debt' | 'credit';
  totalAmount: number;
  payments: { id: string; date: string; amount: number }[];
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  contributions: { id: string; date: string; amount: number }[];
}

export interface AppSettings {
  salaryDay: number;
}

interface AppState {
  transactions: Transaction[];
  debtProfiles: DebtProfile[];
  savingsGoals: SavingsGoal[];
  dkhira: number;
  settings: AppSettings;
}

const defaultState: AppState = {
  transactions: [],
  debtProfiles: [],
  savingsGoals: [],
  dkhira: 0,
  settings: { salaryDay: 28 },
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem('mizaniyti-data');
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return defaultState;
}

function saveState(state: AppState) {
  localStorage.setItem('mizaniyti-data', JSON.stringify(state));
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { saveState(state); }, [state]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setState(s => ({ ...s, transactions: [{ ...tx, id: crypto.randomUUID() }, ...s.transactions] }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }));
  }, []);

  const addDebtProfile = useCallback((p: Omit<DebtProfile, 'id' | 'payments'>) => {
    setState(s => ({ ...s, debtProfiles: [...s.debtProfiles, { ...p, id: crypto.randomUUID(), payments: [] }] }));
  }, []);

  const addDebtPayment = useCallback((profileId: string, amount: number) => {
    setState(s => ({
      ...s,
      debtProfiles: s.debtProfiles.map(p =>
        p.id === profileId
          ? { ...p, payments: [...p.payments, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], amount }] }
          : p
      ),
    }));
  }, []);

  const deleteDebtProfile = useCallback((id: string) => {
    setState(s => ({ ...s, debtProfiles: s.debtProfiles.filter(p => p.id !== id) }));
  }, []);

  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, 'id' | 'contributions'>) => {
    setState(s => ({ ...s, savingsGoals: [...s.savingsGoals, { ...g, id: crypto.randomUUID(), contributions: [] }] }));
  }, []);

  const addSavingsContribution = useCallback((goalId: string, amount: number) => {
    setState(s => ({
      ...s,
      savingsGoals: s.savingsGoals.map(g =>
        g.id === goalId
          ? { ...g, contributions: [...g.contributions, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], amount }] }
          : g
      ),
    }));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setState(s => ({ ...s, savingsGoals: s.savingsGoals.filter(g => g.id !== id) }));
  }, []);

  const addToDkhira = useCallback((amount: number) => {
    setState(s => ({ ...s, dkhira: s.dkhira + amount }));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...settings } }));
  }, []);

  // Computed values
  const getDebtRemaining = useCallback((profile: DebtProfile) => {
    const totalPaid = profile.payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, profile.totalAmount - totalPaid);
  }, []);

  const getSavingsTotal = useCallback((goal: SavingsGoal) => {
    return goal.contributions.reduce((sum, c) => sum + c.amount, 0);
  }, []);

  const getSavingsPercent = useCallback((goal: SavingsGoal) => {
    const total = goal.contributions.reduce((sum, c) => sum + c.amount, 0);
    return goal.target > 0 ? Math.min(100, (total / goal.target) * 100) : 0;
  }, []);

  return {
    ...state,
    addTransaction, deleteTransaction,
    addDebtProfile, addDebtPayment, deleteDebtProfile, getDebtRemaining,
    addSavingsGoal, addSavingsContribution, deleteSavingsGoal, getSavingsTotal, getSavingsPercent,
    addToDkhira, updateSettings,
  };
}

// Currency formatting
export function formatMAD(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' DH';
}

export function parseMADInput(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
