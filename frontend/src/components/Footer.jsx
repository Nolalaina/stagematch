import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer-brand">
            <Link to="/" className="wordmark" aria-label="StageMatch">
              <div className="wordmark-mark" />
              StageMatch
            </Link>
            <p>Plateforme de mise en relation entre étudiants en recherche de stage et recruteurs.</p>
          </div>

          <div>
            <div className="footer__head">Plateforme</div>
            <nav>
              <ul>
                <li><Link to="/internships">Offres de stages</Link></li>
                <li><Link to="/login">Se connecter</Link></li>
                <li><Link to="/register">Créer un compte</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <div className="footer__head">Portails</div>
            <nav>
              <ul>
                <li><Link to="/student">Portail Candidat</Link></li>
                <li><Link to="/company">Portail Recruteur</Link></li>
                <li><Link to="/admin">Console d'administration</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <div className="footer__head">À propos</div>
            <nav>
              <ul>
                <li><Link to="/">Confidentialité</Link></li>
                <li><Link to="/">Conditions d'utilisation</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="footer__fine">
          <span>© 2026 StageMatch. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
