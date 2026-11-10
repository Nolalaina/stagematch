import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Search, MapPin, Target, Building2, Clock, Globe, ArrowRight, RotateCcw, Calendar, Briefcase } from 'lucide-react';

export default function InternshipSearch() {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState({ location: '', remote: false, domain: '' });
  const [loading, setLoading] = useState(true);

  function load(params) {
    setLoading(true);
    api.getInternships(params)
      .then((data) => setOffers(data || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load({}); }, []);

  function onSubmit(e) {
    e.preventDefault();
    const params = {};
    if (filters.location.trim()) params.location = filters.location.trim();
    if (filters.remote) params.remote = 'true';
    if (filters.domain.trim()) params.domain = filters.domain.trim();
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
        <p>
          {offers.length > 0
            ? `${offers.length} opportunité${offers.length > 1 ? 's' : ''} active${offers.length > 1 ? 's' : ''} sur le réseau`
            : "Trouvez un stage adapté à vos compétences et à vos préférences"}
        </p>
      </div>

      {/* ── BARRE DE FILTRES ── */}
      <div className="card filters animate-in">
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="loc"><span className="field__label"><MapPin size={13} /> Ville / Région</span></label>
            <input
              id="loc"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              placeholder="Ex : Antananarivo"
            />
          </div>

          <div className="field">
            <label htmlFor="domain"><span className="field__label"><Target size={13} /> Domaine ou mot-clé</span></label>
            <input
              id="domain"
              value={filters.domain}
              onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
              placeholder="Ex : Web, React, Data, DevOps"
            />
          </div>

          <label className="check filter-check">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
            />
            <Globe size={14} />
            <span>Télétravail uniquement</span>
          </label>

          <div className="row-end filter-actions">
            <button type="submit" className="btn btn--primary btn--sm">
              <Search size={14} />
              <span>Filtrer</span>
            </button>
            <button type="button" onClick={onReset} className="btn btn--outline btn--sm">
              <RotateCcw size={13} />
              <span>Effacer</span>
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="loading-page"><div className="spinner" /><span>Recherche des offres en cours…</span></div>
      )}

      {!loading && !offers.length && (
        <div className="card empty-state animate-in">
          <p>Aucune offre ne correspond à vos critères de sélection actuels.</p>
          <button type="button" onClick={onReset} className="btn btn--outline btn--sm">
            <span>Réinitialiser les filtres</span>
          </button>
        </div>
      )}

      {!loading && offers.length > 0 && (
        <div className="stack animate-in">
          {offers.map((o) => (
            <Link key={o.id} to={`/internships/${o.id}`} className="offer-row">
              <div className="offer-row__body">
                <h3>{o.title}</h3>
                <div className="meta mb">
                  <span><Building2 size={14} /> {o.company_name}</span>
                  {o.location && <span><MapPin size={14} /> {o.location}</span>}
                  {o.duration_weeks && <span><Clock size={14} /> {o.duration_weeks} semaines</span>}
                  {o.is_remote && <span className="tag tag--success"><Globe size={11} /> Télétravail</span>}
                </div>
                {o.description && (
                  <p className="muted offer-snippet">
                    {o.description.length > 140 ? `${o.description.slice(0, 140)}…` : o.description}
                  </p>
                )}
              </div>
              <div className="offer-row__cta">
                <span className="btn btn--outline btn--sm">
                  <span>Détails</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
