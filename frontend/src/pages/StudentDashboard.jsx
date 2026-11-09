import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import MatchRing from '../components/MatchRing.jsx';
import { MapPin, Target, Building2, User, BookOpen, ArrowRight, Globe, FileText } from 'lucide-react';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyStudentProfile(), api.getRecommendations()])
      .then(([p, recos]) => { setProfile(p); setRecommendations(recos); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement de vos recommandations…</span></div></div>
  );

  const initials = (profile?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="container page">
      <div className="split">
        <aside>
          <div className="card card--pad">
            <div className="profile-head">
              <div className="avatar">{initials}</div>
              <h2>{profile?.full_name}</h2>
              <div className="meta"><span><BookOpen size={14} /> {profile?.field_of_study || 'Filière non renseignée'}</span></div>
            </div>
            <hr className="divider" />
            <div className="section-title">Compétences clés</div>
            <div className="gap-row--sm mb">
              {profile?.skills?.length
                ? profile.skills.map((s) => <span key={s.id} className="tag">{s.name}</span>)
                : <span className="muted">Aucune compétence renseignée</span>}
            </div>
            {profile?.location && (
              <div className="meta mb"><span><MapPin size={14} /> {profile.location} {profile.accepts_remote ? '· Télétravail OK' : ''}</span></div>
            )}
            <Link to="/student/profile" className="btn btn--outline btn--block"><User size={15} /><span>Modifier le profil</span></Link>
            <Link to="/student/applications" className="btn btn--ghost btn--block mt"><FileText size={14} /><span>Mes candidatures</span></Link>
          </div>
        </aside>

        <main>
          <div className="page__head">
            <h1>Recommandations sur-mesure</h1>
            <p>{recommendations.length} offre{recommendations.length !== 1 ? 's' : ''} analysée{recommendations.length !== 1 ? 's' : ''} et classée{recommendations.length !== 1 ? 's' : ''} par score d'adéquation</p>
          </div>
          {error && <div className="error-banner">{error}</div>}
          {!recommendations.length && (
            <div className="card empty-state">
              <p>Complétez votre profil et ajoutez des compétences pour débloquer l'analyse de matching.</p>
              <Link to="/student/profile" className="btn btn--primary"><span>Compléter mon profil</span><ArrowRight size={16} /></Link>
            </div>
          )}
          {recommendations.map((o) => (
            <Link key={o.internshipId} to={`/internships/${o.internshipId}`} className="offer-row">
              <MatchRing score={o.score} />
              <div className="offer-row__body">
                <h3>{o.title}</h3>
                <div className="meta mb">
                  <span><Building2 size={14} /> {o.company}</span>
                  {o.location && <span><MapPin size={14} /> {o.location}</span>}
                  {o.isRemote && <span className="tag tag--success"><Globe size={12} /> Télétravail</span>}
                </div>
                {o.missingSkills?.length > 0 && (
                  <div className="meta"><span><Target size={13} /> À développer : {o.missingSkills.join(', ')}</span></div>
                )}
              </div>
              <span className="btn btn--primary btn--sm"><span>Voir l'offre</span><ArrowRight size={14} /></span>
            </Link>
          ))}
        </main>
      </div>
    </div>
  );
}
