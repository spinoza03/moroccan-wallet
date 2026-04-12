import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, ArrowLeftRight, Users, Target, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TutorialKey = 'dashboard' | 'transactions' | 'debts' | 'savings' | 'settings';

/* ─── inline keyframe styles injected once ─── */
const ANIM_STYLES = `
@keyframes tut-bar   { from { transform:scaleY(0); } to { transform:scaleY(1); } }
@keyframes tut-up    { from { height:0; }             }
@keyframes tut-fade  { from { opacity:0; transform:scale(.92); } to { opacity:1; transform:scale(1); } }
@keyframes tut-left  { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
@keyframes tut-right { from { opacity:0; transform:translateX(10px);  } to { opacity:1; transform:translateX(0); } }
@keyframes tut-pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.07);} }
@keyframes tut-bounce{ 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }
@keyframes tut-prog  { from{width:0;} to{width:65%;} }
@keyframes tut-coin  { 0%{opacity:1;transform:translateY(-18px);} 80%{opacity:1;transform:translateY(6px);} 100%{opacity:0;transform:translateY(6px);} }
@keyframes tut-spin  { from{transform:rotate(0);} to{transform:rotate(360deg);} }
@keyframes tut-thumb { 0%{left:8%} 50%{left:68%} 100%{left:45%} }
@keyframes tut-slide-up { from{transform:translateY(40px);opacity:0;} to{transform:translateY(0);opacity:1;} }
`;

const a = (name: string, duration = '0.7s', delay = '0s', extra = 'ease both') =>
  ({ animation: `${name} ${duration} ${delay} ${extra}` } as React.CSSProperties);

/* ─── step definitions ─── */
interface Step {
  icon: React.ReactNode;
  title: { fr: string; darija: string };
  desc:  { fr: string; darija: string };
  animation: React.ReactNode;
}

