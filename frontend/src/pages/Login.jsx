import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Building2, ShieldCheck, GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
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
    setActiveDemo(type);
    if (type === 'admin') {
      setEmail('admin@stagematch.mg');
      setPassword('Password123!');
    } else if (type === 'company') {
      setEmail('rh@orangedigitalcenter.mg');
      setPassword('Password123!');
    } else {
      setEmail('etudiant@demo.mg');
      setPassword('Password123!');
    }
  }

  return (
    <div className="page--center">
      <div className="auth animate-in">
        <div className="auth__head">
          <h1>Connexion</h1>
          <p>Accédez à votre espace StageMatch</p>
        </div>

        <div className="card card--pad mb">
          <div className="demo-panel__head">
            <span className="field__label"><Sparkles size={14} /> Profils de démonstration pré-configurés</span>
          </div>
          <div className="demo-grid">
            <button
              type="button"
              className={`demo-btn ${activeDemo === 'student' ? 'demo-btn--active' : ''}`}
              onClick={() => fillDemo('student')}
            >
              <GraduationCap size={15} />
              <div className="demo-btn__content">
                <span className="demo-btn__title">Étudiant</span>
                <span className="demo-btn__sub">etudiant@demo.mg</span>
              </div>
            </button>

            <button
              type="button"
              className={`demo-btn ${activeDemo === 'company' ? 'demo-btn--active' : ''}`}
              onClick={() => fillDemo('company')}
            >
              <Building2 size={15} />
              <div className="demo-btn__content">
                <span className="demo-btn__title">Entreprise</span>
                <span className="demo-btn__sub">rh@orangedigitalcenter.mg</span>
              </div>
            </button>

            <button
              type="button"
              className={`demo-btn ${activeDemo === 'admin' ? 'demo-btn--active' : ''}`}
              onClick={() => fillDemo('admin')}
            >
              <ShieldCheck size={15} />
              <div className="demo-btn__content">
                <span className="demo-btn__title">Admin</span>
                <span className="demo-btn__sub">admin@stagematch.mg</span>
              </div>
            </button>
          </div>
        </div>

        <div className="card card--pad">
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email"><span className="field__label"><Mail size={13} /> Adresse email</span></label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password"><span className="field__label"><Lock size={13} /> Mot de passe</span></label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="input-adornment-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--block mt" disabled={loading}>
              <span>{loading ? 'Connexion en cours…' : 'Se connecter'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        <p className="auth__foot">
          Vous n'avez pas encore de compte ? <Link to="/register">Créer un compte candidat ou entreprise</Link>
        </p>
      </div>
    </div>
  );
}
