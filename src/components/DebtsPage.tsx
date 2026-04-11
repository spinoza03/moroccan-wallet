import React, { useState, useMemo } from 'react';
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

  const totalDebts = useMemo(() =>
    debts.reduce((s, p) => s + getDebtRemaining(p), 0)
  , [debts, getDebtRemaining]);

  const totalCredits = useMemo(() =>
    credits.reduce((s, p) => s + getDebtRemaining(p), 0)
  , [credits, getDebtRemaining]);

  const renderProfile = (p: typeof debtProfiles[0]) => {
    const remaining = getDebtRemaining(p);
    const paid = p.totalAmount - remaining;
    const pct = p.totalAmount > 0 ? (paid / p.totalAmount) * 100 : 0;
    const isSettled = remaining <= 0;
    const isDebt = p.type === 'debt';

    return (
      <Card key={p.id} className={`border-l-4 ${isDebt ? 'border-l-destructive' : 'border-l-green-500'} animate-slide-in`}>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDebt ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                {isDebt ? <UserMinus className="w-4 h-4 text-destructive" /> : <UserPlus className="w-4 h-4 text-green-600" />}
              </div>
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">Total : {formatMAD(p.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">Payé : {formatMAD(paid)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isSettled ? (
                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">{t('debt.settled')}</span>
              ) : (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Reste</p>
                  <span className={`text-sm font-bold ${isDebt ? 'text-destructive' : 'text-green-600'}`}>{formatMAD(remaining)}</span>
                </div>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={() => deleteDebtProfile(p.id)}>
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
                <Button size="sm" variant="outline" className="h-8" onClick={() => setPaymentFor(null)}>✕</Button>
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

      {/* Totals summary like Excel */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <UserMinus className="w-4 h-4 text-destructive" />
              </div>
              <p className="font-bold text-destructive">Dettes</p>
            </div>
            {debts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune dette</p>
            ) : (
              <div className="space-y-1">
                {debts.map(p => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate mr-2">{p.name}</span>
                    <span className="font-medium text-destructive shrink-0">{formatMAD(getDebtRemaining(p))}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t border-destructive/30 pt-1 mt-1">
                  <span>Total</span>
                  <span className="text-destructive">{formatMAD(totalDebts)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              <p className="font-bold text-green-700">Créances</p>
            </div>
            {credits.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune créance</p>
            ) : (
              <div className="space-y-1">
                {credits.map(p => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate mr-2">{p.name}</span>
                    <span className="font-medium text-green-600 shrink-0">{formatMAD(getDebtRemaining(p))}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t border-green-500/30 pt-1 mt-1">
                  <span>Total</span>
                  <span className="text-green-600">{formatMAD(totalCredits)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="border-primary/20 shadow-lg animate-fade-in">
          <CardContent className="pt-4">
            <form onSubmit={handleAdd} className="space-y-3">
              <Input placeholder={t('debt.name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select value={form.type} onValueChange={(v: 'debt' | 'credit') => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debt">Je dois (Dette)</SelectItem>
                  <SelectItem value="credit">On me doit (Créance)</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" step="0.01" min="0" placeholder={t('debt.amount')} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{t('tx.save')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {debts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide">
            {t('debt.iOwe')} ({debts.length})
          </h2>
          {debts.map(renderProfile)}
        </div>
      )}

      {credits.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide">
            {t('debt.owedToMe')} ({credits.length})
          </h2>
          {credits.map(renderProfile)}
        </div>
      )}

      {debtProfiles.length === 0 && (
        <p className="text-muted-foreground text-center py-8">{t('common.noData')}</p>
      )}
    </div>
  );
};
