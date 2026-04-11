import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { StoreProvider } from '@/lib/store-context';
import { I18nProvider } from '@/lib/i18n';
import { DashboardPage } from '@/components/DashboardPage';
import { TransactionsPage } from '@/components/TransactionsPage';
import { DebtsPage } from '@/components/DebtsPage';
import { SavingsPage } from '@/components/SavingsPage';
import { SettingsPage } from '@/components/SettingsPage';
import { LayoutDashboard, ArrowLeftRight, Users, Target, Settings } from 'lucide-react';

type Tab = 'dashboard' | 'transactions' | 'debts' | 'savings' | 'settings';

const AppContent: React.FC = () => {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { t } = useI18n();

  const tabs: { key: Tab; icon: React.ElementType; labelKey: string }[] = [
    { key: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { key: 'transactions', icon: ArrowLeftRight, labelKey: 'nav.transactions' },
    { key: 'debts', icon: Users, labelKey: 'nav.debts' },
    { key: 'savings', icon: Target, labelKey: 'nav.savings' },
    { key: 'settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">م</span>
          </div>
          <h1 className="font-bold text-lg text-foreground">Mizaniyti</h1>
        </div>
        <p className="text-xs text-muted-foreground">{t('dash.monthlySummary')}</p>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
        {tab === 'dashboard' && <DashboardPage />}
        {tab === 'transactions' && <TransactionsPage />}
        {tab === 'debts' && <DebtsPage />}
        {tab === 'savings' && <SavingsPage />}
        {tab === 'settings' && <SettingsPage />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t px-2 py-1 z-10">
        <div className="max-w-2xl mx-auto flex justify-around">
          {tabs.map(({ key, icon: Icon, labelKey }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                tab === key
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{t(labelKey)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const Index = () => (
  <I18nProvider>
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  </I18nProvider>
);

export default Index;
