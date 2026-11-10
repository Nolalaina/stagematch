import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import MatchRing from '../components/MatchRing.jsx';
import { Building2, MapPin, Clock, Globe, ArrowLeft, Send, CheckCircle2, Briefcase, Sparkles, LogIn } from 'lucide-react';

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
      }).catch(() => { });
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
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement des détails de l'offre…</span></div></div>
  );

  if (error && !offer) return (
    <div className="container page center">
      <div className="card card--pad">
        <div className="error-banner mb">{error}</div>
        <Link to="/internships" className="btn btn--outline">
          <ArrowLeft size={15} />
          <span>Retour au catalogue des offres</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <div className="mb">
        <Link to="/internships" className="btn btn--ghost btn--sm">
          <ArrowLeft size={14} />
          <span>Retour au catalogue des offres</span>
        </Link>
      </div>

      <div className="dash-grid">
        {/* ── COLONNE GAUCHE : DÉTAILS DE L'OFFRE ── */}
        <div className="card card--pad animate-in">
          <div className="meta mb">
            <span><Building2 size={16} /> <strong>{offer.company_name}</strong></span>
            {offer.sector && <span className="tag">{offer.sector}</span>}
          </div>

          <h1 className="mb">{offer.title}</h1>

          <div className="gap-row--sm mb">
            {offer.location && <span className="tag"><MapPin size={13} /> {offer.location}</span>}
            {offer.duration_weeks && <span className="tag"><Clock size={13} /> {offer.duration_weeks} semaines</span>}
            <span className={`tag ${offer.is_remote ? 'tag--success' : ''}`}>
              <Globe size={13} />
              <span>{offer.is_remote ? 'Télétravail autorisé' : 'Présentiel'}</span>
            </span>
          </div>

          <hr className="divider" />

          <div className="offer-body-section">
            <h2 className="mb">Missions et description du poste</h2>
            <div className="offer-description-text">
              <p>{offer.description}</p>
            </div>
          </div>

          <hr className="divider" />

          <div className="offer-body-section">
            <h2 className="mb">Compétences recherchées</h2>
            <div className="gap-row--sm">
              {offer.skills?.length
                ? offer.skills.map((s) => <span key={s.id} className="tag tag--active">{s.name}</span>)
                : <span className="muted">Aucune compétence spécifique répertoriée</span>}
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE : MODULE CANDIDATURE & MATCHING ── */}
        <aside className="animate-in">
          <div className="card card--pad sticky-card">
            {user?.role === 'student' ? (
              <>
                <div className="matching-score-aside">
                  <div className="card-label">Adéquation avec votre profil</div>
                  {recoScore != null ? (
                    <div className="score-ring-wrap">
                      <MatchRing score={recoScore} size={110} />
                      <div className="score-summary">
                        <span className="score-rate">
                          {recoScore >= 70 ? 'Forte affinité profil' : recoScore >= 40 ? 'Adéquation modérée' : 'Compétences à consolider'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="info-banner">
                      <Sparkles size={15} />
                      <span>Complétez votre profil pour obtenir le calcul automatique de votre score d'affinité.</span>
                    </div>
                  )}
                </div>

                <hr className="divider" />

                {error && <div className="error-banner mb">{error}</div>}

                {applied ? (
                  <div className="success-banner success-banner--center">
                    <CheckCircle2 size={18} />
                    <span>Votre candidature a été transmise au recruteur avec succès !</span>
                  </div>
                ) : (
                  <button className="btn btn--primary btn--block" disabled={applying} onClick={onApply}>
                    <Send size={15} />
                    <span>{applying ? 'Transmission du dossier…' : 'Postuler en un clic'}</span>
                  </button>
                )}
              </>
            ) : !user ? (
              <div className="guest-apply-cta">
                <div className="card-section mb">
                  <h3>Intéressé par ce stage ?</h3>
                  <p className="muted">Connectez-vous avec un compte étudiant pour postuler et évaluer votre compatibilité.</p>
                </div>
                <Link to="/login" className="btn btn--primary btn--block mb">
                  <LogIn size={15} />
                  <span>Se connecter</span>
                </Link>
                <Link to="/register" className="btn btn--outline btn--block">
                  <span>Créer mon profil candidat</span>
                </Link>
              </div>
            ) : (
              <div className="company-view-cta">
                <div className="card-section">
                  <h3>Aperçu recruteur</h3>
                  <p className="muted">Cette fiche est actuellement visible par les candidats étudiants inscrits sur StageMatch.</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
