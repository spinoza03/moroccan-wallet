import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Stars, Sphere, Torus, Box, Octahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

/* ─── helpers ─── */
const useScrollY = () => {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return y;
};

/* ─── 3-D scene ─── */
const GoldCoin: React.FC<{ position: [number,number,number]; speed?: number }> = ({ position, speed = 1 }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * speed * 0.8;
    ref.current.rotation.x += delta * speed * 0.3;
  });
  return (
    <Float speed={speed * 1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <Torus ref={ref} position={position} args={[0.35, 0.12, 16, 64]}>
        <MeshWobbleMaterial color="#f59e0b" metalness={0.9} roughness={0.1} factor={0.2} speed={2} />
      </Torus>
    </Float>
  );
};

const FloatingSphere: React.FC<{ position: [number,number,number]; color: string; size?: number }> = ({ position, color, size = 0.5 }) => (
  <Float speed={2} rotationIntensity={0.6} floatIntensity={1.5}>
    <Sphere position={position} args={[size, 32, 32]}>
      <MeshDistortMaterial color={color} distort={0.35} speed={2} metalness={0.4} roughness={0.2} />
    </Sphere>
  </Float>
);

const FloatingBox: React.FC<{ position: [number,number,number]; color: string }> = ({ position, color }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => { ref.current.rotation.x += d * 0.4; ref.current.rotation.y += d * 0.6; });
  return (
    <Float speed={1.8} floatIntensity={1}>
      <Box ref={ref} position={position} args={[0.4, 0.4, 0.4]}>
        <MeshWobbleMaterial color={color} metalness={0.6} roughness={0.15} factor={0.3} speed={1.5} />
      </Box>
    </Float>
  );
};

const FloatingOct: React.FC<{ position: [number,number,number] }> = ({ position }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => { ref.current.rotation.y += d * 0.9; ref.current.rotation.z += d * 0.4; });
  return (
    <Float speed={2.5} floatIntensity={2}>
      <Octahedron ref={ref} position={position} args={[0.45, 0]}>
        <MeshDistortMaterial color="#10b981" distort={0.2} speed={3} metalness={0.7} roughness={0.1} />
      </Octahedron>
    </Float>
  );
};

const Scene3D: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = scrollY * 0.0008;
      groupRef.current.position.y = -scrollY * 0.002;
    }
  });
  return (
    <>
      <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#f59e0b" />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#10b981" />
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#6366f1" />
      <group ref={groupRef}>
        <GoldCoin position={[-2.5, 1.2, -1]} speed={1.2} />
        <GoldCoin position={[2.8, -0.5, -2]} speed={0.9} />
        <GoldCoin position={[0.5, 2.2, -1.5]} speed={1.5} />
        <FloatingSphere position={[-1.8, -1.5, -1]} color="#6366f1" size={0.55} />
        <FloatingSphere position={[2.2, 1.8, -2]} color="#f59e0b" size={0.35} />
        <FloatingSphere position={[0, -2.2, -1]} color="#10b981" size={0.45} />
        <FloatingBox position={[3, 0.5, -2.5]} color="#f59e0b" />
        <FloatingBox position={[-3, -1, -2]} color="#6366f1" />
        <FloatingOct position={[1.5, -1.8, -1.5]} />
        <FloatingOct position={[-2, 2, -2.5]} />
      </group>
    </>
  );
};

