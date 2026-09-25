import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.register({ email, password, role, companyName });
      login(token, user);
      navigate(role === 'student' ? '/student' : '/company');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeInUp 0.4s ease forwards' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, marginBottom: 10 }}>
            Créer un compte <span className="grad-text">✦</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Rejoignez la communauté StageMatch
          </p>
        </div>

        {/* Role Switch */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 24 }}>
          {[['student', '🎓 Étudiant'], ['company', '🏢 Entreprise']].map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setRole(val)}
              style={{
                flex: 1,
                background: role === val ? 'var(--grad-primary)' : 'transparent',
                border: 'none',
                borderRadius: 10,
                color: role === val ? '#fff' : 'var(--text-secondary)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: role === val ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && <div className="error-banner">{error}</div>}

          {role === 'company' && (
            <div className="info-banner" style={{ marginBottom: 20 }}>
              Votre compte devra être validé par un administrateur avant de publier des offres.
            </div>
          )}

          <form onSubmit={onSubmit}>
            {role === 'company' && (
              <div className="field">
                <label htmlFor="companyName">Nom de l'entreprise</label>
                <input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex : Orange Digital Center"
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">
                Email {role === 'student' ? '(universitaire de préférence)' : 'professionnel'}
              </label>
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
              <label htmlFor="password">Mot de passe (8 caractères min.)</label>
              <input
                id="password"
                type="password"
                minLength={8}
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
              {loading ? 'Création du compte...' : 'Créer mon compte →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }}>
          Déjà inscrit ?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
