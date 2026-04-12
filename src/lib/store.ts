import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';

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

export function useAppStore() {
  const { user } = useAuth();
  const [state, setState] = useState<AppState>(defaultState);
  const [dataLoading, setDataLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Supabase on mount / user change
  useEffect(() => {
    if (!user) {
      setState(defaultState);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    supabase
      .from('user_data')
      .select('data')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows found (normal for new user)
          console.error('load user_data error:', error);
        }
        if (data?.data) {
          setState({ ...defaultState, ...(data.data as AppState) });
        }
        setDataLoading(false);
      });
  }, [user]);

  // Debounced save to Supabase
  const persistState = useCallback((newState: AppState) => {
    if (!user) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase.from('user_data').upsert({
        user_id: user.id,
        data: newState,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) console.error('save user_data error:', error);
    }, 800);
  }, [user]);

  const update = useCallback((updater: (s: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      persistState(next);
      return next;
    });
  }, [persistState]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    update(s => ({ ...s, transactions: [{ ...tx, id: crypto.randomUUID() }, ...s.transactions] }));
  }, [update]);

  const deleteTransaction = useCallback((id: string) => {
    update(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }));
  }, [update]);

  const addDebtProfile = useCallback((p: Omit<DebtProfile, 'id' | 'payments'>) => {
    update(s => ({ ...s, debtProfiles: [...s.debtProfiles, { ...p, id: crypto.randomUUID(), payments: [] }] }));
  }, [update]);

  const addDebtPayment = useCallback((profileId: string, amount: number) => {
    update(s => ({
      ...s,
      debtProfiles: s.debtProfiles.map(p =>
        p.id === profileId
          ? { ...p, payments: [...p.payments, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], amount }] }
          : p
      ),
    }));
  }, [update]);

  const deleteDebtProfile = useCallback((id: string) => {
    update(s => ({ ...s, debtProfiles: s.debtProfiles.filter(p => p.id !== id) }));
  }, [update]);

  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, 'id' | 'contributions'>) => {
    update(s => ({ ...s, savingsGoals: [...s.savingsGoals, { ...g, id: crypto.randomUUID(), contributions: [] }] }));
  }, [update]);

  const addSavingsContribution = useCallback((goalId: string, amount: number) => {
    update(s => ({
      ...s,
      savingsGoals: s.savingsGoals.map(g =>
        g.id === goalId
          ? { ...g, contributions: [...g.contributions, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], amount }] }
          : g
      ),
    }));
  }, [update]);

  const deleteSavingsGoal = useCallback((id: string) => {
    update(s => ({ ...s, savingsGoals: s.savingsGoals.filter(g => g.id !== id) }));
  }, [update]);

  const addToDkhira = useCallback((amount: number) => {
    update(s => ({ ...s, dkhira: s.dkhira + amount }));
  }, [update]);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    update(s => ({ ...s, settings: { ...s.settings, ...settings } }));
  }, [update]);

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
    dataLoading,
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
