import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

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
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          Explorer les <span className="grad-text">offres</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {offers.length > 0 ? `${offers.length} offre${offers.length > 1 ? 's' : ''} disponible${offers.length > 1 ? 's' : ''}` : 'Recherchez des stages par lieu, domaine et disponibilité'}
        </p>
      </div>

      {/* Filters */}
      <div className="card animate-in" style={{ marginBottom: 28 }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
            <label htmlFor="loc">📍 Lieu</label>
            <input
              id="loc"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Ex : Antananarivo"
            />
          </div>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 160 }}>
            <label htmlFor="domain">🎯 Domaine / Secteur</label>
            <input
              id="domain"
              value={filters.domain}
              onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
              placeholder="Ex : Technologies, Finance"
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)', paddingBottom: 2, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
            />
            Télétravail uniquement
          </label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
            <button type="submit" className="btn btn--primary btn--sm" style={{ padding: '11px 20px' }}>
              Rechercher
            </button>
            <button type="button" onClick={onReset} className="btn btn--outline btn--sm">
              Réinitialiser
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
        <div className="empty-state">
          <p>Aucune offre ne correspond à ces critères.</p>
        </div>
      )}

      {!loading && offers.map((o, i) => (
        <Link key={o.id} to={`/internships/${o.id}`} className="offer-row animate-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 19, marginBottom: 6 }}>{o.title}</h3>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              🏢 {o.company_name}
              {o.location && ` · 📍 ${o.location}`}
              {o.duration_weeks && ` · ⏱ ${o.duration_weeks} semaines`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {o.is_remote && <span className="tag tag--success">Télétravail</span>}
            <span className="btn btn--outline btn--sm">Voir l'offre →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
