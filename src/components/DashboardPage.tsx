import React, { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { useMonth } from '@/lib/month-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, Target,
  UserMinus, UserPlus, FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const MONTHS_DA = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

const PIE_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
];

export const DashboardPage: React.FC = () => {
  const { t, lang } = useI18n();
  const { transactions, debtProfiles, savingsGoals, settings, getSavingsTotal, getDebtRemaining } = useStore();
  const { selectedYear, selectedMonth } = useMonth();

  const MONTHS = lang === 'darija' ? MONTHS_DA : MONTHS_FR;

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
    const resteAVivre = balance;
    const restePercent = totalIncome > 0 ? Math.max(0, Math.min(100, (resteAVivre / totalIncome) * 100)) : 0;

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
    const allExpByCategory: Record<string, number> = {};
    [...fixedItems, ...variableItems].forEach(t => {
      allExpByCategory[t.moroccanCategory] = (allExpByCategory[t.moroccanCategory] || 0) + t.amount;
    });

    return {
      totalIncome, fixedExpenses, variableExpenses, totalExpenses,
      balance, resteAVivre, restePercent,
      incomeByCategory, fixedByCategory, variableByCategory, allExpByCategory,
      monthTxs,
    };
  }, [transactions, selectedYear, selectedMonth]);

  // Bar chart data: income vs expenses per month for selected year
  const incomeVsExpensesData = useMemo(() => {
    return MONTHS.map((label, mIdx) => {
      const monthTxs = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === selectedYear && d.getMonth() === mIdx;
      });
      const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: label, revenus: income, depenses: expenses };
    });
  }, [transactions, selectedYear, MONTHS]);

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

  const allExpPieData = Object.entries(stats.allExpByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const fixedPieData = Object.entries(stats.fixedByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const variablePieData = Object.entries(stats.variableByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const targetPieData = totalTarget > 0
    ? [{ name: t('dash.saved'), value: totalSaved }, { name: t('dash.remaining'), value: Math.max(0, totalTarget - totalSaved) }]
    : [];

  const monthLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;

  // PDF Export
  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Bilan Financier — ' + monthLabel, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Généré le ' + new Date().toLocaleDateString('fr-MA'), 14, 27);

    // Summary table
    autoTable(doc, {
      startY: 32,
      head: [['Indicateur', 'Montant']],
      body: [
        ['Total Revenus', formatMAD(stats.totalIncome)],
        ['Total Dépenses', formatMAD(stats.totalExpenses)],
        ['  dont Dépenses fixes', formatMAD(stats.fixedExpenses)],
        ['  dont Dépenses variables', formatMAD(stats.variableExpenses)],
        ['Reste à vivre', formatMAD(stats.resteAVivre)],
        ['Dettes en cours', formatMAD(totalDebts)],
        ['Créances en cours', formatMAD(totalCredits)],
      ],
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 10 },
    });

    // Transactions table
    const lastY = (doc as any).lastAutoTable?.finalY ?? 80;
    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text('Transactions du mois', 14, lastY + 10);

    const txRows = stats.monthTxs
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(tx => [
        tx.date,
        tx.type === 'income' ? 'Revenu' : tx.category === 'fixed' ? 'Dépense fixe' : 'Dépense variable',
        tx.moroccanCategory,
        tx.label,
        (tx.type === 'income' ? '+' : '-') + formatMAD(tx.amount),
      ]);

    autoTable(doc, {
      startY: lastY + 14,
      head: [['Date', 'Type', 'Catégorie', 'Description', 'Montant']],
      body: txRows.length > 0 ? txRows : [['—', '—', '—', 'Aucune transaction', '—']],
      headStyles: { fillColor: [34, 197, 94] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9 },
      columnStyles: { 4: { halign: 'right' } },
    });

    // Debts
    if (debtProfiles.length > 0) {
      const afterTx = (doc as any).lastAutoTable?.finalY ?? 140;
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);
      doc.text('Kridi & Créances en cours', 14, afterTx + 10);

      autoTable(doc, {
        startY: afterTx + 14,
        head: [['Nom', 'Type', 'Total', 'Payé', 'Reste']],
        body: debtProfiles.map(p => {
          const remaining = getDebtRemaining(p);
          const paid = p.totalAmount - remaining;
          return [
            p.name,
            p.type === 'debt' ? 'Je dois' : 'On me doit',
            formatMAD(p.totalAmount),
            formatMAD(paid),
            formatMAD(remaining),
          ];
        }),
        headStyles: { fillColor: [239, 68, 68] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`bilan-${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}.pdf`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('dash.title')}</h1>
          <p className="text-sm text-muted-foreground">{monthLabel}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
          <FileDown className="w-4 h-4" />
          <span className="hidden sm:inline">
            {lang === 'darija' ? 'تحميل PDF' : 'Exporter PDF'}
          </span>
          <span className="sm:hidden">PDF</span>
        </Button>
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
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {stats.balance >= 0 ? '+' : ''}{formatMAD(stats.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart 1: Income vs Expenses Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            {lang === 'darija' ? 'المداخيل ضد المصاريف' : 'Revenus vs Dépenses'} — {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={incomeVsExpensesData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatMAD(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenus" name={lang === 'darija' ? 'المداخيل' : 'Revenus'} fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="depenses" name={lang === 'darija' ? 'المصاريف' : 'Dépenses'} fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Reste à vivre progress bar */}
      <Card className={`border-l-4 ${stats.resteAVivre >= 0 ? 'border-l-green-500' : 'border-l-destructive'}`}>
        <CardContent className="py-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="font-bold text-base">
                {lang === 'darija' ? 'الباقي للمعيشة' : 'Reste à vivre'}
              </span>
            </div>
            <span className={`text-lg font-bold ${stats.resteAVivre >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {formatMAD(stats.resteAVivre)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${stats.resteAVivre >= 0 ? 'bg-green-500' : 'bg-destructive'}`}
              style={{ width: `${stats.restePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{lang === 'darija' ? 'المصاريف' : 'Dépenses'}: {formatMAD(stats.totalExpenses)}</span>
            <span>{stats.restePercent.toFixed(0)}% {lang === 'darija' ? 'من الدخل' : 'du revenu'}</span>
            <span>{lang === 'darija' ? 'الدخل' : 'Revenus'}: {formatMAD(stats.totalIncome)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Expenses Pie Chart by category */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            {lang === 'darija' ? 'المصاريف حسب الخانة' : 'Dépenses par catégorie'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allExpPieData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('dash.noVariable')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-destructive text-white">
                      <th className="text-left px-2 py-1.5 rounded-tl font-medium">
                        {lang === 'darija' ? 'الخانة' : 'Catégorie'}
                      </th>
                      <th className="text-right px-2 py-1.5 font-medium">{t('dash.colAmount')}</th>
                      <th className="text-right px-2 py-1.5 rounded-tr font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allExpPieData.map(({ name, value }, i) => (
                      <tr key={name} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="px-2 py-1 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          {name}
                        </td>
                        <td className="px-2 py-1 text-right font-medium">{formatMAD(value)}</td>
                        <td className="px-2 py-1 text-right">
                          {stats.totalExpenses > 0 ? Math.round((value / stats.totalExpenses) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-destructive text-white font-semibold">
                      <td className="px-2 py-1.5 rounded-bl">{t('dash.total')}</td>
                      <td className="px-2 py-1.5 text-right">{formatMAD(stats.totalExpenses)}</td>
                      <td className="px-2 py-1.5 text-right rounded-br">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={allExpPieData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={75}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {allExpPieData.map((_, i) => (
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
                        <td className="px-2 py-1 text-right">
                          {stats.totalIncome > 0 ? Math.round((amt / stats.totalIncome) * 100) : 0}%
                        </td>
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
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={Object.entries(stats.incomeByCategory).map(([n, v]) => ({ name: n, value: v }))}
                    cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                  >
                    {Object.keys(stats.incomeByCategory).map((_, i) => (
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

      {/* Fixed expenses */}
      {fixedPieData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-700" /> {t('dash.fixedExpenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <td className="px-2 py-1 text-right">
                          {stats.fixedExpenses > 0 ? Math.round((value / stats.fixedExpenses) * 100) : 0}%
                        </td>
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
                    {fixedPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatMAD(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variable expenses */}
      {variablePieData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-500" /> {t('dash.varExpenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <td className="px-2 py-1 text-right">
                          {stats.variableExpenses > 0 ? Math.round((value / stats.variableExpenses) * 100) : 0}%
                        </td>
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
          </CardContent>
        </Card>
      )}

      {/* Savings target */}
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
                        <Cell key={i} fill={['#3b82f6', '#f97316'][i]} />
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
