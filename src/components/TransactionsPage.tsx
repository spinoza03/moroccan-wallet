import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';

const expenseCategories = [
  'cat.loyer', 'cat.transport', 'cat.ma3icha', 'cat.pharmacie',
  'cat.factures', 'cat.internet', 'cat.scolarite', 'cat.vetements',
  'cat.loisirs', 'cat.credit', 'cat.assurance', 'cat.zakat', 'cat.autre',
];

const incomeCategories = ['cat.salaire', 'cat.freelance', 'cat.autre'];

export const TransactionsPage: React.FC = () => {
  const { t } = useI18n();
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    category: 'fixed' as 'fixed' | 'variable',
    label: '',
    amount: '',
    moroccanCategory: '',
  });

  const cats = form.type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.label.trim() || isNaN(amount) || amount <= 0 || !form.moroccanCategory) return;
    addTransaction({
      date: form.date,
      type: form.type,
      category: form.category,
      label: form.label.trim(),
      amount,
      moroccanCategory: form.moroccanCategory,
    });
    setForm({ date: new Date().toISOString().split('T')[0], type: 'expense', category: 'fixed', label: '', amount: '', moroccanCategory: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('nav.transactions')}</h1>
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
                <Select value={form.type} onValueChange={(v: 'income' | 'expense') => setForm({ ...form, type: v, moroccanCategory: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('tx.income')}</SelectItem>
                    <SelectItem value="expense">{t('tx.expense')}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={form.category} onValueChange={(v: 'fixed' | 'variable') => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">{t('tx.fixed')}</SelectItem>
                    <SelectItem value="variable">{t('tx.variable')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={form.moroccanCategory} onValueChange={v => setForm({ ...form, moroccanCategory: v })}>
                <SelectTrigger><SelectValue placeholder={t('tx.category')} /></SelectTrigger>
                <SelectContent>
                  {cats.map(c => (
                    <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input placeholder={t('tx.label')} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />

              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder={t('tx.amount')}
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />

              <Button type="submit" className="w-full">{t('tx.save')}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('tx.recent')}</h2>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{t('common.noData')}</p>
        ) : (
          transactions.map((tx, i) => (
            <Card key={tx.id} className="animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    {tx.type === 'income' ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{tx.label}</p>
                    <p className="text-xs text-muted-foreground">{t(tx.moroccanCategory)} • {tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMAD(tx.amount)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTransaction(tx.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
