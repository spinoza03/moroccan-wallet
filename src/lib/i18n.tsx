import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'fr' | 'darija';

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.dashboard': { fr: 'Tableau de Bord', darija: 'لوحة التحكم' },
  'nav.transactions': { fr: 'Transactions', darija: 'المعاملات' },
  'nav.debts': { fr: 'Dettes & Créances', darija: 'الديون و الحقوق' },
  'nav.savings': { fr: 'Épargne', darija: 'التوفير' },
  'nav.settings': { fr: 'Paramètres', darija: 'الإعدادات' },

  // Transaction form
  'tx.add': { fr: 'Ajouter Transaction', darija: 'زيد معاملة' },
  'tx.date': { fr: 'Date', darija: 'التاريخ' },
  'tx.type': { fr: 'Type', darija: 'النوع' },
  'tx.income': { fr: 'Revenu', darija: 'دخل' },
  'tx.expense': { fr: 'Dépense', darija: 'مصروف' },
  'tx.category': { fr: 'Catégorie', darija: 'الفئة' },
  'tx.fixed': { fr: 'Fixe', darija: 'ثابت' },
  'tx.variable': { fr: 'Variable', darija: 'متغير' },
  'tx.label': { fr: 'Description', darija: 'الوصف' },
  'tx.amount': { fr: 'Montant (DH)', darija: 'المبلغ (د.م)' },
  'tx.save': { fr: 'Enregistrer', darija: 'حفظ' },
  'tx.recent': { fr: 'Transactions récentes', darija: 'المعاملات الأخيرة' },

  // Moroccan categories
  'cat.loyer': { fr: 'Loyer', darija: 'الكرا' },
  'cat.transport': { fr: 'Transport', darija: 'الطرانسبور' },
  'cat.ma3icha': { fr: "Ma3icha (Vie quotidienne)", darija: 'المعيشة' },
  'cat.pharmacie': { fr: 'Pharmacie', darija: 'الفارماسي' },
  'cat.factures': { fr: 'Factures (Eau/Électricité)', darija: 'الفاتورات' },
  'cat.internet': { fr: 'Internet/Téléphone', darija: 'الأنترنت/التيليفون' },
  'cat.scolarite': { fr: 'Scolarité', darija: 'الدراسة' },
  'cat.vetements': { fr: 'Vêtements', darija: 'الحوايج' },
  'cat.loisirs': { fr: 'Loisirs', darija: 'الترفيه' },
  'cat.salaire': { fr: 'Salaire', darija: 'الصالير' },
  'cat.freelance': { fr: 'Freelance', darija: 'فريلانس' },
  'cat.autre': { fr: 'Autre', darija: 'آخر' },
  'cat.credit': { fr: 'Crédit bancaire', darija: 'القرض البنكي' },
  'cat.assurance': { fr: 'Assurance', darija: 'التأمين' },
  'cat.zakat': { fr: 'Zakat/Sadaqa', darija: 'الزكاة/الصدقة' },
  'cat.epargne': { fr: 'Épargne', darija: 'التوفير' },

  // Dashboard
  'dash.netIncome': { fr: 'Revenu Net', darija: 'الدخل الصافي' },
  'dash.resteAVivre': { fr: 'Reste à Vivre', darija: 'الباقي للمعيشة' },
  'dash.savingsRate': { fr: "Taux d'Épargne", darija: 'نسبة التوفير' },
  'dash.totalIncome': { fr: 'Total Revenus', darija: 'مجموع الدخل' },
  'dash.totalExpenses': { fr: 'Total Dépenses', darija: 'مجموع المصاريف' },
  'dash.fixedVsVariable': { fr: 'Fixe vs Variable', darija: 'ثابت ضد متغير' },
  'dash.balanceTrend': { fr: 'Évolution du Solde', darija: 'تطور الرصيد' },
  'dash.monthlySummary': { fr: 'Résumé Mensuel', darija: 'ملخص الشهر' },

  // Debts
  'debt.title': { fr: 'Dettes & Créances', darija: 'الديون و الحقوق' },
  'debt.addProfile': { fr: 'Ajouter un Profil', darija: 'زيد بروفيل' },
  'debt.name': { fr: 'Nom', darija: 'الإسم' },
  'debt.iOwe': { fr: 'Je dois (Dette)', darija: 'أنا خاصني (دين)' },
  'debt.owedToMe': { fr: 'On me doit (Créance)', darija: 'خاصهم ليا (حق)' },
  'debt.amount': { fr: 'Montant', darija: 'المبلغ' },
  'debt.payment': { fr: 'Paiement', darija: 'خلاص' },
  'debt.addPayment': { fr: 'Ajouter Paiement', darija: 'زيد خلاص' },
  'debt.remaining': { fr: 'Reste', darija: 'الباقي' },
  'debt.settled': { fr: 'Soldé', darija: 'تخلص' },

  // Savings
  'savings.title': { fr: "Objectifs d'Épargne", darija: 'أهداف التوفير' },
  'savings.addGoal': { fr: 'Nouvel Objectif', darija: 'هدف جديد' },
  'savings.goalName': { fr: "Nom de l'objectif", darija: 'إسم الهدف' },
  'savings.target': { fr: 'Objectif (DH)', darija: 'الهدف (د.م)' },
  'savings.saved': { fr: 'Épargné', darija: 'توفر' },
  'savings.addAmount': { fr: 'Ajouter', darija: 'زيد' },
  'savings.dkhira': { fr: 'Dkhira (Tirelire)', darija: 'الذخيرة' },
  'savings.vault': { fr: 'Coffre Digital', darija: 'الصندوق الرقمي' },
  'savings.hideAmount': { fr: 'Cacher un montant', darija: 'خبي شي مبلغ' },

  // Settings
  'settings.title': { fr: 'Paramètres', darija: 'الإعدادات' },
  'settings.language': { fr: 'Langue', darija: 'اللغة' },
  'settings.salaryDay': { fr: 'Jour de salaire', darija: 'نهار الصالير' },
  'settings.salaryDayDesc': { fr: 'Le jour du mois où vous recevez votre salaire', darija: 'النهار لي كتقبض فيه' },

  // Common
  'common.dh': { fr: 'DH', darija: 'د.م' },
  'common.cancel': { fr: 'Annuler', darija: 'إلغاء' },
  'common.delete': { fr: 'Supprimer', darija: 'حذف' },
  'common.edit': { fr: 'Modifier', darija: 'تعديل' },
  'common.noData': { fr: 'Aucune donnée', darija: 'ما كاين والو' },
};

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType>({
  lang: 'fr',
  setLang: () => {},
  t: (k) => k,
  dir: 'ltr',
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('fr');

  const t = useCallback((key: string) => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const dir = lang === 'darija' ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      <div dir={dir} className={lang === 'darija' ? 'font-arabic' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};
