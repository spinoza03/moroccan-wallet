import React, { useState, useMemo, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { useMonth } from '@/lib/month-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, TrendingUp, TrendingDown, Search } from 'lucide-react';

export const INCOME_CATEGORIES = [
  'Salaire 1',
  'Retour sur investissement',
  'Freelancing',
  'Allocations familiales (CNSS)',
  'Revenus Locatifs',
  'Remboursement Assurance',
  'Solde précédent',
  'LOTO',
  'Créance Mohamed',
  'Créance Ghita',
  'Créance Soufiane',
  'Crédit immobilier',
  'Crédit consommation',
  'Crédit Mohamed',
  'Crédit Abdessamad',
  'Crédit Banque Populaire',
  'Crédit Youssef',
  'Autre revenu',
];

export const FIXED_EXPENSE_CATEGORIES = [
  'Loyer',
  'Assurance Maison',
  'Assurance Vehicule',
  'Eaux & Électricité',
  'Frais bancaire',
  'Impôts et taxes',
  'Transport',
  'WIFI',
  'Téléphone',
  'Crédit consommation',
  'Crédit immobilier',
  'Crédit voiture',
  'Ecole & cantine',
  'Abonnements',
  'Assurance vie',
  'Epargne',
  'Les parents',
  'Courses',
  'Crédit Abdessamad',
  'Crédit Banque Populaire',
  'Crédit Youssef',
  'Autre fixe',
];

export const VARIABLE_EXPENSE_CATEGORIES = [
  'Retrait Espèce',
  'Coiffeur',
  'Vacances',
  'Sorties',
  'Vêtements',
  'Activities',
  'Maison',
  'Soins & hygiène',
  'Cadeaux',
  'Restaurants',
  'Crédit Mohamed',
  'Consultation Médecin',
  'Administration',
  'Petits trucs',
  'LCA',
  'Investissement',
  'Frais bancaire',
  'Créance Ghita',
  'Appartement',
  'Bolling',
  'Likouch',
  'Crédit Youssef',
  'Créance Soufiane',
  'Autre variable',
];

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
const MONTHS_DA = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

// Swipe-to-delete transaction row
const SwipeableRow: React.FC<{
  onDelete: () => void;
  children: React.ReactNode;
}> = ({ onDelete, children }) => {
  const startX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = startX.current - e.touches[0].clientX;
    if (dx > 0) setOffset(Math.min(dx, 120));
  };

  const handleTouchEnd = () => {
    if (offset >= THRESHOLD) {
      setDeleting(true);
      setTimeout(onDelete, 250);
    } else {
      setOffset(0);
    }
    startX.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Red delete backdrop */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive transition-all"
        style={{ width: offset > 0 ? offset : 0 }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>
      <div
        className={`transition-transform ${deleting ? 'opacity-0 scale-95' : ''}`}
        style={{ transform: `translateX(-${offset}px)`, transition: offset === 0 ? 'transform 0.2s ease' : 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export const TransactionsPage: React.FC = () => {
  const { t, lang } = useI18n();
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const { selectedYear, selectedMonth } = useMonth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const MONTHS = lang === 'darija' ? MONTHS_DA : MONTHS_FR;

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    category: 'variable' as 'fixed' | 'variable',
    label: '',
    amount: '',
    moroccanCategory: '',
  });

  const cats = useMemo(() => {
    if (form.type === 'income') return INCOME_CATEGORIES;
    if (form.category === 'fixed') return FIXED_EXPENSE_CATEGORIES;
    return VARIABLE_EXPENSE_CATEGORIES;
  }, [form.type, form.category]);

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
    setForm({ date: new Date().toISOString().split('T')[0], type: 'expense', category: 'variable', label: '', amount: '', moroccanCategory: '' });
    setShowForm(false);
  };

  // Filter by global month + local search/type filters
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (search && !tx.label.toLowerCase().includes(search.toLowerCase()) && !tx.moroccanCategory.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== 'all' && tx.type !== filterType) return false;
      const d = new Date(tx.date);
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });
  }, [transactions, search, filterType, selectedYear, selectedMonth]);

  const categoryLabel = (tx: typeof transactions[0]) => {
    if (tx.type === 'income') return t('tx.incomeType');
    if (tx.category === 'fixed') return t('tx.expenseFixed');
    return t('tx.expenseVariable');
  };

  const monthLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('nav.transactions')}</h1>
          <p className="text-sm text-muted-foreground">{monthLabel}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> {t('tx.add')}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 shadow-lg animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t('tx.add')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={form.type}
                  onValueChange={(v: 'income' | 'expense') => setForm({ ...form, type: v, moroccanCategory: '', category: v === 'expense' ? 'variable' : 'fixed' })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('tx.incomeType')}</SelectItem>
                    <SelectItem value="expense">{t('tx.expense')}</SelectItem>
                  </SelectContent>
                </Select>

                {form.type === 'expense' && (
                  <Select value={form.category} onValueChange={(v: 'fixed' | 'variable') => setForm({ ...form, category: v, moroccanCategory: '' })}>
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
                  {cats.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input placeholder={t('tx.labelPlaceholder')} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />

              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={t('tx.amountPlaceholder')}
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{t('tx.save')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search + type filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('tx.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tx.all')}</SelectItem>
            <SelectItem value="income">{t('tx.incomeType')}</SelectItem>
            <SelectItem value="expense">{t('tx.expenses')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Swipe hint */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {lang === 'darija' ? '← اسحب لليسار باش تمسح' : '← Glisser pour supprimer'}
        </p>
      )}

      {/* Transaction list */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {filtered.length} {filtered.length !== 1 ? t('tx.counts') : t('tx.count')}
        </h2>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('common.noData')}</p>
        ) : (
          filtered.map((tx, i) => (
            <SwipeableRow key={tx.id} onDelete={() => deleteTransaction(tx.id)}>
              <Card className="animate-slide-in" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                      {tx.type === 'income'
                        ? <TrendingUp className="w-4 h-4 text-green-600" />
                        : <TrendingDown className="w-4 h-4 text-destructive" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{tx.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {categoryLabel(tx)} · {tx.moroccanCategory} · {tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-destructive'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatMAD(tx.amount)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTransaction(tx.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwipeableRow>
          ))
        )}
      </div>
    </div>
  );
};
