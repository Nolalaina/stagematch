import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'rgba(8, 11, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '48px 32px 32px',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{ padding: 0 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
          marginBottom: 40
        }}>
          {/* Col 1: Brand */}
          <div>
            <Link to="/" className="wordmark" style={{ fontSize: 24, display: 'inline-block', marginBottom: 12 }}>
              StageMatch
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
              La plateforme intelligente de mise en relation étudiants/entreprises basée sur l'algorithme TF-IDF &amp; la similarité cosinus.
            </p>
          </div>

          {/* Col 2: Navigation rapide */}
          <div>
            <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 14 }}>Navigation</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <li><Link to="/internships" style={{ color: 'var(--text-secondary)' }}>Explorer les stages</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>Connexion</Link></li>
              <li><Link to="/register" style={{ color: 'var(--text-secondary)' }}>Inscription Étudiant / Entreprise</Link></li>
            </ul>
          </div>

          {/* Col 3: Rôles & Espaces */}
          <div>
            <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 14 }}>Espaces</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <li><Link to="/student" style={{ color: 'var(--text-secondary)' }}>Espace Étudiant</Link></li>
              <li><Link to="/company" style={{ color: 'var(--text-secondary)' }}>Espace Entreprise</Link></li>
              <li><Link to="/admin" style={{ color: 'var(--text-secondary)' }}>Administration</Link></li>
            </ul>
          </div>

          {/* Col 4: Innovation & Stack */}
          <div>
            <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 14 }}>Technologies</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['React', 'Vite', 'Node.js', 'Express', 'MySQL', 'TF-IDF', 'JWT'].map(tech => (
                <span key={tech} className="tag" style={{ fontSize: 11, padding: '3px 10px' }}>{tech}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 24,
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 13,
          color: 'var(--text-muted)'
        }}>
          <div>© 2026 StageMatch — Licence 3 Génie Logiciel. Tous droits réservés.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span style={{ color: 'var(--accent)' }}>v2.0 Dark Glass</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
