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
  'tx.incomeType': { fr: 'Revenus', darija: 'المداخيل' },
  'tx.expenseFixed': { fr: 'Dépense fixe', darija: 'مصروف ثابت' },
  'tx.expenseVariable': { fr: 'Dépense variable', darija: 'مصروف متغير' },
  'tx.category': { fr: 'Catégorie', darija: 'الفئة' },
  'tx.fixed': { fr: 'Fixe', darija: 'ثابت' },
  'tx.variable': { fr: 'Variable', darija: 'متغير' },
  'tx.label': { fr: 'Description', darija: 'الوصف' },
  'tx.labelPlaceholder': { fr: 'Libellé / description', darija: 'الوصف / التسمية' },
  'tx.amount': { fr: 'Montant (DH)', darija: 'المبلغ (د.م)' },
  'tx.amountPlaceholder': { fr: 'Montant (DH)', darija: 'المبلغ (د.م)' },
  'tx.save': { fr: 'Enregistrer', darija: 'حفظ' },
  'tx.recent': { fr: 'Transactions récentes', darija: 'المعاملات الأخيرة' },
  'tx.chooseCat': { fr: 'Choisir un poste...', darija: 'اختار الخانة...' },
  'tx.search': { fr: 'Rechercher...', darija: 'قلب...' },
  'tx.all': { fr: 'Tout', darija: 'كلشي' },
  'tx.allMonths': { fr: 'Tous les mois', darija: 'جميع الشهور' },
  'tx.expenses': { fr: 'Dépenses', darija: 'المصاريف' },
  'tx.count': { fr: 'transaction', darija: 'معاملة' },
  'tx.counts': { fr: 'transactions', darija: 'معاملات' },

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
  'dash.title': { fr: 'Mon Budget', darija: 'ميزانيتي' },
  'dash.netIncome': { fr: 'Revenu Net', darija: 'الدخل الصافي' },
  'dash.resteAVivre': { fr: 'Reste à Vivre', darija: 'الباقي للمعيشة' },
  'dash.savingsRate': { fr: "Taux d'Épargne", darija: 'نسبة التوفير' },
  'dash.totalIncome': { fr: 'Total Revenus', darija: 'مجموع الدخل' },
  'dash.totalExpenses': { fr: 'Total Dépenses', darija: 'مجموع المصاريف' },
  'dash.fixedVsVariable': { fr: 'Fixe vs Variable', darija: 'ثابت ضد متغير' },
  'dash.balanceTrend': { fr: 'Évolution du Solde', darija: 'تطور الرصيد' },
  'dash.monthlySummary': { fr: 'Résumé Mensuel', darija: 'ملخص الشهر' },
  'dash.balance': { fr: 'Solde fin de période', darija: 'الرصيد آخر الشهر' },
  'dash.periodSavings': { fr: 'Épargne de la période', darija: 'التوفير ديال الشهر' },
  'dash.monthlyBalances': { fr: 'Soldes fin de mois', darija: 'أرصدة آخر الشهر' },
  'dash.periodIncome': { fr: 'Revenus de la période', darija: 'المداخيل ديال الشهر' },
  'dash.noIncome': { fr: 'Aucun revenu ce mois', darija: 'ما كاين شي دخل هذا الشهر' },
  'dash.fixedExpenses': { fr: 'Dépenses fixes de période', darija: 'المصاريف الثابتة ديال الشهر' },
  'dash.noFixed': { fr: 'Aucune dépense fixe ce mois', darija: 'ما كاين شي مصروف ثابت هذا الشهر' },
  'dash.varExpenses': { fr: 'Dépenses variables de période', darija: 'المصاريف المتغيرة ديال الشهر' },
  'dash.noVariable': { fr: 'Aucune dépense variable ce mois', darija: 'ما كاين شي مصروف متغير هذا الشهر' },
  'dash.debts': { fr: 'Dettes', darija: 'الديون' },
  'dash.credits': { fr: 'Créances', darija: 'الحقوق' },
  'dash.colIncome': { fr: 'Revenus', darija: 'المداخيل' },
  'dash.colAmount': { fr: 'Montant', darija: 'المبلغ' },
  'dash.colFixed': { fr: 'Dépenses fixes', darija: 'المصاريف الثابتة' },
  'dash.colVariable': { fr: 'Dépenses variables', darija: 'المصاريف المتغيرة' },
  'dash.total': { fr: 'Total', darija: 'المجموع' },
  'dash.saved': { fr: 'Épargné', darija: 'وفرت' },
  'dash.remaining': { fr: 'Reste', darija: 'الباقي' },
  'dash.cumBalance': { fr: 'Solde cumulé', darija: 'الرصيد التراكمي' },
  'dash.target': { fr: 'Target', darija: 'الهدف' },

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
  'debt.total': { fr: 'Total : ', darija: 'المجموع: ' },
  'debt.paid': { fr: 'Payé : ', darija: 'خلصت: ' },
  'debt.reste': { fr: 'Reste', darija: 'الباقي' },
  'debt.noDebts': { fr: 'Aucune dette', darija: 'ما كاين شي دين' },
  'debt.noCredits': { fr: 'Aucune créance', darija: 'ما كاين شي حق' },
  'debt.iOweType': { fr: 'Je dois (Dette)', darija: 'أنا خاصني (دين)' },
  'debt.owedToMeType': { fr: 'On me doit (Créance)', darija: 'خاصهم ليا (حق)' },

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
  'savings.addToDkhira': { fr: 'Ajouter à la tirelire', darija: 'زيد للذخيرة' },
  'savings.summary': { fr: 'Récapitulatif des objectifs', darija: 'ملخص الأهداف' },
  'savings.projectName': { fr: 'Nom du projet', darija: 'إسم المشروع' },
  'savings.savedAmount': { fr: 'Montant épargné', darija: 'المبلغ المتوفر' },
  'savings.toSave': { fr: 'Reste à épargner', darija: 'الباقي للتوفير' },
  'savings.savedVsRest': { fr: 'Épargné vs Reste par objectif', darija: 'المتوفر ضد الباقي لكل هدف' },
  'savings.globalProgress': { fr: 'Progression globale', darija: 'التقدم الإجمالي' },
  'savings.savedLabel': { fr: 'Épargné', darija: 'توفرت' },
  'savings.restLabel': { fr: 'Reste', darija: 'الباقي' },
  'savings.savedOf': { fr: 'Épargné :', darija: 'وفرت:' },
  'savings.restOf': { fr: 'Reste :', darija: 'الباقي:' },

  // Settings
  'settings.title': { fr: 'Paramètres', darija: 'الإعدادات' },
  'settings.language': { fr: 'Langue', darija: 'اللغة' },
  'settings.salaryDay': { fr: 'Jour de salaire', darija: 'نهار الصالير' },
  'settings.salaryDayDesc': { fr: 'Le jour du mois où vous recevez votre salaire', darija: 'النهار لي كتقبض فيه الصالير' },

  // Auth page
  'auth.login': { fr: 'Connexion', darija: 'دخول' },
  'auth.register': { fr: 'Créer un compte', darija: 'سجل حساب' },
  'auth.tagline': { fr: 'Gérez vos finances personnelles', darija: 'دير حساب لفلوسك' },
  'auth.fullName': { fr: 'Nom complet', darija: 'الإسم الكامل' },
  'auth.whatsapp': { fr: 'Numéro WhatsApp (ex: 0612345678)', darija: 'رقم واتساب (مثال: 0612345678)' },
  'auth.email': { fr: 'Email', darija: 'الإيميل' },
  'auth.password': { fr: 'Mot de passe', darija: 'كلمة السر' },
  'auth.confirmPassword': { fr: 'Confirmer le mot de passe', darija: 'أكد كلمة السر' },
  'auth.submit.login': { fr: 'Se connecter', darija: 'دخول' },
  'auth.submit.register': { fr: "S'inscrire", darija: 'سجل' },
  'auth.loading': { fr: 'Chargement...', darija: 'تحميل...' },
  'auth.toRegister': { fr: "Pas encore de compte ? S'inscrire", darija: 'ما عندكش حساب؟ سجل دبا' },
  'auth.toLogin': { fr: 'Déjà un compte ? Se connecter', darija: 'عندك حساب؟ دخول' },
  'auth.successMsg': { fr: 'Compte créé ! Vérifiez votre email pour confirmer votre compte, puis connectez-vous.', darija: 'تسجل! شوف إيميلك باش تأكد الحساب، مبعد دخول.' },
  'auth.err.nameRequired': { fr: 'Veuillez entrer votre nom complet.', darija: 'دخل سميتك الكاملة.' },
  'auth.err.phoneRequired': { fr: 'Veuillez entrer votre numéro WhatsApp.', darija: 'دخل رقم واتساب ديالك.' },
  'auth.err.passwordMismatch': { fr: 'Les mots de passe ne correspondent pas.', darija: 'كلمة السر ما تطابقاتش.' },
  'auth.err.passwordShort': { fr: 'Le mot de passe doit contenir au moins 6 caractères.', darija: 'كلمة السر خاصها تكون 6 حروف على الأقل.' },

  // Subscription page
  'sub.tagline': { fr: 'Choisissez votre abonnement pour commencer', darija: 'اختار الاشتراك ديالك باش تبدا' },
  'sub.monthly': { fr: 'Par mois', darija: 'فالشهر' },
  'sub.yearly': { fr: 'Par an', darija: 'فالعام' },
  'sub.included': { fr: 'Ce qui est inclus', darija: 'شنو كاين فالاشتراك' },
  'sub.f1': { fr: 'Suivi illimité de transactions', darija: 'تتبع المعاملات بلا حد' },
  'sub.f2': { fr: 'Gestion des dettes et créances', darija: 'تسيير الديون و الحقوق' },
  'sub.f3': { fr: "Objectifs d'épargne personnalisés", darija: 'أهداف التوفير الخاصة بيك' },
  'sub.f4': { fr: 'Tableau de bord avec graphiques', darija: 'لوحة التحكم مع الرسوم البيانية' },
  'sub.f5': { fr: 'Sauvegarde cloud sécurisée', darija: 'حفظ آمن فالكلاود' },
  'sub.f6': { fr: 'Mise à jour continue', darija: 'تحديثات مستمرة' },
  'sub.bankTitle': { fr: 'Coordonnées bancaires', darija: 'المعلومات البنكية' },
  'sub.bankDesc': { fr: 'Veuillez effectuer un virement de', darija: 'دير تحويل ب' },
  'sub.bankDescOn': { fr: 'sur ce compte :', darija: 'لهذا الحساب:' },
  'sub.uploadTitle': { fr: 'Envoyer le reçu de paiement', darija: 'ابعت صورة الإيصال' },
  'sub.uploadDesc': { fr: 'Après avoir effectué le virement, joignez le reçu ici pour activer votre abonnement.', darija: 'من بعد ما دير التحويل، زيد الإيصال هنا باش يتفعل اشتراكك.' },
  'sub.chooseFile': { fr: 'Cliquez pour choisir un fichier', darija: 'كليك باش تختار الملف' },
  'sub.fileTypes': { fr: 'JPG, PNG ou PDF', darija: 'JPG أو PNG أو PDF' },
  'sub.send': { fr: 'Envoyer le reçu', darija: 'ابعت الإيصال' },
  'sub.sending': { fr: 'Envoi en cours...', darija: 'كيتبعت...' },
  'sub.uploadError': { fr: 'Erreur lors du téléchargement. Réessayez.', darija: 'كاين مشكل فالتحميل. عاود.' },
  'sub.thankYouTitle': { fr: 'Reçu envoyé !', darija: 'تبعت الإيصال!' },
  'sub.thankYouDesc': { fr: 'Votre reçu de paiement a été reçu. Votre abonnement sera activé dans les 24h après vérification du paiement.', darija: 'وصلنا إيصال الدفع ديالك. غادي يتفعل اشتراكك خلال 24 ساعة من بعد ما نتحققو من الدفع.' },
  'sub.signOut': { fr: 'Se déconnecter', darija: 'خروج' },
  'sub.bankHolder': { fr: 'Titulaire', darija: 'صاحب الحساب' },

  // Common
  'common.dh': { fr: 'DH', darija: 'د.م' },
  'common.cancel': { fr: 'Annuler', darija: 'إلغاء' },
  'common.delete': { fr: 'Supprimer', darija: 'حذف' },
  'common.edit': { fr: 'Modifier', darija: 'تعديل' },
  'common.noData': { fr: 'Aucune donnée', darija: 'ما كاين والو' },
  'common.total': { fr: 'Total', darija: 'المجموع' },
  'common.loading': { fr: 'Chargement...', darija: 'تحميل...' },
  'common.percent': { fr: '%', darija: '%' },
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
