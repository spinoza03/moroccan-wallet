import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, ArrowLeftRight, Users, Target, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TutorialKey = 'dashboard' | 'transactions' | 'debts' | 'savings' | 'settings';

interface Step {
  icon: React.ReactNode;
  title: { fr: string; darija: string };
  desc: { fr: string; darija: string };
  animation: React.ReactNode;
}

const tutorials: Record<TutorialKey, Step[]> = {
  dashboard: [
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: { fr: 'Tableau de Bord', darija: 'لوحة التحكم' },
      desc: {
        fr: 'Visualisez votre budget mensuel : revenus, dépenses fixes, variables et votre solde restant.',
        darija: 'شوف ميزانيتك ديال الشهر: المداخيل، المصاريف الثابتة والمتغيرة والرصيد الباقي.',
      },
      animation: (
        <div className="flex gap-2 justify-center items-end h-16">
          {[60, 90, 40, 75, 55, 85, 50].map((h, i) => (
            <div
              key={i}
              className="w-5 rounded-t-sm bg-primary/80 animate-grow-bar"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 100}ms`,
                animationFillMode: 'both',
              }}
            />
          ))}
        </div>
      ),
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: { fr: 'Naviguer par mois', darija: 'تنقل بين الشهور' },
      desc: {
        fr: 'Utilisez les flèches ou cliquez sur le mois pour changer de période et voir l\'historique.',
        darija: 'استخدم السهمين أو كليك على الشهر باش تشوف تاريخ الشهور اللي فاتوا.',
      },
      animation: (
        <div className="flex items-center gap-2 justify-center">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center animate-pulse-left">
            <ChevronLeft className="w-4 h-4 text-primary" />
          </div>
          {['Jan', 'Fév', 'Mar'].map((m, i) => (
            <div
              key={m}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${i === 1 ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground'}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {m}
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center animate-pulse-right">
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      ),
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: { fr: 'Dettes & Target', darija: 'الديون والهدف' },
      desc: {
        fr: 'En bas vous trouverez vos dettes, créances et la progression vers vos objectifs d\'épargne.',
        darija: 'فتحت كاينين ديونك، حقوقك والتقدم ديال أهداف التوفير ديالك.',
      },
      animation: (
        <div className="flex gap-4 justify-center items-center">
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center animate-bounce-slow">
              <Users className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-[10px] text-destructive font-medium">-500 DH</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce-slow" style={{ animationDelay: '200ms' }}>
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] text-green-600 font-medium">75%</span>
          </div>
        </div>
      ),
    },
  ],

  transactions: [
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-primary" />,
      title: { fr: 'Ajouter une transaction', darija: 'زيد معاملة' },
      desc: {
        fr: 'Appuyez sur "+ Ajouter Transaction", choisissez le type (revenu / dépense) et le poste.',
        darija: 'كليك على "زيد معاملة"، اختار النوع (دخل أو مصروف) والخانة.',
      },
      animation: (
        <div className="flex flex-col gap-2 items-center">
          <div className="w-32 h-8 rounded-lg bg-primary flex items-center justify-center gap-1 animate-pulse-scale">
            <span className="text-primary-foreground text-xs font-medium">+ زيد معاملة</span>
          </div>
          <div className="flex gap-2 mt-1">
            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-xs text-green-700 animate-fade-in-left">دخل</div>
            <div className="px-3 py-1 rounded-full bg-destructive/20 border border-destructive/50 text-xs text-destructive animate-fade-in-right">مصروف</div>
          </div>
        </div>
      ),
    },
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-primary" />,
      title: { fr: 'Dépense fixe vs variable', darija: 'مصروف ثابت أو متغير' },
      desc: {
        fr: 'Fixe = loyer, factures... Variable = sorties, vêtements... Bien les séparer pour un budget précis.',
        darija: 'الثابت = الكرا، الفاتورات... المتغير = السوارتي، الحوايج... فرق بينهم باش تكون ميزانيتك مضبوطة.',
      },
      animation: (
        <div className="grid grid-cols-2 gap-2 w-full max-w-48">
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-2 text-center animate-slide-in-left">
            <div className="text-[10px] font-bold text-green-700">ثابت</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">الكرا • WIFI</div>
          </div>
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-2 text-center animate-slide-in-right">
            <div className="text-[10px] font-bold text-orange-700">متغير</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">سوارتي • حوايج</div>
          </div>
        </div>
      ),
    },
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-primary" />,
      title: { fr: 'Filtrer & Rechercher', darija: 'فلتر وقلب' },
      desc: {
        fr: 'Utilisez la barre de recherche ou filtrez par type et par mois pour retrouver n\'importe quelle transaction.',
        darija: 'استخدم الـSearch أو فلتر حسب النوع والشهر باش تلقى أي معاملة بسرعة.',
      },
      animation: (
        <div className="flex flex-col gap-2 items-center w-full max-w-52">
          <div className="w-full h-8 rounded-lg bg-muted border border-border flex items-center px-2 gap-2 animate-pulse-scale">
            <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
            <div className="h-2 bg-muted-foreground/30 rounded flex-1 animate-shimmer" />
          </div>
          <div className="flex gap-1">
            {['كلشي', 'دخل', 'مصروف'].map((f, i) => (
              <div key={f} className={`px-2 py-0.5 rounded text-[10px] font-medium ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                style={{ animationDelay: `${i * 100}ms` }}>
                {f}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ],

  debts: [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: { fr: 'Dettes & Créances', darija: 'الديون والحقوق' },
      desc: {
        fr: 'Suivez l\'argent que vous devez (dettes) et celui qu\'on vous doit (créances).',
        darija: 'تتبع الفلوس لي خاصك تعطيها (ديون) والفلوس لي خاصهم يعطيوك إياها (حقوق).',
      },
      animation: (
        <div className="flex gap-4 justify-center">
          <div className="flex flex-col items-center gap-1 animate-slide-in-left">
            <div className="w-12 h-12 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-[10px] font-bold text-destructive">أنا خاصني</span>
            <span className="text-[10px] text-muted-foreground">-1,200 د.م</span>
          </div>
          <div className="flex flex-col items-center gap-1 animate-slide-in-right">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-[10px] font-bold text-green-700">خاصهم ليا</span>
            <span className="text-[10px] text-muted-foreground">+800 د.م</span>
          </div>
        </div>
      ),
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: { fr: 'Ajouter un profil', darija: 'زيد بروفيل' },
      desc: {
        fr: 'Cliquez "+ Ajouter Profil", entrez le nom de la personne, le type et le montant total.',
        darija: 'كليك "+ زيد بروفيل"، دخل سمية الشخص، النوع والمبلغ الكامل.',
      },
      animation: (
        <div className="flex flex-col gap-1.5 items-center w-full max-w-48">
          <div className="w-full h-7 rounded bg-muted animate-shimmer flex items-center px-2">
            <span className="text-[10px] text-muted-foreground">محمد...</span>
          </div>
          <div className="w-full h-7 rounded bg-destructive/10 border border-destructive/30 flex items-center px-2 animate-fade-in">
            <span className="text-[10px] text-destructive">أنا خاصني (دين)</span>
          </div>
          <div className="w-full h-7 rounded bg-muted animate-shimmer flex items-center px-2" style={{ animationDelay: '300ms' }}>
            <span className="text-[10px] text-muted-foreground">500 د.م...</span>
          </div>
        </div>
      ),
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: { fr: 'Enregistrer un paiement', darija: 'سجل خلاص' },
      desc: {
        fr: 'Sur chaque profil, appuyez "Ajouter Paiement" pour enregistrer les remboursements partiels ou totaux.',
        darija: 'فكل بروفيل، كليك "زيد خلاص" باش تسجل الخلاص سواء جزئي أو كامل.',
      },
      animation: (
        <div className="flex flex-col gap-2 items-center">
          <div className="w-40 rounded-lg border border-border p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-medium">محمد</span>
              <span className="text-[10px] text-destructive">-500 د.م</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-progress-bar" style={{ width: '60%' }} />
            </div>
          </div>
          <div className="w-28 h-7 rounded-lg bg-muted border border-border flex items-center justify-center gap-1 animate-bounce-slow">
            <span className="text-[10px] text-foreground">+ زيد خلاص</span>
          </div>
        </div>
      ),
    },
  ],

  savings: [
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: { fr: 'Objectifs d\'Épargne', darija: 'أهداف التوفير' },
      desc: {
        fr: 'Créez des objectifs nommés (voiture, voyage, mariage...) avec un montant cible.',
        darija: 'دير أهداف بأسماء (طوموبيل، سفر، عرس...) مع المبلغ لي بغيتي توفرو.',
      },
      animation: (
        <div className="flex gap-3 justify-center">
          {[
            { name: 'طوموبيل', pct: 65, color: 'bg-blue-500' },
            { name: 'سفر', pct: 30, color: 'bg-green-500' },
            { name: 'عرس', pct: 85, color: 'bg-purple-500' },
          ].map((g, i) => (
            <div key={g.name} className="flex flex-col items-center gap-1" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="w-8 bg-muted rounded-full overflow-hidden h-14 flex flex-col-reverse">
                <div
                  className={`${g.color} rounded-full transition-all animate-grow-up`}
                  style={{ height: `${g.pct}%`, animationDelay: `${i * 150}ms` }}
                />
              </div>
              <span className="text-[9px] font-medium">{g.name}</span>
              <span className="text-[9px] text-muted-foreground">{g.pct}%</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: { fr: 'Alimenter un objectif', darija: 'زيد لهدف' },
      desc: {
        fr: 'Sur chaque objectif, cliquez "+ Ajouter" et entrez le montant que vous épargnez.',
        darija: 'فكل هدف، كليك "+ زيد" ودخل المبلغ لي وفرتيه.',
      },
      animation: (
        <div className="flex flex-col gap-2 items-center">
          <div className="w-44 rounded-lg border border-border p-2">
            <div className="flex items-center gap-1 mb-1.5">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-medium">طوموبيل</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
              <div className="h-full bg-primary rounded-full animate-progress-fill" />
            </div>
            <div className="text-[9px] text-muted-foreground">وفرت: 6,500 / 10,000 د.م</div>
          </div>
          <div className="w-28 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse-scale">
            <span className="text-[10px] text-primary font-medium">+ زيد مبلغ</span>
          </div>
        </div>
      ),
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: { fr: 'La Dkhira (Tirelire)', darija: 'الذخيرة (الكوزينة)' },
      desc: {
        fr: 'La Dkhira est votre tirelire cachée. Ajoutez de petits montants au fil du temps et regardez-les s\'accumuler.',
        darija: 'الذخيرة هي كوزينتك الرقمية. زيد شوية مبالغ صغيرة مع الوقت وشوف كيفاش كتكبر.',
      },
      animation: (
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center animate-pulse-scale">
              <span className="text-2xl">🐷</span>
            </div>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-coin-drop"
                style={{ animationDelay: `${i * 500}ms`, animationFillMode: 'both' }}
              />
            ))}
          </div>
          <div className="text-sm font-bold text-accent animate-count-up">1,250 د.م</div>
        </div>
      ),
    },
  ],

  settings: [
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: { fr: 'Langue', darija: 'اللغة' },
      desc: {
        fr: 'Choisissez entre le Français et la Darija Marocaine. L\'application s\'adapte entièrement.',
        darija: 'اختار بين الفرنساوية والدارجة المغربية. التطبيق كيتبدل كامل.',
      },
      animation: (
        <div className="flex gap-3 justify-center items-center">
          <div className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium animate-pulse-scale">
            الدارجة 🇲🇦
          </div>
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center animate-spin-slow">
            <span className="text-[10px]">↔</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium">
            Français 🇫🇷
          </div>
        </div>
      ),
    },
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: { fr: 'Jour de Salaire', darija: 'نهار الصالير' },
      desc: {
        fr: 'Indiquez le jour où vous recevez votre salaire. Cela permet au tableau de bord de calculer correctement vos périodes.',
        darija: 'حدد النهار لي كتقبض فيه الصالير. هذا كيساعد لوحة التحكم تحسب الفترات مزيان.',
      },
      animation: (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">1</span>
            <div className="flex-1 w-32 h-2 bg-muted rounded-full relative">
              <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow animate-slide-thumb" style={{ left: '45%' }} />
            </div>
            <span className="text-xs text-muted-foreground">31</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <span className="text-lg font-bold text-primary animate-count-day">15</span>
          </div>
        </div>
      ),
    },
  ],
};

