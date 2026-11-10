import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import MatchRing from '../components/MatchRing.jsx';
import { MapPin, Target, Building2, User, BookOpen, ArrowRight, Globe, FileText, CheckCircle2 } from 'lucide-react';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyStudentProfile(), api.getRecommendations()])
      .then(([p, recos]) => { setProfile(p); setRecommendations(recos || []); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Analyse des offres et calcul de vos scores de matching…</span></div></div>
  );

  const initials = (profile?.full_name || '?').trim().split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ET';

  return (
    <div className="container page">
      <div className="split">
        <aside>
          <div className="card card--pad profile-summary-card animate-in">
            <div className="profile-head">
              <div className="avatar">{initials}</div>
              <h2>{profile?.full_name || 'Profil Candidat'}</h2>
              <div className="meta">
                <span><BookOpen size={14} /> {profile?.field_of_study || 'Filière non renseignée'}</span>
              </div>
            </div>

            <hr className="divider" />

            <div className="card-section">
              <div className="card-label">Compétences déclarées</div>
              <div className="gap-row--sm mb">
                {profile?.skills?.length
                  ? profile.skills.map((s) => <span key={s.id} className="tag tag--active">{s.name}</span>)
                  : <span className="muted">Aucune compétence ajoutée</span>}
              </div>
            </div>

            <div className="card-section">
              <div className="meta mb">
                {profile?.location && <span><MapPin size={14} /> {profile.location}</span>}
                {profile?.accepts_remote && <span className="tag tag--success"><Globe size={11} /> Télétravail</span>}
              </div>
            </div>

            <div className="stack--sm">
              <Link to="/student/profile" className="btn btn--primary btn--sm btn--block">
                <User size={14} />
                <span>Mettre à jour mon profil &amp; CV</span>
              </Link>
              <Link to="/student/applications" className="btn btn--outline btn--sm btn--block">
                <FileText size={14} />
                <span>Mes candidatures</span>
              </Link>
            </div>
          </div>
        </aside>

        <main>
          <div className="page__head">
            <h1>Recommandations sur-mesure</h1>
            <p>
              {recommendations.length > 0
                ? `${recommendations.length} offre${recommendations.length !== 1 ? 's' : ''} classée${recommendations.length !== 1 ? 's' : ''} par score d'adéquation prédictif`
                : "Optimisez vos compétences pour débloquer les offres correspondantes"}
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {!recommendations.length && (
            <div className="card empty-state animate-in">
              <p>Votre profil est en attente de compétences pour calculer les recommandations personnalisées.</p>
              <Link to="/student/profile" className="btn btn--primary">
                <span>Compléter mes compétences</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}

          <div className="stack">
            {recommendations.map((o) => (
              <Link key={o.internshipId} to={`/internships/${o.internshipId}`} className="offer-row animate-in">
                <MatchRing score={o.score} size={76} />
                <div className="offer-row__body">
                  <h3>{o.title}</h3>
                  <div className="meta mb">
                    <span><Building2 size={14} /> {o.company}</span>
                    {o.location && <span><MapPin size={14} /> {o.location}</span>}
                    {o.isRemote && <span className="tag tag--success"><Globe size={11} /> Télétravail</span>}
                  </div>
                  {o.missingSkills?.length > 0 && (
                    <div className="missing-skills-wrap">
                      <span className="missing-skills-label"><Target size={13} /> À développer :</span>
                      <div className="gap-row--sm">
                        {o.missingSkills.map((sk, idx) => (
                          <span key={idx} className="tag tag--warning-soft">{sk}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="offer-row__cta">
                  <span className="btn btn--outline btn--sm">
                    <span>Voir le poste</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
