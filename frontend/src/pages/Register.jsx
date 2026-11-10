import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { GraduationCap, Building2, Mail, Lock, Building, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="page--center">
      <div className="auth animate-in">
        <div className="auth__head">
          <h1>Inscription</h1>
          <p>Rejoignez la plateforme de mise en relation StageMatch</p>
        </div>

        <div className="role-switch" role="group" aria-label="Type de compte">
          <button
            type="button"
            onClick={() => setRole('student')}
            aria-pressed={role === 'student'}
            className={role === 'student' ? 'role-btn--active' : ''}
          >
            <GraduationCap size={16} />
            <span>Candidat Étudiant</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('company')}
            aria-pressed={role === 'company'}
            className={role === 'company' ? 'role-btn--active' : ''}
          >
            <Building2 size={16} />
            <span>Entreprise / Recruteur</span>
          </button>
        </div>

        <div className="card card--pad">
          {error && <div className="error-banner">{error}</div>}
          {role === 'company' && (
            <div className="info-banner">
              <ShieldAlert size={18} />
              <span>Votre compte entreprise sera examiné par l'équipe administrative avant validation de publication.</span>
            </div>
          )}
          <form onSubmit={onSubmit}>
            {role === 'company' && (
              <div className="field">
                <label htmlFor="companyName"><span className="field__label"><Building size={13} /> Nom de l'entreprise</span></label>
                <input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex : Orange Digital Center, Axian Group…"
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">
                <span className="field__label">
                  <Mail size={13} /> {role === 'student' ? 'Email étudiant / universitaire' : 'Email professionnel RH'}
                </span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'student' ? 'etudiant@univ.mg' : 'recrutement@entreprise.mg'}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">
                <span className="field__label"><Lock size={13} /> Mot de passe (8 caractères minimum)</span>
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="input-adornment-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--block mt" disabled={loading}>
              <span>{loading ? 'Création du compte…' : 'Créer mon compte'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        <p className="auth__foot">
          Vous disposez déjà d'un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
