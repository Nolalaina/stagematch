import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { GraduationCap, Building2, Mail, Lock, Building, ArrowRight, ShieldAlert } from 'lucide-react';

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
      <div style={{ width: '100%', maxWidth: 460 }} className="animate-in">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>
            Créer un compte <span className="grad-text">StageMatch</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Rejoignez le réseau de recrutement de référence
          </p>
        </div>

        {/* Role Switch */}
        <div style={{ display: 'flex', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            style={{
              flex: 1,
              background: role === 'student' ? 'var(--grad-primary)' : 'transparent',
              border: 'none',
              borderRadius: 10,
              color: role === 'student' ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: role === 'student' ? '0 4px 15px rgba(139, 92, 246, 0.35)' : 'none',
            }}
          >
            <GraduationCap size={16} />
            <span>Candidat Étudiant</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('company')}
            style={{
              flex: 1,
              background: role === 'company' ? 'var(--grad-primary)' : 'transparent',
              border: 'none',
              borderRadius: 10,
              color: role === 'company' ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'Outfit, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              padding: '10px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: role === 'company' ? '0 4px 15px rgba(139, 92, 246, 0.35)' : 'none',
            }}
          >
            <Building2 size={16} />
            <span>Entreprise / RH</span>
          </button>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && <div className="error-banner">{error}</div>}

          {role === 'company' && (
            <div className="info-banner" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} />
              <span>Votre compte entreprise sera soumis à une vérification administrative avant publication.</span>
            </div>
          )}

          <form onSubmit={onSubmit}>
            {role === 'company' && (
              <div className="field">
                <label htmlFor="companyName" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building size={13} /> Nom de l'organisation
                </label>
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
              <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} /> Email {role === 'student' ? 'professionnel / universitaire' : 'professionnel RH'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@domaine.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} /> Mot de passe (8 caractères min.)
              </label>
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
              style={{ width: '100%', marginTop: 8, padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={loading}
            >
              <span>{loading ? 'Création en cours...' : 'Créer mon compte'}</span>
              <ArrowRight size={16} />
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
