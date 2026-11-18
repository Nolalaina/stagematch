import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Sparkles, Building2, MapPin, Globe, Check, UserPlus, Search, Compass, BookOpen, ArrowRight } from 'lucide-react';

export default function TidePage() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    api.getInternships({ limit: 6 }).then((data) => {
      if (Array.isArray(data)) {
        setOffers(data.slice(0, 6));
      }
    }).catch(() => {
      setOffers([]);
    });
  }, []);

  return (
    <section className="section section--tide">
      <div className="container">
        <div className="grid grid--2">
          <div className="tide__filters">
            <h2 className="section-title">Parcourir les stages</h2>
            <p className="muted">Filtrer par domaine ou localisation</p>
            <div className="filter-tags">
              <button className="tag tag--ghost">Tous</button>
              <button className="tag tag--ghost">Tech</button>
              <button className="tag tag--ghost">Design</button>
              <button className="tag tag--ghost">Marketing</button>
            </div>
          </div>

          <div className="tide__main">
            <div className="grid grid--3">
              {offers.map((offer) => (
                <article key={offer.id} className="card offer-card">
                  <div className="offer-card__head">
                    <span className="company-chip"><Building2 size={13} /> {offer.company_name}</span>
                    {offer.is_remote && (
                      <span className="tag tag--success"><Globe size={11} /> Télétravail</span>
                    )}
                  </div>
                  <h3>{offer.title}</h3>
                  <div className="offer-card__meta">
                    {offer.location && <span><MapPin size={13} /> {offer.location}</span>}
                    {offer.duration_weeks && <span>{offer.duration_weeks} semaines</span>}
                  </div>
                  <div className="offer-card__foot">
                    <Link to={`/internships/${offer.id}`} className="btn btn--outline btn--sm">
                      <span>Voir l'offre</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
              {offers.length === 0 && (
                <p className="empty-state">Aucune offre disponible pour le moment</p>
              )}
            </div>

            <div className="tide__highlights">
              <h3>Profils recherchés</h3>
              <div className="tags-stacked">
                <span className="tag tag--active">React</span>
                <span className="tag tag--active">Node.js</span>
                <span className="tag tag--active">SQL</span>
                <span className="tag">Docker</span>
                <span className="tag">TypeScript</span>
                <span className="tag">Python</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}