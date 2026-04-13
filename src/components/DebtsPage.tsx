import React, { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { formatMAD } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, UserMinus, UserPlus, Trash2, CircleDollarSign, Store, RotateCcw } from 'lucide-react';

// ─── KRIDI TAB ──────────────────────────────────────────────────────────────

const KridiTab: React.FC = () => {
  const { t, lang } = useI18n();
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
                <p className="text-xs text-muted-foreground">{t('debt.total')}{formatMAD(p.totalAmount)}</p>
                <p className="text-xs text-muted-foreground">{t('debt.paid')}{formatMAD(paid)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isSettled ? (
                <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">{t('debt.settled')}</span>
              ) : (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t('debt.reste')}</p>
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
    <div className="space-y-4">
      {/* Description */}
      <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
        <Store className="w-5 h-5 text-orange-500 shrink-0" />
        <p className="text-xs text-muted-foreground">
          {lang === 'darija'
            ? 'الكريدي: سجل ما خذيت بالكريدي من الحانوت أو ما دينك للناس'
            : 'Kridi : enregistrez vos petites dettes chez le hanout ou auprès de proches'
          }
        </p>
      </div>

      <Button onClick={() => setShowForm(!showForm)} size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-1" />
        {lang === 'darija' ? 'زيد كريدي جديد' : 'Nouveau Kridi'}
      </Button>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <UserMinus className="w-4 h-4 text-destructive" />
              </div>
              <p className="font-bold text-destructive text-sm">{t('dash.debts')}</p>
            </div>
            {debts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('debt.noDebts')}</p>
            ) : (
              <div className="space-y-1">
                {debts.map(p => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate mr-2">{p.name}</span>
                    <span className="font-medium text-destructive shrink-0">{formatMAD(getDebtRemaining(p))}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t border-destructive/30 pt-1 mt-1">
                  <span>{t('common.total')}</span>
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
              <p className="font-bold text-green-700 text-sm">{t('dash.credits')}</p>
            </div>
            {credits.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('debt.noCredits')}</p>
            ) : (
              <div className="space-y-1">
                {credits.map(p => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate mr-2">{p.name}</span>
                    <span className="font-medium text-green-600 shrink-0">{formatMAD(getDebtRemaining(p))}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t border-green-500/30 pt-1 mt-1">
                  <span>{t('common.total')}</span>
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
                  <SelectItem value="debt">{t('debt.iOweType')}</SelectItem>
                  <SelectItem value="credit">{t('debt.owedToMeType')}</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" step="0.01" min="0" placeholder={t('debt.amount')} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{t('tx.save')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
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

// ─── DARET TAB ──────────────────────────────────────────────────────────────

interface DaretGroup {
  id: string;
  name: string;
  members: string[];
  monthlyAmount: number;
  totalRounds: number;
  currentRound: number;
  myTurn: number; // which round is my payout
  startDate: string;
}

const DARET_KEY = 'mz_daret_groups';

function loadDaret(): DaretGroup[] {
  try {
    return JSON.parse(localStorage.getItem(DARET_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDaret(groups: DaretGroup[]) {
  localStorage.setItem(DARET_KEY, JSON.stringify(groups));
}

const DaretTab: React.FC = () => {
  const { lang } = useI18n();
  const [groups, setGroups] = useState<DaretGroup[]>(loadDaret);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    members: '',
    monthlyAmount: '',
    totalRounds: '',
    myTurn: '',
    startDate: new Date().toISOString().slice(0, 7),
  });

  const updateGroups = (next: DaretGroup[]) => {
    setGroups(next);
    saveDaret(next);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyAmount = parseFloat(form.monthlyAmount);
    const totalRounds = parseInt(form.totalRounds);
    const myTurn = parseInt(form.myTurn);
    if (!form.name.trim() || isNaN(monthlyAmount) || isNaN(totalRounds) || isNaN(myTurn)) return;
    const members = form.members ? form.members.split(',').map(s => s.trim()).filter(Boolean) : [];
    const newGroup: DaretGroup = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      members,
      monthlyAmount,
      totalRounds,
      currentRound: 1,
      myTurn,
      startDate: form.startDate,
    };
    updateGroups([...groups, newGroup]);
    setForm({ name: '', members: '', monthlyAmount: '', totalRounds: '', myTurn: '', startDate: new Date().toISOString().slice(0, 7) });
    setShowForm(false);
  };

  const advanceRound = (id: string) => {
    updateGroups(groups.map(g => g.id === id && g.currentRound < g.totalRounds
      ? { ...g, currentRound: g.currentRound + 1 }
      : g
    ));
  };

  const deleteGroup = (id: string) => {
    updateGroups(groups.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <RotateCcw className="w-5 h-5 text-blue-500 shrink-0" />
        <p className="text-xs text-muted-foreground">
          {lang === 'darija'
            ? 'الداريت: تتبع دور الداريت ديالك — شكون خد وامتى غادي تخد'
            : 'Daret : suivez votre tontine — qui a reçu et quand c\'est votre tour'
          }
        </p>
      </div>

      <Button onClick={() => setShowForm(!showForm)} size="sm" className="w-full">
        <Plus className="w-4 h-4 mr-1" />
        {lang === 'darija' ? 'داريت جديدة' : 'Nouvelle Daret'}
      </Button>

      {showForm && (
        <Card className="border-primary/20 shadow-lg animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {lang === 'darija' ? 'إنشاء داريت' : 'Créer une Daret'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <Input
                placeholder={lang === 'darija' ? 'إسم الداريت' : 'Nom de la Daret'}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder={lang === 'darija' ? 'أعضاء (مفصولين بفاصلة)' : 'Membres (séparés par virgule)'}
                value={form.members}
                onChange={e => setForm({ ...form, members: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number" min="0" step="0.01"
                  placeholder={lang === 'darija' ? 'المبلغ/شهر (DH)' : 'Montant/mois (DH)'}
                  value={form.monthlyAmount}
                  onChange={e => setForm({ ...form, monthlyAmount: e.target.value })}
                />
                <Input
                  type="number" min="1"
                  placeholder={lang === 'darija' ? 'عدد الأدوار' : 'Nb. de tours'}
                  value={form.totalRounds}
                  onChange={e => setForm({ ...form, totalRounds: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number" min="1"
                  placeholder={lang === 'darija' ? 'دوري رقم' : 'Mon tour (n°)'}
                  value={form.myTurn}
                  onChange={e => setForm({ ...form, myTurn: e.target.value })}
                />
                <Input
                  type="month"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {lang === 'darija' ? 'حفظ' : 'Enregistrer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {lang === 'darija' ? 'إلغاء' : 'Annuler'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {lang === 'darija' ? 'ما كاين شي داريت' : 'Aucune Daret enregistrée'}
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map(g => {
            const pct = (g.currentRound / g.totalRounds) * 100;
            const totalPot = g.monthlyAmount * g.totalRounds;
            const isPaid = g.currentRound >= g.myTurn;
            const roundsUntilMyTurn = Math.max(0, g.myTurn - g.currentRound);

            return (
              <Card key={g.id} className="border-l-4 border-l-blue-500 animate-slide-in">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <RotateCcw className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.monthlyAmount.toLocaleString()} DH × {g.totalRounds} {lang === 'darija' ? 'دور' : 'tours'} = {totalPot.toLocaleString()} DH
                        </p>
                        {g.members.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {g.members.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteGroup(g.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{lang === 'darija' ? 'الدور' : 'Tour'} {g.currentRound}/{g.totalRounds}</span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className="h-2 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>

                    {/* My turn marker */}
                    <div className="relative mt-1 h-2">
                      <div
                        className="absolute top-0 w-0.5 h-3 bg-orange-500"
                        style={{ left: `${((g.myTurn - 1) / g.totalRounds) * 100}%` }}
                        title={lang === 'darija' ? 'دوري' : 'Mon tour'}
                      />
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {isPaid ? (
                      <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium">
                        {lang === 'darija' ? '✓ خدت الداريت' : '✓ Reçu au tour ' + g.myTurn}
                      </span>
                    ) : (
                      <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                        {lang === 'darija'
                          ? `دوري رقم ${g.myTurn} — باقي ${roundsUntilMyTurn} دور`
                          : `Mon tour n°${g.myTurn} — encore ${roundsUntilMyTurn} tour(s)`
                        }
                      </span>
                    )}
                    <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      {lang === 'darija' ? 'الكاسة' : 'Pot'}: {formatMAD(totalPot)}
                    </span>
                  </div>

                  {g.currentRound < g.totalRounds && (
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => advanceRound(g.id)}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {lang === 'darija' ? 'الدور الجاي' : 'Tour suivant'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export const DebtsPage: React.FC = () => {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'kridi' | 'daret'>('kridi');

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">
        {lang === 'darija' ? 'الكريدي و الداريت' : 'Kridi & Daret'}
      </h1>

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => setActiveTab('kridi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'kridi'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <Store className="w-4 h-4" />
          {lang === 'darija' ? 'الكريدي' : 'Kridi'}
        </button>
        <button
          onClick={() => setActiveTab('daret')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'daret'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          {lang === 'darija' ? 'الداريت' : 'Daret'}
        </button>
      </div>

      {activeTab === 'kridi' ? <KridiTab /> : <DaretTab />}
    </div>
  );
};
