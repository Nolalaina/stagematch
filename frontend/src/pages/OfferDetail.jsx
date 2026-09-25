import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import MatchRing from '../components/MatchRing.jsx';

export default function OfferDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [offer, setOffer] = useState(null);
  const [recoScore, setRecoScore] = useState(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getInternship(id)
      .then(setOffer)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    if (user?.role === 'student') {
      api.getRecommendations().then((list) => {
        const match = list.find((o) => String(o.internshipId) === id);
        if (match) setRecoScore(match.score);
      }).catch(() => {});
    }
  }, [id, user]);

  async function onApply() {
    setError('');
    setApplying(true);
    try {
      await api.applyToInternship(id);
      setApplied(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  }

  if (loading) return (
    <div className="container">
      <div className="loading-page"><div className="spinner" /><span>Chargement de l'offre…</span></div>
    </div>
  );

  if (error && !offer) return (
    <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="error-banner" style={{ maxWidth: 400, margin: '0 auto 20px' }}>{error}</div>
      <Link to="/internships" className="btn btn--outline">← Retour aux offres</Link>
    </div>
  );

  return (
    <div className="container">
      <Link to="/internships" className="btn btn--ghost" style={{ marginBottom: 24, fontSize: 13 }}>
        ← Retour aux offres
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'student' ? '1fr 340px' : '1fr', gap: 36, alignItems: 'start' }}>

        {/* Détails offre */}
        <div className="card animate-in" style={{ padding: 36 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 10 }}>
            🏢 {offer.company_name} {offer.sector && `· ${offer.sector}`}
          </div>
          <h1 style={{ fontSize: 34, marginBottom: 20, lineHeight: 1.2 }}>{offer.title}</h1>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {offer.location && <span className="tag">📍 {offer.location}</span>}
            {offer.duration_weeks && <span className="tag">⏱ {offer.duration_weeks} semaines</span>}
            <span className={`tag ${offer.is_remote ? 'tag--success' : ''}`}>
              {offer.is_remote ? '🌐 Télétravail possible' : '🏢 Présentiel'}
            </span>
          </div>

          <hr className="divider" />

          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Description du poste</h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 32, whitespace: 'pre-line' }}>
            {offer.description}
          </p>

          <h2 style={{ fontSize: 18, marginBottom: 14 }}>Compétences requises</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {offer.skills?.length
              ? offer.skills.map((s) => <span key={s.id} className="tag tag--active" style={{ fontSize: 13, padding: '6px 14px' }}>{s.name}</span>)
              : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Aucune compétence spécifique requise</span>
            }
          </div>
        </div>

        {/* Sidebar Candidature étudiant */}
        {user?.role === 'student' && (
          <aside className="card animate-in" style={{ textAlign: 'center', padding: 28, animationDelay: '80ms', position: 'sticky', top: 90 }}>
            {recoScore != null ? (
              <>
                <div className="section-title" style={{ marginBottom: 16 }}>Compatibilité Profil</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <MatchRing score={recoScore} size={140} />
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Score de compatibilité indisponible
              </div>
            )}

            {error && <div className="error-banner" style={{ fontSize: 13 }}>{error}</div>}

            {applied ? (
              <div className="success-banner" style={{ justifyContent: 'center' }}>
                ✓ Candidature envoyée !
              </div>
            ) : (
              <button
                className="btn btn--primary"
                style={{ width: '100%', padding: '14px' }}
                disabled={applying}
                onClick={onApply}
              >
                {applying ? 'Envoi en cours…' : '⚡ Postuler en un clic'}
              </button>
            )}
          </aside>
        )}

      </div>
    </div>
  );
}
