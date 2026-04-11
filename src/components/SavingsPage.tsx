import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trash2, PiggyBank, Lock } from 'lucide-react';

export const SavingsPage: React.FC = () => {
  const { t } = useI18n();
  const { savingsGoals, addSavingsGoal, addSavingsContribution, deleteSavingsGoal, getSavingsTotal, getSavingsPercent, dkhira, addToDkhira } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target: '' });
  const [contribFor, setContribFor] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('');
  const [dkhiraAmount, setDkhiraAmount] = useState('');
  const [showDkhiraInput, setShowDkhiraInput] = useState(false);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(form.target);
    if (!form.name.trim() || isNaN(target) || target <= 0) return;
    addSavingsGoal({ name: form.name.trim(), target });
    setForm({ name: '', target: '' });
    setShowForm(false);
  };

  const handleContrib = (goalId: string) => {
    const amount = parseFloat(contribAmount);
    if (isNaN(amount) || amount <= 0) return;
    addSavingsContribution(goalId, amount);
    setContribFor(null);
    setContribAmount('');
  };

  const handleDkhira = () => {
    const amount = parseFloat(dkhiraAmount);
    if (isNaN(amount) || amount <= 0) return;
    addToDkhira(amount);
    setDkhiraAmount('');
    setShowDkhiraInput(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('savings.title')}</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> {t('savings.addGoal')}
        </Button>
      </div>

      {/* Dkhira vault */}
      <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <CardContent className="py-4 px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-bold text-foreground">{t('savings.dkhira')}</p>
              <p className="text-xs text-muted-foreground">{t('savings.vault')}</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-accent mb-3">{formatMAD(dkhira)}</p>
          {showDkhiraInput ? (
            <div className="flex gap-2">
              <Input type="number" step="0.01" min="0" placeholder={t('tx.amount')} value={dkhiraAmount} onChange={e => setDkhiraAmount(e.target.value)} className="h-8 text-sm" />
              <Button size="sm" className="h-8" onClick={handleDkhira}>{t('savings.addAmount')}</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowDkhiraInput(true)}>
              <PiggyBank className="w-4 h-4 mr-1" /> {t('savings.hideAmount')}
            </Button>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-primary/20 shadow-lg animate-fade-in">
          <CardContent className="pt-4">
            <form onSubmit={handleAddGoal} className="space-y-3">
              <Input placeholder={t('savings.goalName')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input type="number" step="0.01" min="0" placeholder={t('savings.target')} value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
              <Button type="submit" className="w-full">{t('tx.save')}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {savingsGoals.map((g, i) => {
        const total = getSavingsTotal(g);
        const pct = getSavingsPercent(g);
        return (
          <Card key={g.id} className="animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{formatMAD(total)} / {formatMAD(g.target)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{pct.toFixed(0)}%</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSavingsGoal(g.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <Progress value={pct} className="h-2 mb-2" />
              {contribFor === g.id ? (
                <div className="flex gap-2 mt-2">
                  <Input type="number" step="0.01" min="0" placeholder={t('tx.amount')} value={contribAmount} onChange={e => setContribAmount(e.target.value)} className="h-8 text-sm" />
                  <Button size="sm" className="h-8" onClick={() => handleContrib(g.id)}>{t('savings.addAmount')}</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setContribFor(g.id); setContribAmount(''); }}>
                  <Plus className="w-3 h-3 mr-1" /> {t('savings.addAmount')}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {savingsGoals.length === 0 && (
        <p className="text-muted-foreground text-center py-8">{t('common.noData')}</p>
      )}
    </div>
  );
};
