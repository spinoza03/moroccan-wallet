import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { trackEvent } from '@/lib/pixel';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Copy, Upload, Crown, Calendar, Zap, ShieldCheck, Flame, Users } from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { Language } from '@/lib/i18n';

const YEARLY_SLOTS = 10;

const WaSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6 shrink-0' }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const BANK_INFO = {
  titulaire: 'ILYAS ALLALI',
  rib: '230 400 5524413211017800 77',
  iban: 'MA64 2304 0055 2441 3211 0178 0077',
  swift: 'CIHMMAMC',
};

const SubscriptionPage: React.FC = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [yearlyTaken, setYearlyTaken] = useState<number>(7);

  useEffect(() => {
    supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_plan', 'yearly')
      .in('subscription_status', ['active', 'pending'])
      .then(({ count }) => {
        if (count !== null) setYearlyTaken(Math.min(count, YEARLY_SLOTS));
      });
  }, []);

  const spotsLeft = Math.max(YEARLY_SLOTS - yearlyTaken, 0);
  const fillPct = Math.round((yearlyTaken / YEARLY_SLOTS) * 100);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReceiptUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile || !selectedPlan || !user) return;
    setUploading(true);

    const fileExt = receiptFile.name.split('.').pop();
    const filePath = `receipts/${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(filePath, receiptFile);

    if (uploadError) {
      alert(t('sub.uploadError'));
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(filePath);

    await supabase.from('user_profiles').update({
      subscription_status: 'pending',
      subscription_plan: selectedPlan,
      payment_receipt_url: publicUrl,
      payment_submitted_at: new Date().toISOString(),
    }).eq('id', user.id);

    await refreshProfile();
    trackEvent('Lead', { value: selectedPlan === 'monthly' ? 20 : 100, currency: 'MAD' });
    setSubmitted(true);
    setUploading(false);
  };

  const bankFieldLabel = (key: string) => {
    if (key === 'titulaire') return t('sub.bankHolder');
    return key.toUpperCase();
  };

  if (profile?.subscription_status === 'pending' || submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold">{t('sub.thankYouTitle')}</h2>
          <p className="text-muted-foreground">{t('sub.thankYouDesc')}</p>
          <Button variant="outline" onClick={signOut}>{t('sub.signOut')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-2">
          <Logo size="lg" className="mx-auto mb-2" />
          <p className="text-muted-foreground text-sm mt-1">{t('sub.tagline')}</p>
        </div>

        {/* Language switcher */}
        <div className="flex justify-center">
          <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="darija">الدارجة المغربية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scarcity alert banner */}
        {spotsLeft <= 3 ? (
          <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-xl px-4 py-2.5 animate-pulse">
            <Flame className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-red-700 text-xs font-semibold">
              Dernière chance ! Il ne reste que <strong>{spotsLeft} place{spotsLeft !== 1 ? 's' : ''}</strong> au tarif lancement.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-orange-700 text-xs font-medium">
              Offre de lancement · <strong>{spotsLeft} places restantes</strong> sur {YEARLY_SLOTS} au prix réduit
            </p>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-2 gap-3">
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`rounded-xl border-2 p-4 text-left transition-all ${
              selectedPlan === 'monthly' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="font-bold text-lg">20 DH</p>
            <p className="text-sm text-muted-foreground">{t('sub.monthly')}</p>
          </button>

          {/* Yearly — scarcity card */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`rounded-xl border-2 p-3 text-left transition-all relative overflow-hidden ${
              selectedPlan === 'yearly'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                : 'border-orange-400 hover:border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
            }`}
          >
            {/* OFFRE LIMITÉE ribbon */}
            <div className="absolute -top-0 -right-0">
              <div className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                LIMITÉ
              </div>
            </div>

            <Crown className="w-5 h-5 text-yellow-500 mb-1" />

            {/* Price with strikethrough */}
            <div className="flex items-baseline gap-1.5">
              <p className="font-bold text-lg text-orange-700 dark:text-orange-400">99 DH</p>
              <p className="text-xs text-muted-foreground line-through">199 DH</p>
            </div>
            <p className="text-xs text-muted-foreground">{t('sub.yearly')}</p>

            {/* Spots progress */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-orange-600 font-medium flex items-center gap-0.5">
                  <Users className="w-3 h-3" /> {yearlyTaken}/{YEARLY_SLOTS} pris
                </span>
                <span className="text-[10px] text-red-600 font-bold">{spotsLeft} restant{spotsLeft !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-full bg-orange-100 dark:bg-orange-900/40 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Extra urgency note under yearly */}
        <p className="text-center text-xs text-muted-foreground -mt-3">
          🔥 Prix spécial lancement — après les {YEARLY_SLOTS} premiers clients, le tarif annuel reviendra à <strong>199 DH</strong>
        </p>

        {/* Features */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> {t('sub.included')}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(['sub.f1', 'sub.f2', 'sub.f3', 'sub.f4', 'sub.f5', 'sub.f6'] as const).map((key) => (
                <li key={key} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Guarantee trust banner */}
        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
          <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-400 text-sm">{t('sub.guarantee')}</p>
            <p className="text-green-700 dark:text-green-500 text-xs mt-0.5">{t('sub.guaranteeDesc')}</p>
          </div>
        </div>

        {/* WhatsApp support */}
        <a
          href="https://wa.me/212608301414"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl px-4 py-3 hover:bg-[#25D366]/20 transition-colors text-[#25D366]"
        >
          <WaSvg />
          <div>
            <p className="font-semibold text-sm text-foreground">{t('sub.support')}</p>
            <p className="text-muted-foreground text-xs">{t('sub.supportDesc')} · +212 608-301414</p>
          </div>
        </a>

        {/* Bank info */}
        {selectedPlan && (
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('sub.bankTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('sub.bankDesc')}{' '}
                <strong>{selectedPlan === 'monthly' ? '20 DH' : '99 DH'}</strong>{' '}
                {t('sub.bankDescOn')}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(BANK_INFO).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{bankFieldLabel(key)}</p>
                    <p className="text-sm font-mono font-medium">{value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value, key)}
                    className="text-primary hover:text-primary/80 p-1"
                  >
                    {copied === key ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* WhatsApp pay option */}
        {selectedPlan && (
          <a
            href={`https://wa.me/212608301414?text=${encodeURIComponent(
              `Bonjour, je souhaite m'abonner au plan ${selectedPlan === 'monthly' ? 'mensuel (20 DH)' : 'annuel (99 DH)'} de Mizaniyti. Pouvez-vous m'aider pour le paiement ?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] text-white rounded-xl px-4 py-4 hover:bg-[#1da851] transition-colors shadow-sm"
          >
            <WaSvg className="w-6 h-6 shrink-0 text-white" />
            <div>
              <p className="font-bold text-sm">Payer via WhatsApp</p>
              <p className="text-white/80 text-xs">Contactez-nous pour finaliser votre paiement · +212 608-301414</p>
            </div>
          </a>
        )}

        {/* Receipt upload */}
        {selectedPlan && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('sub.uploadTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('sub.uploadDesc')}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceiptUpload} className="space-y-3">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">
                    {receiptFile ? receiptFile.name : t('sub.chooseFile')}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">{t('sub.fileTypes')}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                    required
                  />
                </label>
                <Button type="submit" className="w-full" disabled={!receiptFile || uploading}>
                  {uploading ? t('sub.sending') : t('sub.send')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center pb-6">
          <button onClick={signOut} className="text-sm text-muted-foreground hover:underline">
            {t('sub.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
