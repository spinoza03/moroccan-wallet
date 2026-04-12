import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { StoreProvider } from '@/lib/store-context';
import { useAuth } from '@/lib/auth-context';
import { DashboardPage } from '@/components/DashboardPage';
import { TransactionsPage } from '@/components/TransactionsPage';
import { DebtsPage } from '@/components/DebtsPage';
import { SavingsPage } from '@/components/SavingsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { Logo } from '@/components/Logo';
import { TutorialPopup, type TutorialKey } from '@/components/TutorialPopup';
import { LayoutDashboard, ArrowLeftRight, Users, Target, Settings, LogOut, HelpCircle } from 'lucide-react';

type Tab = 'dashboard' | 'transactions' | 'debts' | 'savings' | 'settings';

const AppContent: React.FC = () => {
  const [tab, setTab] = useState<Tab>(() => {
    return (localStorage.getItem('mz_tab') as Tab) || 'dashboard';
  });

  const handleSetTab = (t: Tab) => {
    localStorage.setItem('mz_tab', t);
    setTab(t);
  };
  const [showTutorial, setShowTutorial] = useState(false);
  const { t, lang } = useI18n();
  const { signOut, profile } = useAuth();

  const tabs: { key: Tab; icon: React.ElementType; labelKey: string }[] = [
    { key: 'dashboard',    icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { key: 'transactions', icon: ArrowLeftRight,  labelKey: 'nav.transactions' },
    { key: 'debts',        icon: Users,           labelKey: 'nav.debts' },
    { key: 'savings',      icon: Target,          labelKey: 'nav.savings' },
    { key: 'settings',     icon: Settings,        labelKey: 'nav.settings' },
  ];

  const helpLabel = lang === 'darija' ? 'كيفاش كيخدم' : 'Comment utiliser';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 py-2 flex items-center justify-between sticky top-0 z-10">
        <Logo size="sm" className="h-9" />
        <div className="flex items-center gap-2">
          {profile?.full_name && (
            <span className="text-xs text-muted-foreground hidden sm:block">{profile.full_name}</span>
          )}
          <button
            onClick={() => setShowTutorial(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors flex items-center gap-1"
            title={helpLabel}
          >
            <HelpCircle className="w-4 h-4 text-primary" />
          </button>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title={lang === 'darija' ? 'خروج' : 'Se déconnecter'}
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
        {tab === 'dashboard'    && <DashboardPage />}
        {tab === 'transactions' && <TransactionsPage />}
        {tab === 'debts'        && <DebtsPage />}
        {tab === 'savings'      && <SavingsPage />}
        {tab === 'settings'     && <SettingsPage />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t px-2 py-1 z-10">
        <div className="max-w-2xl mx-auto flex justify-around">
          {tabs.map(({ key, icon: Icon, labelKey }) => (
            <button
              key={key}
              onClick={() => handleSetTab(key)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                tab === key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tutorial popup */}
      {showTutorial && (
        <TutorialPopup
          tutorialKey={tab as TutorialKey}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
};

const Index = () => (
  <StoreProvider>
    <AppContent />
  </StoreProvider>
);

export default Index;
