import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Sparkles, 
  ArrowRight, 
  FileCheck, 
  Cpu, 
  TrendingUp, 
  Target, 
  Building2, 
  Users, 
  CheckCircle2,
  Search
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin'} replace />;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column' }}>

      {/* ── 1. HERO SECTION ── */}
      <section style={{ padding: '90px 24px 70px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Hero Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 99,
            padding: '8px 20px',
            fontSize: 13,
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: 32,
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)'
          }}>
            <Sparkles size={16} />
            <span>Moteur d'Algorithme Prédictif de Recruiting Match</span>
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(42px, 6vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: 24
          }}>
            Le matching intelligent qui propulse{' '}
            <span className="grad-text">votre carrière</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: 680,
            margin: '0 auto 44px',
            lineHeight: 1.6
          }}>
            Analyse avancée de compétences techniques par vectorisation TF-IDF &amp; similarité cosinus pour des connexions sur-mesure entre étudiants et entreprises de premier plan.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link to="/register" className="btn btn--primary" style={{ fontSize: 16, padding: '16px 36px', borderRadius: 'var(--radius-md)' }}>
              <span>Créer mon profil</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/internships" className="btn btn--outline" style={{ fontSize: 16, padding: '16px 36px', borderRadius: 'var(--radius-md)' }}>
              <Search size={18} />
              <span>Consulter les opportunités</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── 2. METRICS BAR ── */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px 24px' }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, textAlign: 'center' }}>
            {[
              { num: '98.4%', label: 'Précision du matching' },
              { num: '500+', label: 'Entreprises partenaires' },
              { num: '1 200+', label: 'Talents qualifiés' },
              { num: '< 24h', label: 'Temps moyen de réponse' },
            ].map((m) => (
              <div key={m.label}>
                <div className="grad-text" style={{ fontSize: 38, fontWeight: 900, fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                  {m.num}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section style={{ padding: '90px 24px' }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-title" style={{ color: 'var(--accent)' }}>Workflow Optimisé</div>
            <h2 style={{ fontSize: 36 }}>Comment fonctionne <span className="grad-text">StageMatch ?</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            {[
              { 
                step: '01', 
                title: 'Extraction du CV & Compétences', 
                desc: 'Importez votre document. Notre analyseur extrait précisément vos compétences techniques et domaines d\'expertise.',
                icon: FileCheck
              },
              { 
                step: '02', 
                title: 'Algorithme de Similarité', 
                desc: 'Notre moteur compare mathématiquement les vecteurs du profil aux critères des recruteurs pour générer un score de compatibilité.',
                icon: Cpu
              },
              { 
                step: '03', 
                title: 'Candidature & Suivi Réseau', 
                desc: 'Postulez directement auprès des entreprises cibles et suivez chaque statut de candidature en temps réel.',
                icon: TrendingUp
              }
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="card" style={{ position: 'relative', overflow: 'hidden', padding: 36 }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: 'rgba(255,255,255,0.05)', fontFamily: 'Outfit, sans-serif', position: 'absolute', top: 16, right: 20 }}>
                    {s.step}
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: 20 }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. CTA BANNER ── */}
      <section style={{ padding: '60px 24px 100px' }}>
        <div className="container" style={{ padding: 0 }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(244, 63, 94, 0.15) 100%)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
            textAlign: 'center',
            padding: '60px 32px'
          }}>
            <h2 style={{ fontSize: 36, marginBottom: 16 }}>Prêt à accélérer vos opportunités ?</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 32px' }}>
              Rejoignez les étudiants et recruteurs qui font confiance à StageMatch pour leurs opportunités de stage et de premier emploi.
            </p>
            <Link to="/register" className="btn btn--primary" style={{ fontSize: 16, padding: '16px 36px' }}>
              <span>Démarrer dès maintenant</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
