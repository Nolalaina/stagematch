import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import MatchRing from '../components/MatchRing.jsx';
import { Building2, MapPin, Clock, Globe, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

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
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement de l'offre…</span></div></div>
  );

  if (error && !offer) return (
    <div className="container page center">
      <div className="error-banner">{error}</div>
      <Link to="/internships" className="btn btn--outline"><ArrowLeft size={16} /><span>Retour aux offres</span></Link>
    </div>
  );

  return (
    <div className="container page">
      <Link to="/internships" className="btn btn--ghost btn--sm mb"><ArrowLeft size={15} /><span>Retour au catalogue des offres</span></Link>

      <div className="dash-grid">
        <div className="card card--pad animate-in">
          <div className="meta mb"><span><Building2 size={16} /> {offer.company_name} {offer.sector && `· ${offer.sector}`}</span></div>
          <h1 className="mb">{offer.title}</h1>
          <div className="gap-row--sm mb">
            {offer.location && <span className="tag"><MapPin size={13} /> {offer.location}</span>}
            {offer.duration_weeks && <span className="tag"><Clock size={13} /> {offer.duration_weeks} semaines</span>}
            <span className={`tag ${offer.is_remote ? 'tag--success' : ''}`}><Globe size={13} /> {offer.is_remote ? 'Télétravail possible' : 'Présentiel'}</span>
          </div>
          <hr className="divider" />
          <h2 className="mb">Description du poste</h2>
          <p className="muted mb">{offer.description}</p>
          <h2 className="mb">Compétences requises</h2>
          <div className="gap-row--sm">
            {offer.skills?.length
              ? offer.skills.map((s) => <span key={s.id} className="tag">{s.name}</span>)
              : <span className="muted">Aucune compétence spécifique requise</span>}
          </div>
        </div>

        {user?.role === 'student' && (
          <aside className="card card--pad animate-in">
            {recoScore != null ? (
              <div className="profile-head">
                <div className="section-title">Score d'adéquation profil</div>
                <MatchRing score={recoScore} size={140} />
              </div>
            ) : (
              <p className="muted mb">Calcul du score de matching en cours…</p>
            )}
            {error && <div className="error-banner">{error}</div>}
            {applied ? (
              <div className="success-banner success-banner--center"><CheckCircle2 size={18} /><span>Candidature transmise avec succès</span></div>
            ) : (
              <button className="btn btn--primary btn--block" disabled={applying} onClick={onApply}>
                <Send size={16} /><span>{applying ? 'Envoi du dossier…' : 'Postuler en un clic'}</span>
              </button>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