/* ─── Static morrocan-flavored counter ─── */
const Counter: React.FC<{ target: number; suffix?: string; label: string; sublabel: string }> = ({ target, suffix = '', label, sublabel }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(t); }
          else setVal(Math.floor(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return (
    <div ref={ref} style={{ textAlign:'center' }}>
      <div style={{ fontSize:'clamp(2rem,5vw,3rem)', fontWeight:900, background:'linear-gradient(135deg,#f59e0b,#10b981)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
        {val.toLocaleString('fr-MA')}{suffix}
      </div>
      <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff', marginTop:4 }}>{label}</div>
      <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.55)', marginTop:2 }}>{sublabel}</div>
    </div>
  );
};

/* ─── Feature card ─── */
const FeatureCard: React.FC<{ emoji: string; title: string; desc: string; delay?: number }> = ({ emoji, title, desc, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)',
      borderRadius:20, padding:'28px 24px',
      transition:`all 0.6s ease ${delay}ms`,
      opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(30px)',
    }}>
      <div style={{ fontSize:40, marginBottom:14 }}>{emoji}</div>
      <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff', marginBottom:8, fontFamily:'Noto Sans Arabic, sans-serif' }}>{title}</div>
      <div style={{ fontSize:'0.88rem', color:'rgba(255,255,255,.6)', lineHeight:1.7, fontFamily:'Noto Sans Arabic, sans-serif' }}>{desc}</div>
    </div>
  );
};

/* ─── Testimonial ─── */
const TestimonialCard: React.FC<{ name: string; city: string; text: string; stars?: number; delay?: number }> = ({ name, city, text, stars = 5, delay = 0 }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      background:'rgba(255,255,255,.05)', border:'1px solid rgba(245,158,11,.2)',
      borderRadius:16, padding:'24px',
      transition:`all 0.6s ease ${delay}ms`,
      opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
    }}>
      <div style={{ color:'#f59e0b', fontSize:18, marginBottom:12 }}>{'★'.repeat(stars)}</div>
      <p style={{ color:'rgba(255,255,255,.8)', fontSize:'0.9rem', lineHeight:1.8, fontFamily:'Noto Sans Arabic, sans-serif', marginBottom:16 }}>"{text}"</p>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#000', fontSize:14 }}>
          {name[0]}
        </div>
        <div>
          <div style={{ color:'#fff', fontWeight:600, fontSize:'0.88rem', fontFamily:'Noto Sans Arabic, sans-serif' }}>{name}</div>
          <div style={{ color:'rgba(255,255,255,.45)', fontSize:'0.78rem' }}>{city}</div>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN LANDING PAGE ─── */
