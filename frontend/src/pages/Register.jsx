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
    <div className="page--center">
      <div className="auth animate-in">
        <div className="auth__head">
          <h1>Créer un compte StageMatch</h1>
          <p>Rejoignez le réseau de recrutement de référence</p>
        </div>

        <div className="role-switch" role="group" aria-label="Type de compte">
          <button type="button" onClick={() => setRole('student')} aria-pressed={role === 'student'}><GraduationCap size={16} /><span>Candidat Étudiant</span></button>
          <button type="button" onClick={() => setRole('company')} aria-pressed={role === 'company'}><Building2 size={16} /><span>Entreprise / RH</span></button>
        </div>

        <div className="card card--pad">
          {error && <div className="error-banner">{error}</div>}
          {role === 'company' && (
            <div className="info-banner"><ShieldAlert size={18} /><span>Votre compte entreprise sera soumis à une vérification administrative avant publication.</span></div>
          )}
          <form onSubmit={onSubmit}>
            {role === 'company' && (
              <div className="field">
                <label htmlFor="companyName"><span className="field__label"><Building size={13} /> Nom de l'organisation</span></label>
                <input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex : Orange Digital Center" required />
              </div>
            )}
            <div className="field">
              <label htmlFor="email"><span className="field__label"><Mail size={13} /> Email {role === 'student' ? 'professionnel / universitaire' : 'professionnel RH'}</span></label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@domaine.com" required />
            </div>
            <div className="field">
              <label htmlFor="password"><span className="field__label"><Lock size={13} /> Mot de passe (8 caractères min.)</span></label>
              <input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              <span>{loading ? 'Création en cours…' : 'Créer mon compte'}</span><ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="auth__foot">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}
