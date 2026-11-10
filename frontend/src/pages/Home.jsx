import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import MatchRing from '../components/MatchRing.jsx';
import { Building2, MapPin, Globe, Sparkles, Check, ArrowRight, UserPlus, Search, Compass, BookOpen } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [recentOffers, setRecentOffers] = useState([]);

  useEffect(() => {
    api.getInternships({ limit: 3 })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRecentOffers(data.slice(0, 3));
        }
      })
      .catch(() => { });
  }, []);

  if (user) {
    return <Navigate to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin'} replace />;
  }

  return (
    <div className="app-shell">
      {/* ── 1. HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="grid grid--2">
            <div className="hero__head">
              <h1>Des stages qui vous correspondent</h1>
              <p className="lead">Déposez votre profil et laissez le matching intelligent cibler les offres adaptées à vos compétences.</p>
              <div className="hero__actions">
                <Link to="/register" className="btn btn--primary">
                  <span>Créer mon profil</span>
                  <ArrowRight size={15} />
                </Link>
                <Link to="/internships" className="btn btn--outline">
                  <span>Voir les offres</span>
                </Link>
              </div>
            </div>

            {/* Signature : Interface de matching dans le slot */}
            <div className="hero__slot-wrap">
              <div className="matching-preview" aria-label="Aperçu du moteur d'affinité">
                <div className="matching-preview__header">
                  <span className="matching-preview__badge">
                    <Sparkles size={13} />
                    <span>Algorithme prédictif</span>
                  </span>
                  <span className="tag tag--success">Affinité optimale</span>
                </div>

                <div className="matching-preview__body">
                  <div className="matching-preview__target">
                    <div className="matching-preview__company">
                      <Building2 size={16} />
                      <span>Orange Digital Center</span>
                    </div>
                    <div className="matching-preview__role">Développeur Web Full-Stack</div>
                    <div className="meta">
                      <span><MapPin size={13} /> Antananarivo</span>
                      <span className="tag tag--success"><Globe size={11} /> Télétravail</span>
                    </div>
                  </div>

                  <div className="matching-preview__score-box">
                    <MatchRing score={94} size={74} />
                    <div className="matching-preview__score-meta">
                      <div className="score-label">Indice de compatibilité</div>
                      <div className="score-desc">3 compétences clés validées</div>
                    </div>
                  </div>

                  <div className="matching-preview__skills">
                    <span className="tag tag--active"><Check size={12} /> React</span>
                    <span className="tag tag--active"><Check size={12} /> Node.js</span>
                    <span className="tag tag--active"><Check size={12} /> SQL</span>
                    <span className="tag">Docker</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. COMMENT ÇA MARCHE ── */}
      <section className="section section--tight">
        <div className="container">
          <h2 className="section-title">Comment fonctionne StageMatch</h2>
          <div className="grid grid--3">
            <div className="card step-card">
              <div className="step-num">01</div>
              <h3>Créez votre profil</h3>
              <p>Renseignez vos filières d'études, vos technologies de prédilection et téléversez votre CV.</p>
            </div>
            <div className="card step-card">
              <div className="step-num">02</div>
              <h3>Matching automatisé</h3>
              <p>Notre algorithme calcule un score de pertinence entre vos aptitudes et les exigences des recruteurs.</p>
            </div>
            <div className="card step-card">
              <div className="step-num">03</div>
              <h3>Postulez en un clic</h3>
              <p>Envoyez votre candidature instantanément et suivez en temps réel l'évaluation de votre dossier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. OFFRES EN LIGNE ── */}
      <section className="section">
        <div className="container">
          <div className="dash-head">
            <div>
              <h2 className="section-title">Dernières opportunités</h2>
              <p className="muted">Stages récents ouverts aux candidatures étudiantes</p>
            </div>
            <Link to="/internships" className="btn btn--outline btn--sm">
              <span>Toutes les offres</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid--3">
            {recentOffers.length > 0 ? (
              recentOffers.map((offer) => (
                <article key={offer.id} className="card offer-preview-card">
                  <div className="offer-preview-card__head">
                    <span className="company-chip"><Building2 size={13} /> {offer.company_name}</span>
                    {offer.is_remote && <span className="tag tag--success"><Globe size={11} /> Télétravail</span>}
                  </div>
                  <h3>{offer.title}</h3>
                  <div className="meta mb">
                    {offer.location && <span><MapPin size={13} /> {offer.location}</span>}
                    {offer.duration_weeks && <span>{offer.duration_weeks} semaines</span>}
                  </div>
                  <div className="offer-preview-card__foot">
                    <Link to={`/internships/${offer.id}`} className="btn btn--outline btn--sm btn--block">
                      <span>Consulter l'offre</span>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              [
                { id: 1, title: 'Développement Web Junior', company: 'Orange Digital Center', loc: 'Antananarivo', dur: '12 semaines', remote: true },
                { id: 2, title: 'Analyste Data & Décisionnel', company: 'BNI Madagascar', loc: 'Antananarivo', dur: '16 semaines', remote: false },
                { id: 3, title: 'Support & DevOps Cloud', company: 'Axian Group', loc: 'Antananarivo', dur: '24 semaines', remote: true },
              ].map((item) => (
                <article key={item.id} className="card offer-preview-card">
                  <div className="offer-preview-card__head">
                    <span className="company-chip"><Building2 size={13} /> {item.company}</span>
                    {item.remote && <span className="tag tag--success"><Globe size={11} /> Télétravail</span>}
                  </div>
                  <h3>{item.title}</h3>
                  <div className="meta mb">
                    <span><MapPin size={13} /> {item.loc}</span>
                    <span>{item.dur}</span>
                  </div>
                  <div className="offer-preview-card__foot">
                    <Link to="/internships" className="btn btn--outline btn--sm btn--block">
                      <span>Explorer les stages</span>
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