const LandingPage: React.FC = () => {
  const scrollY = useScrollY();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const features = [
    { emoji: '📊', title: 'داشبورد ديال الشهر', desc: 'شوف كاملة دخلك، مصاريفك الثابتة والمتغيرة، والرصيد الباقي — بلمحة واحدة.' },
    { emoji: '💸', title: 'تتبع المعاملات', desc: 'سجل كل صرفة ومدخول مع الفئة والتاريخ. فلتر بالشهر أو النوع باش تلقى أي معاملة بسرعة.' },
    { emoji: '🤝', title: 'الديون والحقوق', desc: 'تتبع الفلوس لي خاصك تعطيها وللي خاصهم يعطيوك. سجل كل خلاص جزئي.' },
    { emoji: '🎯', title: 'أهداف التوفير', desc: 'حدد هدفك — طوموبيل، سفر، عرس — وتابع التقدم ديالك بالرسوم البيانية.' },
    { emoji: '🐷', title: 'الذخيرة الرقمية', desc: 'كوزينتك الرقمية الخاصة. زيد شوية مبالغ صغيرة كل مرة وشوف كيفاش كتكبر.' },
    { emoji: '☁️', title: 'حفظ فالكلاود', desc: 'بياناتك محفوظة بأمان فالسحابة. غادي تلقاها فأي جهاز، حتى لو بدلتي التيليفون.' },
  ];

  const testimonials = [
    { name: 'أيمن الحسني', city: 'الدار البيضاء', text: 'من جربت ميزانيتي، بدأت نعرف فين كايمشي فلوسي. الآن كنوفر كل شهر!', stars: 5 },
    { name: 'سلمى بنعلي', city: 'الرباط', text: 'التطبيق بالدارجة هو لي كنت محتاجاه. سهل وفي الوقت. شكرا ميزانيتي!', stars: 5 },
    { name: 'يوسف الإدريسي', city: 'مراكش', text: 'أخيرا تطبيق مغربي يفهمني. ولا حاجة فالإنجليزية ولا الفرنساوية الصعيبة.', stars: 5 },
    { name: 'فاطمة الزهراء', city: 'فاس', text: 'كنت مديونة وما كنت عارفة. دبا كل شيء واضح — الديون، التوفير، كلشي فبلاصة وحدة.', stars: 5 },
    { name: 'عمر بوزيد', city: 'طنجة', text: 'الرسوم البيانية ديال الداشبورد هي لي خلاتني نفهم وين مصاريفي كتمشي.', stars: 5 },
    { name: 'نورة الشرقاوي', city: 'أكادير', text: 'توفرت 3000 درهم فثلاثة شهور بعد ما بديت نستعمل ميزانيتي. موصي بيه لكل واحد.', stars: 5 },
  ];

  const steps = [
    { num: '01', title: 'سجل حساب', desc: 'دخل إيميلك وكلمة السر. مايأخذ حتى دقيقة.' },
    { num: '02', title: 'دير تحويل', desc: 'خلص الاشتراك عبر تحويل بنكي وابعت الإيصال.' },
    { num: '03', title: 'بدا تتحكم', desc: 'سجل مداخيلك ومصاريفك وشوف ميزانيتك تتضح.' },
  ];

  return (
    <div style={{ background:'#050a14', minHeight:'100vh', color:'#fff', overflowX:'hidden', direction:'rtl', fontFamily:'Noto Sans Arabic, sans-serif' }}>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 5vw',
        background: scrollY > 40 ? 'rgba(5,10,20,.92)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,.07)' : 'none',
        transition:'all .4s ease',
      }}>
        <img src="/logo.png" alt="Mizaniyti" style={{ height:40, objectFit:'contain' }} />
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => navigate('/auth')} style={{
            padding:'9px 22px', borderRadius:50, border:'1px solid rgba(245,158,11,.5)',
            background:'transparent', color:'#f59e0b', fontWeight:600, cursor:'pointer', fontSize:'0.9rem',
            fontFamily:'Noto Sans Arabic, sans-serif',
          }}>دخول</button>
          <button onClick={() => navigate('/auth')} style={{
            padding:'9px 22px', borderRadius:50, border:'none',
            background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#000',
            fontWeight:700, cursor:'pointer', fontSize:'0.9rem',
            fontFamily:'Noto Sans Arabic, sans-serif',
            boxShadow:'0 4px 20px rgba(245,158,11,.35)',
          }}>ابدا دبا 🚀</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {/* 3D canvas */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <Canvas camera={{ position:[0, 0, 6], fov:60 }} style={{ background:'transparent' }}>
            <Suspense fallback={null}>
              <Scene3D scrollY={scrollY} />
            </Suspense>
          </Canvas>
        </div>

        {/* radial glow */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(245,158,11,.08) 0%, transparent 70%)', zIndex:1 }} />

        {/* hero content */}
        <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'0 5vw', maxWidth:780, marginTop:60 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(245,158,11,.12)', border:'1px solid rgba(245,158,11,.3)',
            borderRadius:50, padding:'6px 18px', marginBottom:28, fontSize:'0.85rem', color:'#f59e0b',
          }}>
            🇲🇦 &nbsp; التطبيق المغربي الأول لإدارة المال
          </div>

          <h1 style={{
            fontSize:'clamp(2.4rem,7vw,5rem)', fontWeight:900, lineHeight:1.15, marginBottom:20,
            background:'linear-gradient(135deg,#ffffff 30%,#f59e0b 70%,#10b981 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            فلوسك فيدك،<br />مشي فيد الشهر
          </h1>

          <p style={{ fontSize:'clamp(1rem,2.5vw,1.25rem)', color:'rgba(255,255,255,.7)', lineHeight:1.8, marginBottom:14, maxWidth:600, margin:'0 auto 14px' }}>
            ميزانيتي — التطبيق لي كيساعدك تعرف فين كايمشي فلوسك، تحقق أهدافك، وتوفر كل شهر.
          </p>
          <p style={{ fontSize:'0.95rem', color:'rgba(255,255,255,.4)', marginBottom:40, fontStyle:'italic' }}>
            Votre budget, votre contrôle. Simple, clair, marocain.
          </p>

          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/auth')} style={{
              padding:'15px 36px', borderRadius:50, fontSize:'1.1rem', fontWeight:700,
              background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#000',
              border:'none', cursor:'pointer', boxShadow:'0 8px 32px rgba(245,158,11,.4)',
              transition:'transform .2s, box-shadow .2s', fontFamily:'Noto Sans Arabic, sans-serif',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.boxShadow='0 12px 40px rgba(245,158,11,.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(245,158,11,.4)'; }}
            >
              ابدا مجانا 🚀
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior:'smooth' })}
              style={{
                padding:'15px 36px', borderRadius:50, fontSize:'1.1rem', fontWeight:600,
                background:'rgba(255,255,255,.06)', color:'#fff',
                border:'1px solid rgba(255,255,255,.15)', cursor:'pointer',
                fontFamily:'Noto Sans Arabic, sans-serif', transition:'background .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.06)'; }}
            >
              شوف كيفاش خدام 👀
            </button>
          </div>

          {/* trust badges */}
          <div style={{ display:'flex', gap:24, justifyContent:'center', marginTop:48, flexWrap:'wrap' }}>
            {[
              { icon:'🔒', text:'بياناتك آمنة 100%' },
              { icon:'📱', text:'يخدم فأي تيليفون' },
              { icon:'🇲🇦', text:'صنع للمغاربة' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,.5)', fontSize:'0.82rem' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* scroll indicator */}
        <div style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:scrollY > 50 ? 0 : 1, transition:'opacity .3s' }}>
          <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,.35)' }}>scroll</span>
          <div style={{ width:1, height:40, background:'linear-gradient(to bottom, rgba(255,255,255,.3), transparent)', animation:'scrollPulse 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding:'80px 5vw', background:'rgba(245,158,11,.04)', borderTop:'1px solid rgba(245,158,11,.1)', borderBottom:'1px solid rgba(245,158,11,.1)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:40 }}>
          <Counter target={2500} suffix="+" label="مستخدم نشيط" sublabel="utilisateurs actifs" />
          <Counter target={98} suffix="%" label="راضيين على التطبيق" sublabel="taux de satisfaction" />
          <Counter target={3} suffix="x" label="أكثر توفيرًا مع ميزانيتي" sublabel="plus d'épargne" />
          <Counter target={20} suffix=" DH" label="فقط فالشهر" sublabel="par mois seulement" />
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ padding:'100px 5vw', maxWidth:1100, margin:'0 auto', textAlign:'center' }}>
        <div style={{ display:'inline-block', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', borderRadius:50, padding:'5px 18px', fontSize:'0.82rem', color:'#f87171', marginBottom:24 }}>
          واش هاد الموقف دار معاك؟
        </div>
        <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, marginBottom:24, lineHeight:1.3 }}>
          "ما عرفتش فين مشا الصالير 😩"
        </h2>
        <p style={{ color:'rgba(255,255,255,.6)', fontSize:'1.05rem', maxWidth:620, margin:'0 auto 60px', lineHeight:1.8 }}>
          كثير من المغاربة كيعيشو هاد المشكل. الفلوس كتجي وكتمشي بلا ما تعرف وين. ميزانيتي جاء باش يحل هاد المشكل نهائيا.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
          {[
            { before:'😰 "صرفت على شي ما كنت حاسب"', after:'✅ كل صرفة مسجلة ومعروفة' },
            { before:'😤 "مديون ونسيت لمن"', after:'✅ كل دين وحق في بلاصتو' },
            { before:'😔 "بغيت نوفر، ما قدرتش"', after:'✅ أهداف واضحة وتقدم محسوس' },
          ].map(({ before, after }, i) => (
            <div key={i} style={{ borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,.08)' }}>
              <div style={{ background:'rgba(239,68,68,.08)', padding:'16px 20px', fontSize:'0.9rem', color:'#f87171', borderBottom:'1px solid rgba(255,255,255,.06)' }}>{before}</div>
              <div style={{ background:'rgba(16,185,129,.08)', padding:'16px 20px', fontSize:'0.9rem', color:'#34d399' }}>{after}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'100px 5vw', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <div style={{ display:'inline-block', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.25)', borderRadius:50, padding:'5px 18px', fontSize:'0.82rem', color:'#34d399', marginBottom:20 }}>
            شنو كاين فميزانيتي
          </div>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, marginBottom:16 }}>
            كلشي لي محتاجو <span style={{ color:'#f59e0b' }}>فبلاصة وحدة</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:'1rem', maxWidth:500, margin:'0 auto' }}>
            Tout ce dont vous avez besoin pour maîtriser votre argent, en un seul endroit.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
          {features.map((f, i) => <FeatureCard key={i} {...f} delay={i * 80} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'100px 5vw', background:'rgba(255,255,255,.02)', borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, marginBottom:16 }}>
            كيفاش تبدا؟ <span style={{ color:'#10b981' }}>3 خطوات فقط</span>
          </h2>
          <p style={{ color:'rgba(255,255,255,.45)', marginBottom:60, fontSize:'1rem' }}>
            Comment ça marche ? Aussi simple que 1, 2, 3.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:32, position:'relative' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ textAlign:'center', position:'relative' }}>
                <div style={{
                  width:64, height:64, borderRadius:'50%', margin:'0 auto 20px',
                  background:'linear-gradient(135deg,#f59e0b22,#10b98122)',
                  border:'2px solid rgba(245,158,11,.3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.4rem', fontWeight:900, color:'#f59e0b',
                }}>{s.num}</div>
                <h3 style={{ fontSize:'1.15rem', fontWeight:700, marginBottom:10, color:'#fff' }}>{s.title}</h3>
                <p style={{ color:'rgba(255,255,255,.55)', fontSize:'0.9rem', lineHeight:1.7 }}>{s.desc}</p>
                {i < steps.length - 1 && (
                  <div style={{ position:'absolute', top:32, left:'-16px', right:'auto', fontSize:20, color:'rgba(245,158,11,.4)', display:'flex', alignItems:'center' }}>←</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding:'100px 5vw', maxWidth:900, margin:'0 auto', textAlign:'center' }}>
        <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, marginBottom:16 }}>
          بسعر <span style={{ color:'#f59e0b' }}>قهوة وحدة</span> فالشهر
        </h2>
        <p style={{ color:'rgba(255,255,255,.45)', marginBottom:60, fontSize:'1rem' }}>
          Moins cher qu'un café — et bien plus rentable.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:24 }}>
          {/* monthly */}
          <div style={{ borderRadius:24, border:'1px solid rgba(255,255,255,.12)', padding:'36px 28px', background:'rgba(255,255,255,.03)' }}>
            <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.45)', marginBottom:8 }}>الاشتراك الشهري</div>
            <div style={{ fontSize:'3.5rem', fontWeight:900, color:'#fff', marginBottom:4 }}>20<span style={{ fontSize:'1.2rem', color:'rgba(255,255,255,.5)' }}> DH</span></div>
            <div style={{ color:'rgba(255,255,255,.35)', fontSize:'0.85rem', marginBottom:28 }}>/ شهر — par mois</div>
            <button onClick={() => navigate('/auth')} style={{
              width:'100%', padding:'13px', borderRadius:50, border:'1px solid rgba(255,255,255,.2)',
              background:'transparent', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:'0.95rem',
              fontFamily:'Noto Sans Arabic, sans-serif',
            }}>ابدا دبا</button>
          </div>
          {/* yearly — highlighted */}
          <div style={{ borderRadius:24, border:'2px solid #f59e0b', padding:'36px 28px', background:'rgba(245,158,11,.05)', position:'relative', transform:'scale(1.04)', boxShadow:'0 0 60px rgba(245,158,11,.18)' }}>
            <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#000', borderRadius:50, padding:'4px 16px', fontSize:'0.78rem', fontWeight:700, whiteSpace:'nowrap' }}>
              🔥 -59% — الأوفر
            </div>
            <div style={{ fontSize:'0.85rem', color:'#f59e0b', marginBottom:8 }}>الاشتراك السنوي</div>
            <div style={{ fontSize:'3.5rem', fontWeight:900, color:'#f59e0b', marginBottom:4 }}>99<span style={{ fontSize:'1.2rem', color:'rgba(245,158,11,.6)' }}> DH</span></div>
            <div style={{ color:'rgba(255,255,255,.35)', fontSize:'0.85rem', marginBottom:6 }}>/ سنة — par an</div>
            <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,.4)', textDecoration:'line-through', marginBottom:24 }}>240 DH / an</div>
            <button onClick={() => navigate('/auth')} style={{
              width:'100%', padding:'13px', borderRadius:50, border:'none',
              background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#000',
              fontWeight:700, cursor:'pointer', fontSize:'0.95rem',
              fontFamily:'Noto Sans Arabic, sans-serif',
              boxShadow:'0 6px 24px rgba(245,158,11,.4)',
            }}>ابدا دبا 🚀</button>
          </div>
        </div>
        <p style={{ color:'rgba(255,255,255,.3)', fontSize:'0.8rem', marginTop:28 }}>
          الدفع عبر تحويل بنكي مغربي. بلا بطاقة بنكية. بلا تعقيد.
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding:'100px 5vw', background:'rgba(255,255,255,.02)', borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, marginBottom:12 }}>
              واش كيقولو <span style={{ color:'#f59e0b' }}>المستخدمين</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:'0.95rem' }}>Ce que disent nos utilisateurs</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} delay={i * 80} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:'120px 5vw', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,158,11,.07) 0%, transparent 70%)' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:700, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, marginBottom:20, lineHeight:1.2 }}>
            حان الوقت تتحكم<br /><span style={{ color:'#f59e0b' }}>فميزانيتك</span> 💪
          </h2>
          <p style={{ color:'rgba(255,255,255,.55)', fontSize:'1.1rem', marginBottom:48, lineHeight:1.8 }}>
            Il est temps de prendre le contrôle de votre argent. Commencez dès aujourd'hui.
          </p>
          <button onClick={() => navigate('/auth')} style={{
            padding:'18px 52px', borderRadius:50, fontSize:'1.2rem', fontWeight:700,
            background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#000',
            border:'none', cursor:'pointer',
            boxShadow:'0 8px 40px rgba(245,158,11,.45)',
            transition:'transform .2s, box-shadow .2s',
            fontFamily:'Noto Sans Arabic, sans-serif',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow='0 14px 50px rgba(245,158,11,.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(245,158,11,.45)'; }}
          >
            ابدا ميزانيتك دبا 🚀
          </button>
          <div style={{ marginTop:24, color:'rgba(255,255,255,.3)', fontSize:'0.82rem' }}>
            20 DH / شهر فقط · بلا تعقيد · مغربي 100%
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,.07)', padding:'40px 5vw', textAlign:'center' }}>
        <img src="/logo.png" alt="Mizaniyti" style={{ height:36, objectFit:'contain', marginBottom:16, opacity:0.8 }} />
        <p style={{ color:'rgba(255,255,255,.25)', fontSize:'0.82rem' }}>
          © 2025 Mizaniyti · تطبيق ميزانيتي لإدارة المال · صنع بـ ❤️ فالمغرب
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700;800;900&display=swap');
        @keyframes scrollPulse { 0%,100%{opacity:.3} 50%{opacity:.8} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default LandingPage;
