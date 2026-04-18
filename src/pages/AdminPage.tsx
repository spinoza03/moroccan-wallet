import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, UserProfile } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Eye, LogOut, Users, Clock, Crown, Search, Filter } from 'lucide-react';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  none: 'bg-gray-100 text-gray-600',
  trial: 'bg-blue-100 text-blue-800',
};

const statusLabel: Record<string, string> = {
  active: 'Actif',
  pending: 'En attente',
  expired: 'Expiré',
  none: 'Aucun',
  trial: 'Essai',
};

type FilterStatus = 'all' | 'active' | 'pending' | 'expired' | 'none' | 'trial';
type FilterPlan = 'all' | 'monthly' | 'yearly' | 'trial';
type FilterDays = 0 | 1 | 7 | 30 | 90;

const AdminPage: React.FC = () => {
  const { signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterDays, setFilterDays] = useState<FilterDays>(0);
  const [filterPlan, setFilterPlan] = useState<FilterPlan>('all');
  const [search, setSearch] = useState('');

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
      subscription_plan: plan,
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

  const extendTrial = async (userId: string, currentEnd: string | null) => {
    setActionLoading(userId + '_extend');
    const base = currentEnd ? new Date(currentEnd) : new Date();
    const end = new Date(base.getTime() + 24 * 60 * 60 * 1000);
    await supabase.from('user_profiles').update({
      subscription_status: 'trial',
      subscription_plan: 'trial',
      subscription_end: end.toISOString(),
    }).eq('id', userId);
    await fetchUsers();
    setActionLoading(null);
  };

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.subscription_status === 'active').length,
    pending: users.filter(u => u.subscription_status === 'pending').length,
    expired: users.filter(u => u.subscription_status === 'expired').length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (filterStatus !== 'all' && u.subscription_status !== filterStatus) return false;
      if (filterPlan !== 'all' && u.subscription_plan !== filterPlan) return false;
      if (filterDays > 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - filterDays);
        if (new Date(u.created_at) < cutoff) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.full_name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.phone_number?.includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [users, filterStatus, filterPlan, filterDays, search]);

  const pendingFiltered = filteredUsers.filter(u => u.subscription_status === 'pending');
  const hasActiveFilters = filterStatus !== 'all' || filterDays !== 0 || filterPlan !== 'all' || search.trim() !== '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">

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
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:ring-2 hover:ring-green-400 transition-all"
            onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')}
          >
            <CardContent className="py-3 text-center">
              <CheckCircle2 className="w-4 h-4 mx-auto text-green-500 mb-1" />
              <p className="text-xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all"
            onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
          >
            <CardContent className="py-3 text-center">
              <Clock className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:ring-2 hover:ring-red-400 transition-all"
            onClick={() => setFilterStatus(filterStatus === 'expired' ? 'all' : 'expired')}
          >
            <CardContent className="py-3 text-center">
              <XCircle className="w-4 h-4 mx-auto text-red-400 mb-1" />
              <p className="text-xl font-bold text-red-500">{stats.expired}</p>
              <p className="text-xs text-muted-foreground">Expirés</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-3 space-y-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Filtres</span>
              {hasActiveFilters && (
                <button
                  onClick={() => { setFilterStatus('all'); setFilterDays(0); setFilterPlan('all'); setSearch(''); }}
                  className="ml-auto text-xs text-blue-600 hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher nom, email, téléphone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Status chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground self-center mr-1">Statut :</span>
              {(['all', 'active', 'pending', 'expired', 'none', 'trial'] as FilterStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filterStatus === s
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {s === 'all' ? 'Tous' : statusLabel[s]}
                </button>
              ))}
            </div>

            {/* Plan chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground self-center mr-1">Plan :</span>
              {(['all', 'monthly', 'yearly', 'trial'] as FilterPlan[]).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPlan(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filterPlan === p
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {p === 'all' ? 'Tous' : p === 'monthly' ? 'Mensuel' : p === 'yearly' ? 'Annuel' : 'Essai'}
                </button>
              ))}
            </div>

            {/* Days chips */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground self-center mr-1">Inscription :</span>
              {([0, 1, 7, 30, 90] as FilterDays[]).map(d => (
                <button
                  key={d}
                  onClick={() => setFilterDays(d)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filterDays === d
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {d === 0 ? 'Tout' : d === 1 ? "Aujourd'hui" : `${d} jours`}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} affiché{filteredUsers.length !== 1 ? 's' : ''}
          {hasActiveFilters && ` sur ${users.length}`}
        </p>

        {/* Pending section (only when no status filter or filter=pending) */}
        {pendingFiltered.length > 0 && (filterStatus === 'all' || filterStatus === 'pending') && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
              En attente de validation ({pendingFiltered.length})
            </h2>
            {pendingFiltered.map(u => (
              <UserCard
                key={u.id}
                user={u}
                onActivate={activate}
                onReject={reject}
                onDeactivate={deactivate}
                onExtendTrial={extendTrial}
                onPreview={setPreviewUrl}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* All filtered users */}
        <div className="space-y-3">
          {filterStatus !== 'all' || pendingFiltered.length === 0 ? (
            filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Aucun utilisateur trouvé</p>
            ) : (
              filteredUsers.map(u => (
                <UserCard
                  key={u.id}
                  user={u}
                  onActivate={activate}
                  onReject={reject}
                  onDeactivate={deactivate}
                  onExtendTrial={extendTrial}
                  onPreview={setPreviewUrl}
                  actionLoading={actionLoading}
                />
              ))
            )
          ) : (
            <>
              {filteredUsers.filter(u => u.subscription_status !== 'pending').length > 0 && (
                <>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Autres utilisateurs
                  </h2>
                  {filteredUsers.filter(u => u.subscription_status !== 'pending').map(u => (
                    <UserCard
                      key={u.id}
                      user={u}
                      onActivate={activate}
                      onReject={reject}
                      onDeactivate={deactivate}
                      onExtendTrial={extendTrial}
                      onPreview={setPreviewUrl}
                      actionLoading={actionLoading}
                    />
                  ))}
                </>
              )}
            </>
          )}
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
  onExtendTrial: (id: string, currentEnd: string | null) => void;
  onPreview: (url: string) => void;
  actionLoading: string | null;
}> = ({ user, onActivate, onReject, onDeactivate, onExtendTrial, onPreview, actionLoading }) => {
  const waNumber = user.phone_number
    ? (() => { const d = user.phone_number!.replace(/\D/g, ''); return d.startsWith('0') ? '212' + d.slice(1) : d; })()
    : null;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <p className="font-medium truncate">{user.full_name || 'Sans nom'}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline"
              >
                WhatsApp: {user.phone_number}
              </a>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Inscrit : {new Date(user.created_at).toLocaleDateString('fr-MA')}
            </p>
            {user.subscription_end && (
              <p className="text-xs text-muted-foreground">
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

          {user.subscription_status !== 'active' && (
            <>
              <Button
                size="sm"
                className="h-8 text-xs bg-green-600 hover:bg-green-700"
                disabled={actionLoading === user.id + '_activate'}
                onClick={() => onActivate(user.id, 'monthly')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {actionLoading === user.id + '_activate' ? '...' : 'Activer Mensuel'}
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                disabled={actionLoading === user.id + '_activate'}
                onClick={() => onActivate(user.id, 'yearly')}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {actionLoading === user.id + '_activate' ? '...' : 'Activer Annuel'}
              </Button>
              {user.subscription_status === 'pending' && (
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
              )}
            </>
          )}

          {user.subscription_status === 'trial' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
              disabled={actionLoading === user.id + '_extend'}
              onClick={() => onExtendTrial(user.id, user.subscription_end)}
            >
              <Clock className="w-3 h-3 mr-1" />
              {actionLoading === user.id + '_extend' ? '...' : '+24h Essai'}
            </Button>
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
