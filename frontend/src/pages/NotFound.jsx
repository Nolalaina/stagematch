import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container notfound">
      <div className="notfound__code">404</div>
      <h1>Page introuvable</h1>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn btn--primary">Retourner à l'accueil</Link>
    </div>
  );
}
