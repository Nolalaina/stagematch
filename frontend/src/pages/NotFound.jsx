import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 72, fontWeight: 800, fontFamily: 'Playfair Display, serif' }} className="grad-text">
        404
      </div>
      <h1 style={{ fontSize: 28, marginTop: 12, marginBottom: 16 }}>Page introuvable</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 420, marginBottom: 32 }}>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn btn--primary">
        ← Retourner à l'accueil
      </Link>
    </div>
  );
}
