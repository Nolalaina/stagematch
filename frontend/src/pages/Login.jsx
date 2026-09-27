import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, Building2, ShieldCheck, UserCheck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

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
      <div style={{ width: '100%', maxWidth: 460 }} className="animate-in">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            Connexion <span className="grad-text">StageMatch</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Accédez à votre espace sécurisé
          </p>
        </div>

        {/* Demo Credentials Quick Fill */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, background: 'rgba(139, 92, 246, 0.05)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <div className="section-title" style={{ color: 'var(--accent)', marginBottom: 10, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} /> Accès rapide environnement de test
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={() => fillDemo('company')}
              style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Building2 size={13} /> Entreprise
            </button>
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={() => fillDemo('student')}
              style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <UserCheck size={13} /> Étudiant
            </button>
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={() => fillDemo('admin')}
              style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <ShieldCheck size={13} /> Admin
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} /> Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} /> Mot de passe
              </label>
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
              style={{ width: '100%', marginTop: 8, padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={loading}
            >
              <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 20 }}>
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