const tutorials: Record<TutorialKey, Step[]> = {
  /* ── DASHBOARD ── */
  dashboard: [
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: { fr: 'Tableau de Bord', darija: 'لوحة التحكم' },
      desc: {
        fr:     'Visualisez votre budget mensuel : revenus, dépenses fixes, variables et votre solde.',
        darija: 'شوف ميزانيتك ديال الشهر: مداخيل، مصاريف ثابتة ومتغيرة والرصيد الباقي.',
      },
      animation: (
        <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:64 }}>
          {[55,80,40,70,50,85,45].map((h,i) => (
            <div key={i} style={{
              width:18, background:'hsl(var(--primary)/.7)', borderRadius:'4px 4px 0 0',
              height:`${h}%`, transformOrigin:'bottom',
              ...a('tut-bar','0.5s',`${i*80}ms`),
            }} />
          ))}
        </div>
      ),
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: { fr: 'Naviguer par mois', darija: 'تنقل بين الشهور' },
      desc: {
        fr:     'Cliquez sur le mois ou utilisez les flèches pour voir l\'historique de chaque période.',
        darija: 'كليك على الشهر أو استخدم السهمين باش تشوف كل فترة.',
      },
      animation: (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'hsl(var(--muted))', display:'flex', alignItems:'center', justifyContent:'center', ...a('tut-pulse','1.4s','0s','ease-in-out infinite') }}>
            <ChevronLeft style={{ width:16, height:16, color:'hsl(var(--primary))' }} />
          </div>
          {['يناير','فبراير','مارس'].map((m,i) => (
            <div key={m} style={{
              padding:'3px 8px', borderRadius:6, fontSize:11, fontWeight:600,
              background: i===1 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              color:       i===1 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              transform:   i===1 ? 'scale(1.12)' : 'scale(1)',
              ...a('tut-fade','0.4s',`${i*120}ms`),
            }}>{m}</div>
          ))}
          <div style={{ width:28, height:28, borderRadius:'50%', background:'hsl(var(--muted))', display:'flex', alignItems:'center', justifyContent:'center', ...a('tut-pulse','1.4s','200ms','ease-in-out infinite') }}>
            <ChevronRight style={{ width:16, height:16, color:'hsl(var(--primary))' }} />
          </div>
        </div>
      ),
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: { fr: 'Dettes & Target', darija: 'الديون والهدف' },
      desc: {
        fr:     'Les cartes en haut affichent vos dettes, créances et la progression de vos objectifs d\'épargne.',
        darija: 'البطاقات فوق كتعرض ديونك، حقوقك والتقدم ديال أهداف التوفير.',
      },
      animation: (
        <div style={{ display:'flex', gap:20, justifyContent:'center' }}>
          {[
            { icon:'😰', label:'-1,200 د.م', color:'hsl(var(--destructive))', bg:'hsl(var(--destructive)/.12)', delay:'0ms' },
            { icon:'😊', label:'+800 د.م',  color:'#16a34a',                  bg:'#dcfce7',                     delay:'200ms' },
            { icon:'🎯', label:'75%',        color:'hsl(var(--primary))',       bg:'hsl(var(--primary)/.1)',      delay:'400ms' },
          ].map(({ icon, label, color, bg, delay }) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, ...a('tut-bounce','1.8s',delay,'ease-in-out infinite') }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{icon}</div>
              <span style={{ fontSize:10, fontWeight:700, color }}>{label}</span>
            </div>
          ))}
        </div>
      ),
    },
  ],

  /* ── TRANSACTIONS ── */
  transactions: [
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-primary" />,
      title: { fr: 'Ajouter une transaction', darija: 'زيد معاملة' },
      desc: {
        fr:     'Appuyez sur "+ Ajouter Transaction", choisissez revenu ou dépense, la catégorie et le montant.',
        darija: 'كليك على "زيد معاملة"، اختار نوعها، الخانة والمبلغ.',
      },
      animation: (
        <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
          <div style={{ padding:'8px 20px', background:'hsl(var(--primary))', color:'hsl(var(--primary-foreground))', borderRadius:10, fontSize:12, fontWeight:600, ...a('tut-pulse','1.6s','0s','ease-in-out infinite') }}>
            + زيد معاملة
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, background:'#dcfce7', color:'#15803d', border:'1px solid #86efac', ...a('tut-left','0.4s','200ms') }}>دخل ↑</div>
            <div style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:600, background:'hsl(var(--destructive)/.1)', color:'hsl(var(--destructive))', border:'1px solid hsl(var(--destructive)/.3)', ...a('tut-right','0.4s','350ms') }}>مصروف ↓</div>
          </div>
        </div>
      ),
    },
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-primary" />,
      title: { fr: 'Fixe vs Variable', darija: 'ثابت أو متغير' },
      desc: {
        fr:     'Fixe = loyer, factures, crédit... Variable = sorties, vêtements, restaurants... Séparez-les bien !',
        darija: 'الثابت = الكرا، الفاتورات، القرض... المتغير = السوارتي، الحوايج... فرق بينهم مزيان!',
      },
      animation: (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, width:220 }}>
          <div style={{ borderRadius:10, background:'#dcfce7', border:'1px solid #86efac', padding:'8px', textAlign:'center', ...a('tut-left','0.4s') }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#15803d' }}>ثابت 🏠</div>
            <div style={{ fontSize:9, color:'#6b7280', marginTop:3 }}>الكرا • WIFI • قرض</div>
          </div>
          <div style={{ borderRadius:10, background:'#fff7ed', border:'1px solid #fdba74', padding:'8px', textAlign:'center', ...a('tut-right','0.4s','150ms') }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#c2410c' }}>متغير 🛍️</div>
            <div style={{ fontSize:9, color:'#6b7280', marginTop:3 }}>سوارتي • مطعم</div>
          </div>
        </div>
      ),
    },
    {
      icon: <ArrowLeftRight className="w-6 h-6 text-primary" />,
      title: { fr: 'Filtrer & Rechercher', darija: 'فلتر وقلب' },
      desc: {
        fr:     'Utilisez la barre de recherche ou filtrez par type et par mois pour retrouver n\'importe quelle transaction.',
        darija: 'استخدم الـSearch أو فلتر حسب النوع والشهر باش تلقى أي معاملة بسرعة.',
      },
      animation: (
        <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'center', width:220 }}>
          <div style={{ width:'100%', height:32, borderRadius:8, border:'1px solid hsl(var(--border))', background:'hsl(var(--muted))', display:'flex', alignItems:'center', padding:'0 10px', gap:8, ...a('tut-pulse','2s','0s','ease-in-out infinite') }}>
            <span style={{ fontSize:13, color:'hsl(var(--muted-foreground))' }}>🔍</span>
            <div style={{ flex:1, height:8, borderRadius:4, background:'hsl(var(--muted-foreground)/.2)' }} />
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['كلشي','دخل','مصروف'].map((f,i) => (
              <div key={f} style={{ padding:'3px 10px', borderRadius:6, fontSize:10, fontWeight:600,
                background: i===0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                color:       i===0 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                ...a('tut-fade','0.3s',`${i*100}ms`),
              }}>{f}</div>
            ))}
          </div>
        </div>
      ),
    },
  ],

  /* ── DEBTS ── */
  debts: [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: { fr: 'Dettes & Créances', darija: 'الديون والحقوق' },
      desc: {
        fr:     'Suivez l\'argent que vous devez (dettes) et l\'argent qu\'on vous doit (créances).',
        darija: 'تتبع الفلوس لي خاصك تعطيها (ديون) والفلوس لي خاصهم يعطيوك إياها (حقوق).',
      },
      animation: (
        <div style={{ display:'flex', gap:24, justifyContent:'center' }}>
          {[
            { emoji:'😰', title:'أنا خاصني', amount:'-1,200 د.م', color:'hsl(var(--destructive))', bg:'hsl(var(--destructive)/.1)', delay:'0ms' },
            { emoji:'🤝', title:'خاصهم ليا', amount:'+800 د.م',  color:'#16a34a',                  bg:'#dcfce7',                    delay:'250ms' },
          ].map(({ emoji,title,amount,color,bg,delay }) => (
            <div key={title} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, ...a('tut-fade','0.5s',delay) }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:bg, border:`2px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, ...a('tut-bounce','2s',delay,'ease-in-out infinite') }}>{emoji}</div>
              <span style={{ fontSize:10, fontWeight:700, color }}>{title}</span>
              <span style={{ fontSize:10, color:'hsl(var(--muted-foreground))' }}>{amount}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: { fr: 'Ajouter un profil', darija: 'زيد بروفيل' },
      desc: {
        fr:     'Cliquez "+ Ajouter Profil", entrez le nom, choisissez le type (dette ou créance) et le montant.',
        darija: 'كليك على "+ زيد بروفيل"، دخل السمية، اختار النوع (دين أو حق) والمبلغ.',
      },
      animation: (
        <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'center', width:220 }}>
          {[
            { ph:'الإسم... محمد', color:'hsl(var(--foreground))', delay:'0ms' },
            { ph:'أنا خاصني (دين) ↓', color:'hsl(var(--destructive))', delay:'150ms' },
            { ph:'المبلغ... 500 د.م', color:'hsl(var(--foreground))', delay:'300ms' },
          ].map(({ ph, color, delay }) => (
            <div key={ph} style={{ width:'100%', height:28, borderRadius:6, border:'1px solid hsl(var(--border))', background:'hsl(var(--muted))', display:'flex', alignItems:'center', padding:'0 8px', ...a('tut-left','0.4s',delay) }}>
              <span style={{ fontSize:10, color }}>{ph}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: { fr: 'Enregistrer un paiement', darija: 'سجل خلاص' },
      desc: {
        fr:     'Appuyez "Ajouter Paiement" sur un profil pour enregistrer les remboursements au fur et à mesure.',
        darija: 'كليك على "زيد خلاص" فأي بروفيل باش تسجل الخلاصات شوية بشوية.',
      },
      animation: (
        <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
          <div style={{ width:200, borderRadius:10, border:'1px solid hsl(var(--border))', padding:10, ...a('tut-fade','0.4s') }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:11, fontWeight:600 }}>
              <span>محمد</span>
              <span style={{ color:'hsl(var(--destructive))' }}>-500 د.م</span>
            </div>
            <div style={{ height:6, background:'hsl(var(--muted))', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'hsl(var(--primary))', borderRadius:4, ...a('tut-prog','1.4s','300ms','ease both') }} />
            </div>
          </div>
          <div style={{ padding:'6px 16px', borderRadius:8, border:'1px solid hsl(var(--border))', fontSize:11, fontWeight:600, ...a('tut-bounce','1.8s','0s','ease-in-out infinite') }}>
            + زيد خلاص 💸
          </div>
        </div>
      ),
    },
  ],

  /* ── SAVINGS ── */
  savings: [
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: { fr: 'Objectifs d\'Épargne', darija: 'أهداف التوفير' },
      desc: {
        fr:     'Créez des objectifs nommés (voiture, voyage, mariage...) avec un montant cible.',
        darija: 'دير أهداف بأسماء (طوموبيل، سفر، عرس...) مع المبلغ لي بغيتي توفرو.',
      },
      animation: (
        <div style={{ display:'flex', gap:14, justifyContent:'center', alignItems:'flex-end', height:70 }}>
          {[
            { name:'🚗', pct:65, color:'#3b82f6', delay:'0ms' },
            { name:'✈️', pct:30, color:'#22c55e', delay:'150ms' },
            { name:'💍', pct:85, color:'#a855f7', delay:'300ms' },
          ].map(({ name, pct, color, delay }) => (
            <div key={name} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:10, fontWeight:700, color }}>{pct}%</span>
              <div style={{ width:28, height:56, background:'hsl(var(--muted))', borderRadius:6, overflow:'hidden', display:'flex', flexDirection:'column-reverse' }}>
                <div style={{ background:color, borderRadius:6, ...a('tut-up','0.8s',delay,'ease both'), height:`${pct}%` }} />
              </div>
              <span style={{ fontSize:14 }}>{name}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: { fr: 'Alimenter un objectif', darija: 'زيد لهدف' },
      desc: {
        fr:     'Sur chaque objectif, cliquez "+ Ajouter" et saisissez le montant épargné.',
        darija: 'فكل هدف، كليك على "+ زيد" ودخل المبلغ لي وفرتيه.',
      },
      animation: (
        <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
          <div style={{ width:210, borderRadius:10, border:'1px solid hsl(var(--border))', padding:10, ...a('tut-fade','0.4s') }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <span>🎯</span>
              <span style={{ fontSize:11, fontWeight:600 }}>طوموبيل</span>
            </div>
            <div style={{ height:6, background:'hsl(var(--muted))', borderRadius:4, overflow:'hidden', marginBottom:4 }}>
              <div style={{ height:'100%', background:'hsl(var(--primary))', borderRadius:4, ...a('tut-prog','1.4s','200ms','ease both') }} />
            </div>
            <div style={{ fontSize:9, color:'hsl(var(--muted-foreground))' }}>وفرت: 6,500 / 10,000 د.م</div>
          </div>
          <div style={{ padding:'5px 14px', borderRadius:8, background:'hsl(var(--primary)/.1)', border:'1px solid hsl(var(--primary)/.3)', fontSize:11, fontWeight:600, color:'hsl(var(--primary))', ...a('tut-pulse','1.6s','0s','ease-in-out infinite') }}>
            + زيد مبلغ
          </div>
        </div>
      ),
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: { fr: 'La Dkhira (Tirelire)', darija: 'الذخيرة (الكوزينة)' },
      desc: {
        fr:     'La Dkhira est votre tirelire cachée. Ajoutez de petits montants et regardez-les s\'accumuler.',
        darija: 'الذخيرة هي كوزينتك الرقمية. زيد شوية مبالغ صغيرة ومن بعد شوف كيفاش كتكبر.',
      },
      animation: (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div style={{ position:'relative', width:60, height:60 }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'hsl(var(--accent)/.2)', border:'2px solid hsl(var(--accent)/.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, ...a('tut-pulse','2s','0s','ease-in-out infinite') }}>🐷</div>
            {[0,1,2].map(i => (
              <div key={i} style={{
                position:'absolute', top:0, left:'50%',
                width:10, height:10, borderRadius:'50%', background:'#facc15',
                ...a('tut-coin','1.2s',`${i*400}ms`,'ease-in-out infinite'),
              }} />
            ))}
          </div>
          <div style={{ fontSize:16, fontWeight:700, color:'hsl(var(--accent))', ...a('tut-fade','0.6s','600ms') }}>1,250 د.م 💰</div>
        </div>
      ),
    },
  ],

  /* ── SETTINGS ── */
  settings: [
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: { fr: 'Langue', darija: 'اللغة' },
      desc: {
        fr:     'Choisissez entre le Français et la Darija. L\'application s\'adapte entièrement et mémorise votre choix.',
        darija: 'اختار بين الفرنساوية والدارجة. التطبيق كيتبدل كامل وكيحفظ اختيارك.',
      },
      animation: (
        <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center' }}>
          <div style={{ padding:'8px 14px', borderRadius:10, background:'hsl(var(--primary))', color:'hsl(var(--primary-foreground))', fontSize:12, fontWeight:700, ...a('tut-pulse','1.8s','0s','ease-in-out infinite') }}>
            🇲🇦 الدارجة
          </div>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'hsl(var(--muted))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, ...a('tut-spin','3s','0s','linear infinite') }}>⇄</div>
          <div style={{ padding:'8px 14px', borderRadius:10, background:'hsl(var(--muted))', color:'hsl(var(--muted-foreground))', fontSize:12, fontWeight:600 }}>
            🇫🇷 Français
          </div>
        </div>
      ),
    },
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: { fr: 'Jour de Salaire', darija: 'نهار الصالير' },
      desc: {
        fr:     'Indiquez le jour où vous recevez votre salaire pour que le tableau de bord calcule correctement vos périodes.',
        darija: 'حدد النهار لي كتقبض فيه الصالير باش لوحة التحكم تحسب الفترات مزيان.',
      },
      animation: (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, width:200 }}>
            <span style={{ fontSize:11, color:'hsl(var(--muted-foreground))' }}>1</span>
            <div style={{ flex:1, height:6, background:'hsl(var(--muted))', borderRadius:6, position:'relative' }}>
              <div style={{ position:'absolute', top:'50%', width:18, height:18, borderRadius:'50%', background:'hsl(var(--primary))', transform:'translateY(-50%)', boxShadow:'0 2px 6px hsl(var(--primary)/.4)', ...a('tut-thumb','2.4s','0s','ease-in-out infinite'), left:'45%' }} />
            </div>
            <span style={{ fontSize:11, color:'hsl(var(--muted-foreground))' }}>31</span>
          </div>
          <div style={{ width:44, height:44, borderRadius:12, background:'hsl(var(--primary)/.1)', border:'1px solid hsl(var(--primary)/.3)', display:'flex', alignItems:'center', justifyContent:'center', ...a('tut-pulse','2s','0s','ease-in-out infinite') }}>
            <span style={{ fontSize:20, fontWeight:800, color:'hsl(var(--primary))' }}>15</span>
          </div>
        </div>
      ),
    },
  ],
};

/* ─── Component ─── */
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

  useEffect(() => { setStep(0); }, [tutorialKey]);

  return (
    <>
      <style>{ANIM_STYLES}</style>
      <div
        style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:16 }}
        onClick={onClose}
      >
        {/* backdrop */}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)', backdropFilter:'blur(4px)' }} />

        {/* card */}
        <div
          style={{ position:'relative', background:'hsl(var(--card))', border:'1px solid hsl(var(--border))', borderRadius:20, width:'100%', maxWidth:380, boxShadow:'0 24px 60px rgba(0,0,0,.35)', overflow:'hidden', ...a('tut-slide-up','0.35s','0s','cubic-bezier(.22,1,.36,1) both') }}
          onClick={e => e.stopPropagation()}
        >
          {/* header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px 8px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {current.icon}
              <span style={{ fontWeight:700, fontSize:14, color:'hsl(var(--foreground))' }}>{current.title[lang]}</span>
            </div>
            <button onClick={onClose} style={{ padding:4, borderRadius:8, background:'transparent', border:'none', cursor:'pointer', color:'hsl(var(--muted-foreground))' }}>
              <X style={{ width:16, height:16 }} />
            </button>
          </div>

          {/* step dots */}
          <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:12 }}>
            {steps.map((_,i) => (
              <button key={i} onClick={() => setStep(i)} style={{
                border:'none', cursor:'pointer', borderRadius:10, transition:'all .2s',
                width: i===step ? 20 : 6, height:6,
                background: i===step ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/.3)',
              }} />
            ))}
          </div>

          {/* animation area */}
          <div style={{ margin:'0 16px 12px', height:112, background:'hsl(var(--muted)/.4)', borderRadius:14, border:'1px solid hsl(var(--border)/.6)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            <div key={`${tutorialKey}-${step}`} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px', ...a('tut-fade','0.3s') }}>
              {current.animation}
            </div>
          </div>

          {/* description */}
          <p style={{ fontSize:13, color:'hsl(var(--muted-foreground))', padding:'0 16px 16px', textAlign:'center', lineHeight:1.6, margin:0 }}>
            {current.desc[lang]}
          </p>

          {/* navigation */}
          <div style={{ display:'flex', gap:8, padding:'0 16px 16px' }}>
            {step > 0 && (
              <Button variant="outline" size="sm" style={{ flex:1 }} onClick={() => setStep(s => s - 1)}>
                <ChevronLeft style={{ width:14, height:14, marginRight:4 }} />
                {lang === 'darija' ? 'السابق' : 'Précédent'}
              </Button>
            )}
            <Button size="sm" style={{ flex:1 }} onClick={() => isLast ? onClose() : setStep(s => s + 1)}>
              {isLast
                ? (lang === 'darija' ? '✅ فهمت!' : '✅ Compris !')
                : (lang === 'darija' ? 'التالي' : 'Suivant')
              }
              {!isLast && <ChevronRight style={{ width:14, height:14, marginLeft:4 }} />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
