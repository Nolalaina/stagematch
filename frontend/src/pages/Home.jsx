import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin'} replace />;
  }

  return (
    <div className="app-shell">
      {/* ── 1. HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="grid grid--2">
            <div className="hero__head">
              <h1>Des stages qui vous correspondent</h1>
              <p className="lead">Déposez votre profil et laissez le matching vous proposer les offres adaptées.</p>
              <div className="hero__actions">
                <Link to="/register" className="btn btn--primary">Créer mon profil</Link>
                <Link to="/internships" className="btn btn--outline">Voir les offres</Link>
              </div>
            </div>
            <div className="hero__slot" data-slot="hero-matching" data-alt="Interface de matching StageMatch">
              <span className="visually-hidden">Aperçu du produit</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. COMMENT ÇA MARCHE ── */}
      <section className="section section--tight">
        <div className="container">
          <div className="section-title">Comment ça marche</div>
          <div className="grid grid--3">
            <div className="card">
              <h3>1. Créez votre profil</h3>
              <p>Renseignez vos compétences, vos études et le type de stage recherché.</p>
            </div>
            <div className="card">
              <h3>2. Recevez des offres</h3>
              <p>Le moteur compare votre profil aux attentes des recruteurs.</p>
            </div>
            <div className="card">
              <h3>3. Candidatez</h3>
              <p>Postulez directement et suivez vos candidatures en temps réel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. OFFRES RÉCENTES ── */}
      <section className="section">
        <div className="container">
          <div className="section-title">Offres en ligne</div>
          <div className="grid grid--3">
            <article className="offer-card">
              <div className="offer-card__body">
                <h3>Développement web - Junior</h3>
                <div className="offer-card__meta">
                  <span>Agence Numérique</span>
                  <span>Temps plein</span>
                </div>
              </div>
              <div className="offer-card__actions">
                <Link to="/internships/1" className="btn btn--ghost">Détails</Link>
              </div>
            </article>
            <article className="offer-card">
              <div className="offer-card__body">
                <h3>Data &amp; Analyse</h3>
                <div className="offer-card__meta">
                  <span>Banque régionale</span>
                  <span>Hybride</span>
                </div>
              </div>
              <div className="offer-card__actions">
                <Link to="/internships/2" className="btn btn--ghost">Détails</Link>
              </div>
            </article>
            <article className="offer-card">
              <div className="offer-card__body">
                <h3>Support utilisateur</h3>
                <div className="offer-card__meta">
                  <span>Editeur logiciel</span>
                  <span>À distance</span>
                </div>
              </div>
              <div className="offer-card__actions">
                <Link to="/internships/3" className="btn btn--ghost">Détails</Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
