import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Mode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
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
      if (!form.fullName.trim()) { setError('Veuillez entrer votre nom complet.'); return; }
      if (!form.phone.trim()) { setError('Veuillez entrer votre numéro WhatsApp.'); return; }
      if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
      if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    }

    setLoading(true);
    if (mode === 'login') {
      const { error: err } = await signIn(form.email, form.password);
      if (err) setError(err);
    } else {
      const { error: err } = await signUp(form.email, form.password, form.fullName, form.phone);
      if (err) setError(err);
      else setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre compte, puis connectez-vous.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <span className="text-primary-foreground font-bold text-3xl">م</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mizaniyti</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos finances personnelles</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>
                <Button className="w-full" onClick={() => { setMode('login'); setSuccess(''); }}>
                  Se connecter
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <>
                    <Input
                      placeholder="Nom complet"
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Numéro WhatsApp (ex: 0612345678)"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </>
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                {mode === 'register' && (
                  <Input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    required
                  />
                )}
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
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
                  {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
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
