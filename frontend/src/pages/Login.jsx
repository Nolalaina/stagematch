import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Building2, ShieldCheck, UserCheck, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

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
    if (type === 'admin') { setEmail('admin@stagematch.mg'); setPassword('Password123!'); }
    else if (type === 'company') { setEmail('rh@orangedigitalcenter.mg'); setPassword('Password123!'); }
    else { setEmail('etudiant@demo.mg'); setPassword('Password123!'); }
  }

  return (
    <div className="page--center">
      <div className="auth animate-in">
        <div className="auth__head">
          <h1>Connexion StageMatch</h1>
          <p>Accédez à votre espace sécurisé</p>
        </div>

        <div className="card card--pad mb">
          <div className="field__label mb"><Sparkles size={13} /> Accès rapide environnement de test</div>
          <div className="gap-row--sm">
            <button type="button" className="btn btn--outline btn--xs" onClick={() => fillDemo('company')}><Building2 size={13} /> Entreprise</button>
            <button type="button" className="btn btn--outline btn--xs" onClick={() => fillDemo('student')}><UserCheck size={13} /> Étudiant</button>
            <button type="button" className="btn btn--outline btn--xs" onClick={() => fillDemo('admin')}><ShieldCheck size={13} /> Admin</button>
          </div>
        </div>

        <div className="card card--pad">
          {error && <div className="error-banner">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email"><span className="field__label"><Mail size={13} /> Adresse email</span></label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@entreprise.com" required />
            </div>
            <div className="field">
              <label htmlFor="password"><span className="field__label"><Lock size={13} /> Mot de passe</span></label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              <span>{loading ? 'Connexion en cours…' : 'Se connecter'}</span><ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="auth__foot">Vous n'avez pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
      </div>
    </div>
  );
}
