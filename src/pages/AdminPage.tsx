import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserProfile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye, LogOut, Users, Clock, Crown } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  none: 'bg-gray-100 text-gray-600',
};

const AdminPage: React.FC = () => {
  const { signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const activate = async (userId: string, plan: 'monthly' | 'yearly') => {
    setActionLoading(userId + '_activate');
    const now = new Date();
    const end = new Date(now);
    if (plan === 'monthly') end.setMonth(end.getMonth() + 1);
    else end.setFullYear(end.getFullYear() + 1);

    await supabase.from('user_profiles').update({
      subscription_status: 'active',
      subscription_start: now.toISOString(),
      subscription_end: end.toISOString(),
    }).eq('id', userId);

    await fetchUsers();
    setActionLoading(null);
  };

  const reject = async (userId: string) => {
    setActionLoading(userId + '_reject');
    await supabase.from('user_profiles').update({
      subscription_status: 'none',
      payment_receipt_url: null,
      payment_submitted_at: null,
    }).eq('id', userId);
    await fetchUsers();
    setActionLoading(null);
  };

  const deactivate = async (userId: string) => {
    setActionLoading(userId + '_deactivate');
    await supabase.from('user_profiles').update({
      subscription_status: 'expired',
      subscription_end: new Date().toISOString(),
    }).eq('id', userId);
    await fetchUsers();
    setActionLoading(null);
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.subscription_status === 'active').length,
    pending: users.filter(u => u.subscription_status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" /> Panel Admin
            </h1>
            <p className="text-sm text-muted-foreground">Gestion des abonnements Mizaniyti</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Déconnexion
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-4 text-center">
              <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Utilisateurs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Clock className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending first */}
        {stats.pending > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
              En attente de validation ({stats.pending})
            </h2>
            {users.filter(u => u.subscription_status === 'pending').map(u => (
              <UserCard
                key={u.id}
                user={u}
                onActivate={activate}
                onReject={reject}
                onDeactivate={deactivate}
                onPreview={setPreviewUrl}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* All users */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Tous les utilisateurs
          </h2>
          {users.map(u => (
            <UserCard
              key={u.id}
              user={u}
              onActivate={activate}
              onReject={reject}
              onDeactivate={deactivate}
              onPreview={setPreviewUrl}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      </div>

      {/* Receipt preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <Button size="sm" variant="secondary" onClick={() => setPreviewUrl(null)}>Fermer</Button>
            </div>
            {previewUrl.toLowerCase().includes('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-96 rounded-lg" />
            ) : (
              <img src={previewUrl} alt="Reçu" className="w-full rounded-lg max-h-[80vh] object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UserCard: React.FC<{
  user: UserProfile;
  onActivate: (id: string, plan: 'monthly' | 'yearly') => void;
  onReject: (id: string) => void;
  onDeactivate: (id: string) => void;
  onPreview: (url: string) => void;
  actionLoading: string | null;
}> = ({ user, onActivate, onReject, onDeactivate, onPreview, actionLoading }) => {
  const statusLabel: Record<string, string> = {
    active: 'Actif',
    pending: 'En attente',
    expired: 'Expiré',
    none: 'Aucun',
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="font-medium truncate">{user.full_name || 'Sans nom'}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {user.phone_number && (
              <a
                href={`https://wa.me/${user.phone_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline"
              >
                WhatsApp: {user.phone_number}
              </a>
            )}
            {user.subscription_end && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Expire : {new Date(user.subscription_end).toLocaleDateString('fr-MA')}
              </p>
            )}
            {user.payment_submitted_at && (
              <p className="text-xs text-muted-foreground">
                Reçu soumis : {new Date(user.payment_submitted_at).toLocaleDateString('fr-MA')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[user.subscription_status]}`}>
              {statusLabel[user.subscription_status]}
              {user.subscription_plan && ` · ${user.subscription_plan === 'monthly' ? 'Mensuel' : 'Annuel'}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {user.payment_receipt_url && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreview(user.payment_receipt_url!)}
              className="h-8 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" /> Voir reçu
            </Button>
          )}

          {user.subscription_status === 'pending' && (
            <>
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700"
                disabled={actionLoading === user.id + '_activate'}
                onClick={() => onActivate(user.id, user.subscription_plan || 'monthly')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {actionLoading === user.id + '_activate' ? '...' : 'Activer'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs"
                disabled={actionLoading === user.id + '_reject'}
                onClick={() => onReject(user.id)}
              >
                <XCircle className="w-3 h-3 mr-1" />
                {actionLoading === user.id + '_reject' ? '...' : 'Rejeter'}
              </Button>
            </>
          )}

          {user.subscription_status === 'active' && (
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
              disabled={actionLoading === user.id + '_deactivate'}
              onClick={() => onDeactivate(user.id)}
            >
              {actionLoading === user.id + '_deactivate' ? '...' : 'Désactiver'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPage;
