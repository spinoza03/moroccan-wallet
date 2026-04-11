import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t } = useI18n();
  const { transactions, settings } = useStore();

  const stats = useMemo(() => {
    const now = new Date();
    const salaryDay = settings.salaryDay;

    // Current financial month boundaries
    let monthStart: Date;
    let monthEnd: Date;
    if (now.getDate() >= salaryDay) {
      monthStart = new Date(now.getFullYear(), now.getMonth(), salaryDay);
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, salaryDay - 1);
    } else {
      monthStart = new Date(now.getFullYear(), now.getMonth() - 1, salaryDay);
      monthEnd = new Date(now.getFullYear(), now.getMonth(), salaryDay - 1);
    }

    const monthTxs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= monthStart && d <= monthEnd;
    });

    const totalIncome = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const fixedExpenses = monthTxs.filter(t => t.type === 'expense' && t.category === 'fixed').reduce((s, t) => s + t.amount, 0);
    const variableExpenses = monthTxs.filter(t => t.type === 'expense' && t.category === 'variable').reduce((s, t) => s + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    const resteAVivre = totalIncome - fixedExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return { totalIncome, totalExpenses, fixedExpenses, variableExpenses, netIncome, resteAVivre, savingsRate };
  }, [transactions, settings]);

  const pieData = useMemo(() => {
    if (stats.fixedExpenses === 0 && stats.variableExpenses === 0) return [];
    return [
      { name: 'Fixe', value: stats.fixedExpenses },
      { name: 'Variable', value: stats.variableExpenses },
    ];
  }, [stats]);

  const trendData = useMemo(() => {
    const months: { month: string; balance: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      const monthTxs = transactions.filter(tx => {
        const td = new Date(tx.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      months.push({ month: monthLabel, balance: income - expenses });
    }
    return months;
  }, [transactions]);

  const COLORS = ['hsl(155, 60%, 35%)', 'hsl(35, 90%, 55%)'];

  const summaryCards = [
    { label: t('dash.totalIncome'), value: stats.totalIncome, icon: TrendingUp, color: 'text-success' },
    { label: t('dash.totalExpenses'), value: stats.totalExpenses, icon: TrendingDown, color: 'text-destructive' },
    { label: t('dash.resteAVivre'), value: stats.resteAVivre, icon: Wallet, color: 'text-primary' },
    { label: t('dash.savingsRate'), value: stats.savingsRate, icon: PiggyBank, color: 'text-accent', isPercent: true },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t('nav.dashboard')}</h1>

      {/* Net Income Hero */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">{t('dash.netIncome')}</p>
          <p className={`text-4xl font-bold ${stats.netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
            {stats.netIncome >= 0 ? '+' : ''}{formatMAD(stats.netIncome)}
          </p>
        </CardContent>
      </Card>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map((card, i) => (
          <Card key={i} className="animate-slide-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="py-3 px-3">
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
              <p className={`text-lg font-bold ${card.color}`}>
                {card.isPercent ? `${card.value.toFixed(1)}%` : formatMAD(card.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('dash.fixedVsVariable')}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatMAD(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">{t('common.noData')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('dash.balanceTrend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => formatMAD(value)} />
                <Line type="monotone" dataKey="balance" stroke="hsl(155, 60%, 35%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
