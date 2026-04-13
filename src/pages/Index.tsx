import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { StoreProvider } from '@/lib/store-context';
import { MonthProvider, useMonth } from '@/lib/month-context';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store-context';
import { DashboardPage } from '@/components/DashboardPage';
import { TransactionsPage } from '@/components/TransactionsPage';
import { DebtsPage } from '@/components/DebtsPage';
import { SavingsPage } from '@/components/SavingsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { Logo } from '@/components/Logo';
import { TutorialPopup, type TutorialKey } from '@/components/TutorialPopup';
import { LayoutDashboard, ArrowLeftRight, Users, Target, Settings, LogOut, HelpCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { INCOME_CATEGORIES, FIXED_EXPENSE_CATEGORIES, VARIABLE_EXPENSE_CATEGORIES } from '@/components/TransactionsPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Tab = 'dashboard' | 'transactions' | 'debts' | 'savings' | 'settings';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const MONTHS_DA = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

const QuickAddModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t, lang } = useI18n();
  const { addTransaction } = useStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    category: 'variable' as 'fixed' | 'variable',
    label: '',
    amount: '',
    moroccanCategory: '',
  });

  const cats = form.type === 'income'
    ? INCOME_CATEGORIES
    : form.category === 'fixed'
    ? FIXED_EXPENSE_CATEGORIES
    : VARIABLE_EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.label.trim() || isNaN(amount) || amount <= 0 || !form.moroccanCategory) return;
    addTransaction({
      date: form.date,
      type: form.type,
      category: form.type === 'income' ? 'fixed' : form.category,
      label: form.label.trim(),
      amount,
      moroccanCategory: form.moroccanCategory,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <Card
        className="relative w-full max-w-2xl rounded-t-2xl rounded-b-none shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-3" />
          <CardTitle className="text-lg">{lang === 'darija' ? 'زيد معاملة' : 'Ajout rapide'}</CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={form.type}
                onValueChange={(v: 'income' | 'expense') =>
                  setForm({ ...form, type: v, moroccanCategory: '', category: v === 'expense' ? 'variable' : 'fixed' })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t('tx.incomeType')}</SelectItem>
                  <SelectItem value="expense">{t('tx.expense')}</SelectItem>
                </SelectContent>
              </Select>
              {form.type === 'expense' && (
                <Select
                  value={form.category}
                  onValueChange={(v: 'fixed' | 'variable') => setForm({ ...form, category: v, moroccanCategory: '' })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">{t('tx.expenseFixed')}</SelectItem>
                    <SelectItem value="variable">{t('tx.expenseVariable')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <Select value={form.moroccanCategory} onValueChange={v => setForm({ ...form, moroccanCategory: v })}>
              <SelectTrigger><SelectValue placeholder={t('tx.chooseCat')} /></SelectTrigger>
              <SelectContent>
                {cats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder={t('tx.labelPlaceholder')}
              value={form.label}
              onChange={e => setForm({ ...form, label: e.target.value })}
            />
            <Input
              type="number" step="0.01" min="0"
              placeholder={t('tx.amountPlaceholder')}
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">{t('tx.save')}</Button>
              <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const MonthBar: React.FC = () => {
  const { lang } = useI18n();
  const { selectedYear, selectedMonth, setSelectedYear, setSelectedMonth, prevMonth, nextMonth } = useMonth();
  const { transactions } = useStore();
  const MONTHS = lang === 'darija' ? MONTHS_DA : MONTHS_FR;

  const years = React.useMemo(() => {
    const ys = new Set<number>();
    transactions.forEach(tx => ys.add(new Date(tx.date).getFullYear()));
    ys.add(new Date().getFullYear());
    return Array.from(ys).sort((a, b) => a - b);
  }, [transactions]);

  return (
    <div className="bg-card border-b px-4 py-2 sticky top-[53px] z-10">
      <div className="max-w-2xl mx-auto space-y-1.5">
        <div className="flex items-center gap-1">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${selectedYear === y ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-muted shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(i)}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors ${selectedMonth === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {m}
            </button>
          ))}
          <button onClick={nextMonth} className="p-1 rounded hover:bg-muted shrink-0">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [tab, setTab] = useState<Tab>(() => {
    return (localStorage.getItem('mz_tab') as Tab) || 'dashboard';
  });
  const [showFAB, setShowFAB] = useState(false);

  const handleSetTab = (t: Tab) => {
    localStorage.setItem('mz_tab', t);
    setTab(t);
  };
  const [showTutorial, setShowTutorial] = useState(false);
  const { t, lang } = useI18n();
  const { signOut, profile } = useAuth();

  const tabs: { key: Tab; icon: React.ElementType; labelKey: string }[] = [
    { key: 'dashboard',    icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { key: 'transactions', icon: ArrowLeftRight,  labelKey: 'nav.transactions' },
    { key: 'debts',        icon: Users,           labelKey: 'nav.debts' },
    { key: 'savings',      icon: Target,          labelKey: 'nav.savings' },
    { key: 'settings',     icon: Settings,        labelKey: 'nav.settings' },
  ];

  const helpLabel = lang === 'darija' ? 'كيفاش كيخدم' : 'Comment utiliser';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 py-2 flex items-center justify-between sticky top-0 z-10">
        <Logo size="sm" className="h-9" />
        <div className="flex items-center gap-2">
          {profile?.full_name && (
            <span className="text-xs text-muted-foreground hidden sm:block">{profile.full_name}</span>
          )}
          <button
            onClick={() => setShowTutorial(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
            title={helpLabel}
          >
            <HelpCircle className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title={lang === 'darija' ? 'خروج' : 'Se déconnecter'}
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Global month bar */}
      <MonthBar />

      {/* Content */}
      <main className="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
        {tab === 'dashboard'    && <DashboardPage />}
        {tab === 'transactions' && <TransactionsPage />}
        {tab === 'debts'        && <DebtsPage />}
        {tab === 'savings'      && <SavingsPage />}
        {tab === 'settings'     && <SettingsPage />}
      </main>

      {/* Bottom Nav with FAB */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-10">
        <div className="max-w-2xl mx-auto flex items-end justify-around px-2 py-1 relative">
          {tabs.slice(0, 2).map(({ key, icon: Icon, labelKey }) => (
            <button
              key={key}
              onClick={() => handleSetTab(key)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                tab === key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{t(labelKey)}</span>
            </button>
          ))}

          {/* FAB center */}
          <div className="flex flex-col items-center -mt-4">
            <button
              onClick={() => setShowFAB(true)}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
              aria-label={lang === 'darija' ? 'زيد معاملة' : 'Ajouter'}
            >
              <Plus className="w-7 h-7" />
            </button>
            <span className="text-[10px] mt-1 text-muted-foreground font-medium">
              {lang === 'darija' ? 'زيد' : 'Ajouter'}
            </span>
          </div>

          {tabs.slice(2).map(({ key, icon: Icon, labelKey }) => (
            <button
              key={key}
              onClick={() => handleSetTab(key)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                tab === key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* FAB Quick Add Modal */}
      {showFAB && <QuickAddModal onClose={() => setShowFAB(false)} />}

      {/* Tutorial popup */}
      {showTutorial && (
        <TutorialPopup
          tutorialKey={tab as TutorialKey}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
};

const Index = () => (
  <StoreProvider>
    <MonthProvider>
      <AppContent />
    </MonthProvider>
  </StoreProvider>
);

export default Index;
