import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Copy, Upload, Crown, Calendar, Zap } from 'lucide-react';
import type { Language } from '@/lib/i18n';

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
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-bold text-2xl">م</span>
          </div>
          <h1 className="text-2xl font-bold">Mizaniyti</h1>
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

        {/* Plans */}
        <div className="grid grid-cols-2 gap-3">
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

          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`rounded-xl border-2 p-4 text-left transition-all relative ${
              selectedPlan === 'yearly' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              -59%
            </div>
            <Crown className="w-5 h-5 text-yellow-500 mb-2" />
            <p className="font-bold text-lg">99 DH</p>
            <p className="text-sm text-muted-foreground">{t('sub.yearly')}</p>
          </button>
        </div>

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
