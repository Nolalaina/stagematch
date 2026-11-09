import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Search, MapPin, Target, Building2, Clock, Globe, ArrowRight, RotateCcw } from 'lucide-react';

export default function InternshipSearch() {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState({ location: '', remote: false, domain: '' });
  const [loading, setLoading] = useState(true);

  function load(params) {
    setLoading(true);
    api.getInternships(params)
      .then(setOffers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load({}); }, []);

  function onSubmit(e) {
    e.preventDefault();
    const params = {};
    if (filters.location) params.location = filters.location;
    if (filters.remote) params.remote = 'true';
    if (filters.domain) params.domain = filters.domain;
    load(params);
  }

  function onReset() {
    setFilters({ location: '', remote: false, domain: '' });
    load({});
  }

  return (
    <div className="container page">
      <div className="page__head">
        <h1>Explorer les offres de stage</h1>
        <p>{offers.length > 0 ? `${offers.length} opportunité${offers.length > 1 ? 's' : ''} disponible${offers.length > 1 ? 's' : ''}` : 'Recherchez des stages par localisation, domaine et modalités'}</p>
      </div>

      <div className="card filters">
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="loc"><span className="field__label"><MapPin size={13} /> Localisation</span></label>
            <input id="loc" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Ex : Antananarivo" />
          </div>
          <div className="field">
            <label htmlFor="domain"><span className="field__label"><Target size={13} /> Domaine / Secteur</span></label>
            <input id="domain" value={filters.domain} onChange={(e) => setFilters({ ...filters, domain: e.target.value })} placeholder="Ex : Technologies, Finance" />
          </div>
          <label className="check">
            <input type="checkbox" checked={filters.remote} onChange={(e) => setFilters({ ...filters, remote: e.target.checked })} />
            <Globe size={14} />
            <span>Télétravail uniquement</span>
          </label>
          <div className="row-end">
            <button type="submit" className="btn btn--primary btn--sm"><Search size={15} /><span>Rechercher</span></button>
            <button type="button" onClick={onReset} className="btn btn--outline btn--sm"><RotateCcw size={14} /><span>Réinitialiser</span></button>
          </div>
        </form>
      </div>

      {loading && <div className="loading-page"><div className="spinner" /><span>Chargement des offres…</span></div>}

      {!loading && !offers.length && (
        <div className="card empty-state"><p>Aucune offre ne correspond à ces critères de recherche.</p></div>
      )}

      {!loading && offers.map((o) => (
        <Link key={o.id} to={`/internships/${o.id}`} className="offer-row">
          <div className="offer-row__body">
            <h3>{o.title}</h3>
            <div className="meta">
              <span><Building2 size={14} /> {o.company_name}</span>
              {o.location && <span><MapPin size={14} /> {o.location}</span>}
              {o.duration_weeks && <span><Clock size={14} /> {o.duration_weeks} semaines</span>}
            </div>
          </div>
          <div className="row-end">
            {o.is_remote && <span className="tag tag--success"><Globe size={12} /> Télétravail</span>}
            <span className="btn btn--outline btn--sm"><span>Détails</span><ArrowRight size={14} /></span>
          </div>
        </Link>
      ))}
    </div>
  );
}