interface TutorialPopupProps {
  tutorialKey: TutorialKey;
  onClose: () => void;
}

export const TutorialPopup: React.FC<TutorialPopupProps> = ({ tutorialKey, onClose }) => {
  const { lang } = useI18n();
  const [step, setStep] = useState(0);
  const steps = tutorials[tutorialKey];
  const current = steps[step];
  const isLast = step === steps.length - 1;

  // reset step when tab changes
  useEffect(() => { setStep(0); }, [tutorialKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {current.icon}
            <span className="font-bold text-sm text-foreground">
              {current.title[lang]}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 justify-center mb-3">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`transition-all rounded-full ${i === step ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-muted-foreground/30'}`}
            />
          ))}
        </div>

        {/* Animation area */}
        <div className="mx-4 mb-3 h-28 bg-muted/30 rounded-xl flex items-center justify-center border border-border/50 overflow-hidden">
          <div key={step} className="animate-fade-in w-full flex items-center justify-center px-4">
            {current.animation}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground px-4 pb-4 text-center leading-relaxed">
          {current.desc[lang]}
        </p>

        {/* Navigation */}
        <div className="flex gap-2 px-4 pb-4">
          {step > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setStep(s => s - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {lang === 'darija' ? 'السابق' : 'Précédent'}
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            onClick={() => isLast ? onClose() : setStep(s => s + 1)}
          >
            {isLast
              ? (lang === 'darija' ? 'فهمت!' : 'Compris !')
              : (lang === 'darija' ? 'التالي' : 'Suivant')
            }
            {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
