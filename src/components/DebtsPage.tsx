import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, UserMinus, UserPlus, Trash2, CircleDollarSign } from 'lucide-react';

export const DebtsPage: React.FC = () => {
  const { t } = useI18n();
  const { debtProfiles, addDebtProfile, addDebtPayment, deleteDebtProfile, getDebtRemaining } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [paymentFor, setPaymentFor] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [form, setForm] = useState({ name: '', type: 'debt' as 'debt' | 'credit', amount: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.name.trim() || isNaN(amount) || amount <= 0) return;
    addDebtProfile({ name: form.name.trim(), type: form.type, totalAmount: amount });
    setForm({ name: '', type: 'debt', amount: '' });
    setShowForm(false);
  };

  const handlePayment = (profileId: string) => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    addDebtPayment(profileId, amount);
    setPaymentFor(null);
    setPaymentAmount('');
  };

  const debts = debtProfiles.filter(p => p.type === 'debt');
  const credits = debtProfiles.filter(p => p.type === 'credit');

  const renderProfile = (p: typeof debtProfiles[0]) => {
    const remaining = getDebtRemaining(p);
    const paid = p.totalAmount - remaining;
    const pct = p.totalAmount > 0 ? (paid / p.totalAmount) * 100 : 0;
    const isSettled = remaining <= 0;
    const isDebt = p.type === 'debt';

    return (
      <Card key={p.id} className={`border-l-4 ${isDebt ? 'border-l-debt' : 'border-l-credit'} animate-slide-in`}>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDebt ? 'bg-debt/10' : 'bg-credit/10'}`}>
                {isDebt ? <UserMinus className="w-4 h-4 text-debt" /> : <UserPlus className="w-4 h-4 text-credit" />}
              </div>
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatMAD(p.totalAmount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isSettled ? (
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">{t('debt.settled')}</span>
              ) : (
                <span className={`text-sm font-bold ${isDebt ? 'text-debt' : 'text-credit'}`}>{formatMAD(remaining)}</span>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteDebtProfile(p.id)}>
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          <Progress value={pct} className="h-1.5 mb-2" />

          {!isSettled && (
            paymentFor === p.id ? (
              <div className="flex gap-2 mt-2">
                <Input
                  type="number" step="0.01" min="0"
                  placeholder={t('debt.amount')}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button size="sm" className="h-8" onClick={() => handlePayment(p.id)}>{t('debt.payment')}</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => { setPaymentFor(p.id); setPaymentAmount(''); }}>
                <CircleDollarSign className="w-3 h-3 mr-1" /> {t('debt.addPayment')}
              </Button>
            )
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('debt.title')}</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> {t('debt.addProfile')}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 shadow-lg animate-fade-in">
          <CardContent className="pt-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <Input placeholder={t('debt.name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select value={form.type} onValueChange={(v: 'debt' | 'credit') => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debt">{t('debt.iOwe')}</SelectItem>
                  <SelectItem value="credit">{t('debt.owedToMe')}</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" step="0.01" min="0" placeholder={t('debt.amount')} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <Button type="submit" className="w-full">{t('tx.save')}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {debts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-debt uppercase tracking-wide">{t('debt.iOwe')}</h2>
          {debts.map(renderProfile)}
        </div>
      )}

      {credits.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-credit uppercase tracking-wide">{t('debt.owedToMe')}</h2>
          {credits.map(renderProfile)}
        </div>
      )}

      {debtProfiles.length === 0 && (
        <p className="text-muted-foreground text-center py-8">{t('common.noData')}</p>
      )}
    </div>
  );
};
