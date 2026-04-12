import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trash2, PiggyBank, Lock } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell,
  PieChart, Pie,
} from 'recharts';

export const SavingsPage: React.FC = () => {
  const { t } = useI18n();
  const {
    savingsGoals, addSavingsGoal, addSavingsContribution, deleteSavingsGoal,
    getSavingsTotal, getSavingsPercent, dkhira, addToDkhira,
  } = useStore();
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

  const chartData = savingsGoals.map(g => {
    const saved = getSavingsTotal(g);
    const remaining = Math.max(0, g.target - saved);
    const pct = getSavingsPercent(g);
    return { name: g.name, saved, remaining, target: g.target, pct };
  });

  const totalSaved = chartData.reduce((s, d) => s + d.saved, 0);
  const totalTarget = chartData.reduce((s, d) => s + d.target, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const totalPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const pieTotalData = totalTarget > 0
    ? [{ name: t('savings.savedLabel'), value: totalSaved }, { name: t('savings.restLabel'), value: totalRemaining }]
    : [];

  const BAR_SAVED_COLOR = '#22c55e';
  const BAR_REMAIN_COLOR = '#3b82f6';
  const PIE_COLORS = ['#3b82f6', '#f97316'];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('savings.title')}</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> {t('savings.addGoal')}
        </Button>
      </div>

      {/* Summary table */}
      {savingsGoals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('savings.summary')}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-2 py-2 font-semibold">{t('savings.projectName')}</th>
                  <th className="text-right px-2 py-2 font-semibold text-blue-600">{t('dash.colAmount')}</th>
                  <th className="text-right px-2 py-2 font-semibold text-yellow-600">{t('savings.savedAmount')}</th>
                  <th className="text-right px-2 py-2 font-semibold">{t('savings.toSave')}</th>
                  <th className="text-right px-2 py-2 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d, i) => (
                  <tr key={d.name} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                    <td className="px-2 py-1.5 font-medium">{d.name}</td>
                    <td className="px-2 py-1.5 text-right text-blue-600 font-semibold">{formatMAD(d.target)}</td>
                    <td className="px-2 py-1.5 text-right text-yellow-600 font-semibold">{formatMAD(d.saved)}</td>
                    <td className="px-2 py-1.5 text-right">{formatMAD(d.remaining)}</td>
                    <td className="px-2 py-1.5 text-right">{Math.round(d.pct)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="px-2 py-2">{t('common.total')}</td>
                  <td className="px-2 py-2 text-right text-blue-600">{formatMAD(totalTarget)}</td>
                  <td className="px-2 py-2 text-right text-yellow-600">{formatMAD(totalSaved)}</td>
                  <td className="px-2 py-2 text-right">{formatMAD(totalRemaining)}</td>
                  <td className="px-2 py-2 text-right">{totalPct}%</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {savingsGoals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('savings.savedVsRest')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v: number) => formatMAD(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="saved" name={t('savings.savedLabel')} fill={BAR_SAVED_COLOR} stackId="a" />
                  <Bar dataKey="remaining" name={t('savings.restLabel')} fill={BAR_REMAIN_COLOR} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {pieTotalData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('savings.globalProgress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieTotalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${formatMAD(value)}; ${totalTarget > 0 ? Math.round((value / totalTarget) * 100) : 0}%`}
                      labelLine={true}
                    >
                      {pieTotalData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatMAD(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add goal form */}
      {showForm && (
        <Card className="border-primary/20 shadow-lg animate-fade-in">
          <CardContent className="pt-4">
            <form onSubmit={handleAddGoal} className="space-y-3">
              <Input placeholder={t('savings.goalName')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input type="number" step="0.01" min="0" placeholder={t('savings.target')} value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{t('tx.save')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Individual goal cards */}
      {savingsGoals.map((g, i) => {
        const total = getSavingsTotal(g);
        const pct = getSavingsPercent(g);
        const remaining = Math.max(0, g.target - total);
        return (
          <Card key={g.id} className="animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{g.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('savings.savedOf')} {formatMAD(total)} / {formatMAD(g.target)}
                    </p>
                    <p className="text-xs text-orange-500">{t('savings.restOf')} {formatMAD(remaining)}</p>
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
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setContribFor(null)}>✕</Button>
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
              <Button size="sm" variant="outline" className="h-8" onClick={() => setShowDkhiraInput(false)}>✕</Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowDkhiraInput(true)}>
              <PiggyBank className="w-4 h-4 mr-1" /> {t('savings.addToDkhira')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
