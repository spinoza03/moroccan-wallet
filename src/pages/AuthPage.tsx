import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { initPixel } from '@/lib/pixel';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/Logo';
import type { Language } from '@/lib/i18n';

type Mode = 'login' | 'register';

const AuthPage: React.FC = () => {
  useEffect(() => { initPixel(); }, []);
  const { signIn, signUp } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', phone: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register') {
      if (!form.fullName.trim()) { setError(t('auth.err.nameRequired')); return; }
      if (!form.phone.trim()) { setError(t('auth.err.phoneRequired')); return; }
      if (form.password !== form.confirm) { setError(t('auth.err.passwordMismatch')); return; }
      if (form.password.length < 6) { setError(t('auth.err.passwordShort')); return; }
    }

    setLoading(true);
    if (mode === 'login') {
      const { error: err } = await signIn(form.email, form.password);
      if (err) setError(err);
    } else {
      const { error: err } = await signUp(form.email, form.password, form.fullName, form.phone);
      if (err) setError(err);
      else setSuccess(t('auth.successMsg'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" className="mb-2" />
          <p className="text-sm text-muted-foreground mt-1">{t('auth.tagline')}</p>
        </div>

        {/* Language switcher */}
        <div className="flex justify-center mb-4">
          <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="darija">الدارجة المغربية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">
              {mode === 'login' ? t('auth.login') : t('auth.register')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>
                <Button className="w-full" onClick={() => { setMode('login'); setSuccess(''); }}>
                  {t('auth.submit.login')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <>
                    <Input
                      placeholder={t('auth.fullName')}
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                    <Input
                      type="tel"
                      placeholder={t('auth.whatsapp')}
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </>
                )}
                <Input
                  type="email"
                  placeholder={t('auth.email')}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  type="password"
                  placeholder={t('auth.password')}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                {mode === 'register' && (
                  <Input
                    type="password"
                    placeholder={t('auth.confirmPassword')}
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                )}
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.loading') : mode === 'login' ? t('auth.submit.login') : t('auth.submit.register')}
                </Button>
              </form>
            )}

            {!success && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  className="text-sm text-primary hover:underline"
                >
                  {mode === 'login' ? t('auth.toRegister') : t('auth.toLogin')}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
