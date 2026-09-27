import { Link } from 'react-router-dom';
import { Sparkles, Globe, Shield, Lock, ExternalLink } from 'lucide-react';

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
            <Link to="/" className="wordmark" style={{ fontSize: 24, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--grad-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Sparkles size={16} />
              </div>
              StageMatch
            </Link>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
              Plateforme SaaS de mise en relation intelligente entre candidats et recruteurs. Algorithme propriétaire de matching prédictif et d'analyse de compétences.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 14 }}>Plateforme</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <li><Link to="/internships" style={{ color: 'var(--text-secondary)' }}>Offres de stages</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>Espace Connexion</Link></li>
              <li><Link to="/register" style={{ color: 'var(--text-secondary)' }}>Créer un compte</Link></li>
            </ul>
          </div>

          {/* Col 3: Solutions */}
          <div>
            <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 14 }}>Solutions</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <li><Link to="/student" style={{ color: 'var(--text-secondary)' }}>Portail Candidat</Link></li>
              <li><Link to="/company" style={{ color: 'var(--text-secondary)' }}>Portail Recruteur</Link></li>
              <li><Link to="/admin" style={{ color: 'var(--text-secondary)' }}>Console d'Administration</Link></li>
            </ul>
          </div>

          {/* Col 4: Infra & Domain */}
          <div>
            <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: 14 }}>Infrastructure &amp; Securité</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {['TF-IDF Engine', 'Vector Math', 'Enterprise Auth', 'SaaS Core', 'TLS Encrypted'].map(tech => (
                <span key={tech} className="tag" style={{ fontSize: 11, padding: '3px 10px' }}>{tech}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={14} /> Domain officiel : <a href="https://stagematch.io" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>stagematch.io</a>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          fontSize: 13,
          color: 'var(--text-muted)'
        }}>
          <div>© 2026 StageMatch Technologies Inc. Tous droits réservés.</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }}>Confidentialité</span>
            <span>·</span>
            <span style={{ cursor: 'pointer' }}>Conditions d'utilisation</span>
            <span>·</span>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={13} style={{ color: 'var(--success)' }} /> Sécurisé SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
