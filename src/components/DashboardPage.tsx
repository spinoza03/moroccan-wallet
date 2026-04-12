import React, { useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, UserMinus, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const MONTHS_DA = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

export const DashboardPage: React.FC = () => {
  const { t, lang } = useI18n();
  const { transactions, debtProfiles, savingsGoals, settings, getSavingsTotal, getDebtRemaining } = useStore();

  const MONTHS = lang === 'darija' ? MONTHS_DA : MONTHS_FR;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const years = useMemo(() => {
    const ys = new Set<number>();
    transactions.forEach(tx => ys.add(new Date(tx.date).getFullYear()));
    ys.add(currentYear);
    return Array.from(ys).sort((a, b) => a - b);
  }, [transactions, currentYear]);

  const stats = useMemo(() => {
    const monthTxs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });

    const incomeItems = monthTxs.filter(t => t.type === 'income');
    const fixedItems = monthTxs.filter(t => t.type === 'expense' && t.category === 'fixed');
    const variableItems = monthTxs.filter(t => t.type === 'expense' && t.category === 'variable');

    const totalIncome = incomeItems.reduce((s, t) => s + t.amount, 0);
    const fixedExpenses = fixedItems.reduce((s, t) => s + t.amount, 0);
    const variableExpenses = variableItems.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = fixedExpenses + variableExpenses;
    const balance = totalIncome - totalExpenses;
    const savings = balance;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    const incomeByCategory: Record<string, number> = {};
    incomeItems.forEach(t => {
      incomeByCategory[t.moroccanCategory] = (incomeByCategory[t.moroccanCategory] || 0) + t.amount;
    });
    const fixedByCategory: Record<string, number> = {};
    fixedItems.forEach(t => {
      fixedByCategory[t.moroccanCategory] = (fixedByCategory[t.moroccanCategory] || 0) + t.amount;
    });
    const variableByCategory: Record<string, number> = {};
    variableItems.forEach(t => {
      variableByCategory[t.moroccanCategory] = (variableByCategory[t.moroccanCategory] || 0) + t.amount;
    });

    return {
      totalIncome, fixedExpenses, variableExpenses, totalExpenses,
      balance, savings, savingsRate,
      incomeByCategory, fixedByCategory, variableByCategory,
    };
  }, [transactions, selectedYear, selectedMonth]);

  const monthlyBalances = useMemo(() => {
    return MONTHS.map((label, mIdx) => {
      const monthTxs = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === selectedYear && d.getMonth() === mIdx;
      });
      const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: label, solde: income - expenses, income, expenses };
    });
  }, [transactions, selectedYear, MONTHS]);

  const cumulativeBalances = useMemo(() => {
    let running = 0;
    return monthlyBalances.map(m => {
      running += m.solde;
      return { month: m.month, solde: running };
    });
  }, [monthlyBalances]);

  const { totalDebts, totalCredits } = useMemo(() => {
    let totalDebts = 0;
    let totalCredits = 0;
    debtProfiles.forEach(p => {
      const remaining = getDebtRemaining(p);
      if (p.type === 'debt') totalDebts += remaining;
      else totalCredits += remaining;
    });
    return { totalDebts, totalCredits };
  }, [debtProfiles, getDebtRemaining]);

  const { totalSaved, totalTarget } = useMemo(() => {
    let totalSaved = 0;
    let totalTarget = 0;
    savingsGoals.forEach(g => {
      totalSaved += getSavingsTotal(g);
      totalTarget += g.target;
    });
    return { totalSaved, totalTarget };
  }, [savingsGoals, getSavingsTotal]);

  const targetPercent = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  const fixedPieData = Object.entries(stats.fixedByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const variablePieData = Object.entries(stats.variableByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const targetPieData = totalTarget > 0
    ? [{ name: t('dash.saved'), value: totalSaved }, { name: t('dash.remaining'), value: Math.max(0, totalTarget - totalSaved) }]
    : [];

  const PIE_COLORS = [
    '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
  ];
  const TARGET_COLORS = ['#3b82f6', '#f97316'];

  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else setSelectedMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else setSelectedMonth(m => m + 1);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('dash.title')}</h1>
        <div className="flex items-center gap-1">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${selectedYear === y ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Month selector */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-muted shrink-0">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(i)}
            className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors ${
              selectedMonth === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {m}
          </button>
        ))}
        <button onClick={nextMonth} className="p-1 rounded hover:bg-muted shrink-0">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dettes & Créances */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <UserMinus className="w-4 h-4 text-destructive" />
              <p className="text-xs font-semibold text-destructive">{t('dash.debts')}</p>
            </div>
            <p className="text-lg font-bold text-destructive">{formatMAD(totalDebts)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-700">{t('dash.credits')}</p>
            </div>
            <p className="text-lg font-bold text-green-600">{formatMAD(totalCredits)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance & Savings */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">{t('dash.balance')}</p>
            </div>
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {stats.balance >= 0 ? '+' : ''}{formatMAD(stats.balance)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted-foreground">{t('dash.periodSavings')}</p>
            </div>
            <p className={`text-2xl font-bold ${stats.savings >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {stats.savings >= 0 ? '+' : ''}{formatMAD(stats.savings)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 12-month balance chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('dash.monthlyBalances')} — {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cumulativeBalances}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatMAD(v)} labelFormatter={l => `${l} ${selectedYear}`} />
              <Line type="monotone" dataKey="solde" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name={t('dash.cumBalance')} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Income table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" /> {t('dash.periodIncome')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.incomeByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('dash.noIncome')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="text-left px-2 py-1.5 rounded-tl font-medium">{t('dash.colIncome')}</th>
                      <th className="text-right px-2 py-1.5 font-medium">{t('dash.colAmount')}</th>
                      <th className="text-right px-2 py-1.5 rounded-tr font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.incomeByCategory).map(([cat, amt], i) => (
                      <tr key={cat} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="px-2 py-1">{cat}</td>
                        <td className="px-2 py-1 text-right font-medium">{formatMAD(amt)}</td>
                        <td className="px-2 py-1 text-right">{stats.totalIncome > 0 ? Math.round((amt / stats.totalIncome) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-600 text-white font-semibold">
                      <td className="px-2 py-1.5 rounded-bl">{t('dash.total')}</td>
                      <td className="px-2 py-1.5 text-right">{formatMAD(stats.totalIncome)}</td>
                      <td className="px-2 py-1.5 text-right rounded-br">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {Object.keys(stats.incomeByCategory).length > 0 && (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={Object.entries(stats.incomeByCategory).map(([n, v]) => ({ name: n, value: v }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {Object.keys(stats.incomeByCategory).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatMAD(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixed expenses table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-700" /> {t('dash.fixedExpenses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.fixedByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('dash.noFixed')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-700 text-white">
                      <th className="text-left px-2 py-1.5 rounded-tl font-medium">{t('dash.colFixed')}</th>
                      <th className="text-right px-2 py-1.5 font-medium">{t('dash.colAmount')}</th>
                      <th className="text-right px-2 py-1.5 rounded-tr font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fixedPieData.map(({ name, value }, i) => (
                      <tr key={name} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="px-2 py-1">{name}</td>
                        <td className="px-2 py-1 text-right font-medium">{formatMAD(value)}</td>
                        <td className="px-2 py-1 text-right">{stats.fixedExpenses > 0 ? Math.round((value / stats.fixedExpenses) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-700 text-white font-semibold">
                      <td className="px-2 py-1.5 rounded-bl">{t('dash.total')}</td>
                      <td className="px-2 py-1.5 text-right">{formatMAD(stats.fixedExpenses)}</td>
                      <td className="px-2 py-1.5 text-right rounded-br">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={fixedPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {fixedPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatMAD(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variable expenses table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-orange-500" /> {t('dash.varExpenses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats.variableByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('dash.noVariable')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-orange-500 text-white">
                      <th className="text-left px-2 py-1.5 rounded-tl font-medium">{t('dash.colVariable')}</th>
                      <th className="text-right px-2 py-1.5 font-medium">{t('dash.colAmount')}</th>
                      <th className="text-right px-2 py-1.5 rounded-tr font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variablePieData.map(({ name, value }, i) => (
                      <tr key={name} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="px-2 py-1">{name}</td>
                        <td className="px-2 py-1 text-right font-medium">{formatMAD(value)}</td>
                        <td className="px-2 py-1 text-right">{stats.variableExpenses > 0 ? Math.round((value / stats.variableExpenses) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-orange-500 text-white font-semibold">
                      <td className="px-2 py-1.5 rounded-bl">{t('dash.total')}</td>
                      <td className="px-2 py-1.5 text-right">{formatMAD(stats.variableExpenses)}</td>
                      <td className="px-2 py-1.5 text-right rounded-br">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={variablePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {variablePieData.map((_, i) => (
                      <Cell key={i} fill={['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fde68a'][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatMAD(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target */}
      {totalTarget > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-lg">{t('dash.target')}</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">{formatMAD(totalTarget)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('dash.saved')} : {formatMAD(totalSaved)} ({targetPercent.toFixed(0)}%)
                </p>
                <p className="text-sm text-orange-500 font-medium">
                  {t('dash.remaining')} : {formatMAD(Math.max(0, totalTarget - totalSaved))}
                </p>
              </div>
              {targetPieData.length > 0 && (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={targetPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {targetPieData.map((_, i) => (
                        <Cell key={i} fill={TARGET_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatMAD(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
