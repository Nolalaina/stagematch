import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin'} replace />;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', flexDirection: 'column' }}>

      {/* ── 1. HERO SECTION ── */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Hero Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.15))',
            border: '1px solid rgba(129,140,248,0.3)',
            borderRadius: 99,
            padding: '8px 20px',
            fontSize: 13,
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: 32,
            boxShadow: '0 0 20px rgba(129,140,248,0.15)'
          }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'spin 2s linear infinite' }} />
            Plateforme IA de Match-Making Étudiant / Entreprise
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            marginBottom: 24
          }}>
            Le matching intelligent qui trouve{' '}
            <span className="grad-text">votre stage idéal</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: 640,
            margin: '0 auto 44px',
            lineHeight: 1.6
          }}>
            Analyse de vos compétences par algorithme TF-IDF et calcul cosinus pour une mise en relation ultra-précise avec les meilleures entreprises.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <Link to="/register" className="btn btn--primary" style={{ fontSize: 16, padding: '16px 36px', borderRadius: 'var(--radius-md)' }}>
              Commencer maintenant →
            </Link>
            <Link to="/internships" className="btn btn--outline" style={{ fontSize: 16, padding: '16px 36px', borderRadius: 'var(--radius-md)' }}>
              Explorer les offres
            </Link>
          </div>

        </div>
      </section>

      {/* ── 2. METRICS BAR ── */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '36px 24px' }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
            {[
              { num: '98%', label: 'Précision du matching' },
              { num: '500+', label: 'Offres actives' },
              { num: '1 200+', label: 'Étudiants inscrits' },
              { num: '< 24h', label: 'Délai moyen de réponse' },
            ].map((m) => (
              <div key={m.label}>
                <div className="grad-text" style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Playfair Display, serif', marginBottom: 4 }}>
                  {m.num}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container" style={{ padding: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-title" style={{ color: 'var(--accent)' }}>Workflow Simplifié</div>
            <h2 style={{ fontSize: 36 }}>Comment fonctionne <span className="grad-text">StageMatch ?</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
            {[
              { step: '01', title: 'Importation du CV', desc: 'Importez votre CV. Notre parseur extrait automatiquement toutes vos compétences techniques et relationnelles.' },
              { step: '02', title: 'Matching Algorithmique', desc: 'L\'algorithme TF-IDF compare votre profil aux exigences des offres et calcule un score de compatibilité en %.' },
              { step: '03', title: 'Candidature & Suivi', desc: 'Postulez en un clic et suivez les mises à jour de statut avec notifications en temps réel.' }
            ].map((s) => (
              <div key={s.step} className="card" style={{ position: 'relative', overflow: 'hidden', padding: 36 }}>
                <div style={{ fontSize: 44, fontWeight: 800, color: 'rgba(129,140,248,0.15)', fontFamily: 'Playfair Display, serif', position: 'absolute', top: 16, right: 20 }}>
                  {s.step}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(129,140,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--accent)', marginBottom: 20 }}>
                  {s.step === '01' ? '📄' : s.step === '02' ? '⚡' : '🚀'}
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CTA BANNER ── */}
      <section style={{ padding: '60px 24px 100px' }}>
        <div className="container" style={{ padding: 0 }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(236,72,153,0.15) 100%)',
            borderColor: 'rgba(129,140,248,0.3)',
            textAlign: 'center',
            padding: '60px 32px'
          }}>
            <h2 style={{ fontSize: 36, marginBottom: 16 }}>Prêt à dénicher votre futur stage ?</h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px' }}>
              Rejoignez des centaines d'étudiants qui ont trouvé leur opportunité grâce à StageMatch.
            </p>
            <Link to="/register" className="btn btn--primary" style={{ fontSize: 16, padding: '15px 36px' }}>
              Créer mon compte gratuitement →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
