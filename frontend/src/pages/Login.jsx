import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login({ email, password });
      login(token, user);
      navigate(user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(type) {
    if (type === 'admin') {
      setEmail('admin@stagematch.mg');
      setPassword('Password123!');
    } else if (type === 'company') {
      setEmail('rh@orangedigitalcenter.mg');
      setPassword('Password123!');
    } else if (type === 'student') {
      setEmail('etudiant@demo.mg');
      setPassword('Password123!');
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeInUp 0.4s ease forwards' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>
            Connexion <span className="grad-text">StageMatch</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Demo Credentials Quick Fill Pills */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, background: 'rgba(129,140,248,0.06)', borderColor: 'rgba(129,140,248,0.2)' }}>
          <div className="section-title" style={{ color: 'var(--accent)', marginBottom: 8, fontSize: 11 }}>
            ⚡ Comptes de démonstration rapide
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={() => fillDemo('company')}
              style={{ fontSize: 12 }}
            >
              🏢 Entreprise Démo
            </button>
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={() => fillDemo('admin')}
              style={{ fontSize: 12 }}
            >
              👑 Admin Démo
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary"
              style={{ width: '100%', marginTop: 8, padding: '13px' }}
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
