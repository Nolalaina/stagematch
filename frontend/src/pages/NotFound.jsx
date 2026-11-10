import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container notfound animate-in">
      <div className="notfound__code">404</div>
      <h1>Page introuvable</h1>
      <p>L'adresse demandée n'existe pas, a été renommée ou n'est plus accessible.</p>
      <Link to="/" className="btn btn--primary">
        <span>Retourner à l'accueil</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
