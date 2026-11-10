import { Link } from 'react-router-dom';
import { Sparkles, Shield, Compass, FileCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer-brand">
            <Link to="/" className="wordmark" aria-label="StageMatch Accueil">
              <span className="wordmark-mark" aria-hidden="true"><Sparkles size={16} /></span>
              <span className="wordmark-title">StageMatch</span>
            </Link>
            <p>Plateforme intelligente de matching entre étudiants en recherche de stage et entreprises partenaires.</p>
          </div>

          <div>
            <div className="footer__head">Plateforme</div>
            <nav aria-label="Liens plateforme">
              <ul>
                <li><Link to="/internships">Explorer les stages</Link></li>
                <li><Link to="/login">Espace connexion</Link></li>
                <li><Link to="/register">Inscription gratuite</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <div className="footer__head">Espaces dédiés</div>
            <nav aria-label="Portails dédiés">
              <ul>
                <li><Link to="/student">Portail Candidat</Link></li>
                <li><Link to="/company">Portail Recruteur</Link></li>
                <li><Link to="/admin">Console Administration</Link></li>
              </ul>
            </nav>
          </div>

          <div>
            <div className="footer__head">Informations</div>
            <nav aria-label="Liens légaux">
              <ul>
                <li><Link to="/internships">Offres récentes</Link></li>
                <li><Link to="/">Confidentialité des données</Link></li>
                <li><Link to="/">Conditions d'utilisation</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="footer__fine">
          <span>© 2026 StageMatch Technologies. Algorithme de matching sémantique pour l'emploi étudiant.</span>
        </div>
      </div>
    </footer>
  );
}
