import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import MatchRing from '../components/MatchRing.jsx';

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
    <div className="container">
      <div className="loading-page">
        <div className="spinner" />
        <span>Chargement de vos recommandations…</span>
      </div>
    </div>
  );

  const initials = (profile?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>

      {/* Sidebar profil */}
      <aside className="animate-in">
        <div className="card" style={{ padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: 22, margin: '0 auto 14px' }}>
              {initials}
            </div>
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>{profile?.full_name}</h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {profile?.field_of_study || 'Filière non renseignée'}
            </div>
          </div>

          <hr className="divider" />

          <div className="section-title">Compétences</div>
          <div style={{ marginBottom: 20 }}>
            {profile?.skills?.length
              ? profile.skills.map((s) => <span key={s.id} className="tag">{s.name}</span>)
              : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Aucune compétence renseignée</span>
            }
          </div>

          {profile?.location && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              📍 {profile.location} {profile.accepts_remote ? '· Télétravail OK' : ''}
            </div>
          )}

          <Link to="/student/profile" className="btn btn--outline" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
            Modifier le profil
          </Link>
          <Link to="/student/applications" className="btn btn--ghost" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
            Mes candidatures →
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 34, marginBottom: 8 }}>
            Recommandé <span className="grad-text">pour vous</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {recommendations.length} offre{recommendations.length !== 1 ? 's' : ''} triée{recommendations.length !== 1 ? 's' : ''} par compatibilité avec votre profil
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {!recommendations.length && (
          <div className="empty-state">
            <p>Complétez votre profil et ajoutez des compétences pour recevoir des recommandations personnalisées.</p>
            <Link to="/student/profile" className="btn btn--primary" style={{ marginTop: 16 }}>
              Compléter mon profil →
            </Link>
          </div>
        )}

        {recommendations.map((o, i) => (
          <Link
            key={o.internshipId}
            to={`/internships/${o.internshipId}`}
            className="offer-row animate-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <MatchRing score={o.score} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{o.title}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                🏢 {o.company}
                {o.location && ` · 📍 ${o.location}`}
                {o.isRemote && <span className="tag tag--success" style={{ marginLeft: 8 }}>Télétravail</span>}
              </div>
              {o.missingSkills?.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  🎯 À acquérir : {o.missingSkills.join(', ')}
                </div>
              )}
            </div>
            <span className="btn btn--primary btn--sm">Voir l'offre</span>
          </Link>
        ))}
      </main>
    </div>
  );
}
