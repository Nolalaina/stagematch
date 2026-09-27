import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { 
  Search, 
  MapPin, 
  Target, 
  Building2, 
  Clock, 
  Globe, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';

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
    <div className="container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          Explorer les <span className="grad-text">Offres de Stage</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {offers.length > 0 ? `${offers.length} opportunité${offers.length > 1 ? 's' : ''} disponible${offers.length > 1 ? 's' : ''}` : 'Recherchez des stages par localisation, domaine et modalités'}
        </p>
      </div>

      {/* Filters */}
      <div className="card animate-in" style={{ marginBottom: 28 }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
            <label htmlFor="loc" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={13} /> Localisation
            </label>
            <input
              id="loc"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Ex : Antananarivo"
            />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
            <label htmlFor="domain" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Target size={13} /> Domaine / Secteur
            </label>
            <input
              id="domain"
              value={filters.domain}
              onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
              placeholder="Ex : Technologies, Finance"
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)', paddingBottom: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
            />
            <Globe size={14} style={{ color: 'var(--accent)' }} />
            <span>Télétravail uniquement</span>
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
            <button type="submit" className="btn btn--primary btn--sm" style={{ padding: '11px 20px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Search size={15} />
              <span>Rechercher</span>
            </button>
            <button type="button" onClick={onReset} className="btn btn--outline btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={14} />
              <span>Réinitialiser</span>
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="loading-page" style={{ minHeight: 200 }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && !offers.length && (
        <div className="empty-state card">
          <p>Aucune offre ne correspond à ces critères de recherche.</p>
        </div>
      )}

      {!loading && offers.map((o, i) => (
        <Link key={o.id} to={`/internships/${o.id}`} className="offer-row animate-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 19, marginBottom: 6 }}>{o.title}</h3>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Building2 size={14} /> {o.company_name}
              </span>
              {o.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} /> {o.location}
                </span>
              )}
              {o.duration_weeks && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} /> {o.duration_weeks} semaines
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {o.is_remote && (
              <span className="tag tag--success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Globe size={12} /> Télétravail
              </span>
            )}
            <span className="btn btn--outline btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span>Détails</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
