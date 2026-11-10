import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Building2, CheckCircle2, Clock, XCircle, MapPin, Users, ArrowLeft, Send, Calendar, Globe, PlusCircle, Check, Plus, Briefcase, ChevronRight } from 'lucide-react';

export default function CompanyDashboard() {
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', location: '', durationWeeks: '', isRemote: false, skillIds: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    api.getMyCompany().then(setCompany).catch((err) => setError(err.message)).finally(() => setLoading(false));
    api.getMyInternships().then(setInternships).catch(() => { });
  }

  useEffect(() => {
    refresh();
    api.getSkills().then((data) => setAllSkills(data || []));
  }, []);

  function toggleSkill(id) {
    setForm((f) => ({ ...f, skillIds: f.skillIds.includes(id) ? f.skillIds.filter((x) => x !== id) : [...f.skillIds, id] }));
  }

  async function onCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.createInternship(form);
      setForm({ title: '', description: '', location: '', durationWeeks: '', isRemote: false, skillIds: [] });
      setSuccess('Offre de stage publiée avec succès sur le catalogue.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function openCandidates(internship) {
    setSelected(internship);
    try {
      const rows = await api.getCandidates(internship.id);
      setCandidates(rows || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function setStatus(applicationId, status) {
    try {
      await api.updateApplicationStatus(applicationId, status);
      if (selected) openCandidates(selected);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement de votre espace recruteur…</span></div></div>
  );

  if (!company) return (
    <div className="container page"><div className="error-banner">Impossible de charger les données de votre entreprise.</div></div>
  );

  const isApproved = company.validation_status === 'approved';

  return (
    <div className="container page">
      {/* ── HEADER ENTREPRISE ── */}
      <div className="dash-head animate-in">
        <div>
          <h1><Building2 size={24} /> {company.name}</h1>
          <p>Secteur d'activité : {company.sector || 'Technologies & Services'}</p>
        </div>
        <div>
          <span className={`tag ${isApproved ? 'tag--success' : company.validation_status === 'pending' ? 'tag--warning' : 'tag--danger'}`}>
            {isApproved ? <><CheckCircle2 size={13} /> Compte entreprise validé</> : company.validation_status === 'pending' ? <><Clock size={13} /> En attente de validation</> : <><XCircle size={13} /> Compte non validé</>}
          </span>
        </div>
      </div>

      {!isApproved && (
        <div className="info-banner animate-in">
          <Clock size={16} />
          <span>Votre entreprise est en cours de vérification administrative. La publication d'offres sera active dès validation de votre compte.</span>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner"><CheckCircle2 size={16} /><span>{success}</span></div>}

      {!selected ? (
        <div className="dash-grid">
          {/* ── FORMULAIRE NOUVELLE OFFRE ── */}
          <div className="card card--pad animate-in">
            <div className="card-section mb">
              <h2>Publier une offre de stage</h2>
              <p className="muted">L'algorithme de matching proposera votre offre aux profils cibles</p>
            </div>

            <form onSubmit={onCreate}>
              <div className="field">
                <label htmlFor="pub-title"><span className="field__label"><Briefcase size={13} /> Intitulé du poste</span></label>
                <input
                  id="pub-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex : Développeur Web Full-Stack (React / Node.js)"
                  required
                  disabled={!isApproved}
                />
              </div>

              <div className="field">
                <label htmlFor="pub-desc">Missions confiées et profil recherché</label>
                <textarea
                  id="pub-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Détaillez les projets confiés au stagiaire, l'environnement technique, et les objectifs pédagogiques…"
                  required
                  disabled={!isApproved}
                />
              </div>

              <div className="field__row">
                <div className="field">
                  <label htmlFor="pub-loc"><span className="field__label"><MapPin size={13} /> Ville / Lieu</span></label>
                  <input
                    id="pub-loc"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ex : Antananarivo"
                    disabled={!isApproved}
                  />
                </div>
                <div className="field">
                  <label htmlFor="pub-dur"><span className="field__label"><Calendar size={13} /> Durée (en semaines)</span></label>
                  <input
                    id="pub-dur"
                    type="number"
                    min="1"
                    max="52"
                    value={form.durationWeeks}
                    onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
                    placeholder="Ex : 12"
                    disabled={!isApproved}
                  />
                </div>
              </div>

              <label className="check mb">
                <input
                  type="checkbox"
                  checked={form.isRemote}
                  onChange={(e) => setForm({ ...form, isRemote: e.target.checked })}
                  disabled={!isApproved}
                />
                <Globe size={15} />
                <span>Ce poste est ouvert au télétravail (partiel ou total)</span>
              </label>

              <div className="field">
                <label>Compétences techniques clés recherchées</label>
                <div className="skills-selection-grid">
                  {allSkills.map((s) => {
                    const active = form.skillIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkill(s.id)}
                        className={`skill-tag-btn ${active ? 'skill-tag-btn--active' : ''}`}
                        disabled={!isApproved}
                        aria-pressed={active}
                      >
                        {active ? <Check size={12} /> : <Plus size={12} />}
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={!isApproved}>
                <Send size={15} />
                <span>Publier cette offre de stage</span>
              </button>
            </form>
          </div>

          {/* ── LISTE DES OFFRES DE L'ENTREPRISE ── */}
          <div className="animate-in">
            <div className="dash-head">
              <h2>Offres publiées</h2>
              <span className="tag">{internships.length} active{internships.length !== 1 ? 's' : ''}</span>
            </div>

            {!internships.length && (
              <div className="card empty-state">
                <p>Aucune offre de stage n'a encore été publiée par votre organisation.</p>
              </div>
            )}

            <div className="stack">
              {internships.map((i) => (
                <div
                  key={i.id}
                  className="card card--pad company-offer-item"
                  onClick={() => openCandidates(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openCandidates(i)}
                >
                  <div className="company-offer-item__main">
                    <h3>{i.title}</h3>
                    <div className="meta mb">
                      <span><MapPin size={13} /> {i.location || 'Non précisé'}</span>
                      {i.duration_weeks && <span><Calendar size={13} /> {i.duration_weeks} sem.</span>}
                      {i.is_remote && <span className="tag tag--success"><Globe size={11} /> Télétravail</span>}
                    </div>
                  </div>
                  <div className="company-offer-item__side">
                    <span className="tag tag--active">
                      <Users size={12} />
                      <span>{i.application_count || 0} candidature{(i.application_count || 0) > 1 ? 's' : ''}</span>
                    </span>
                    <button type="button" className="btn btn--outline btn--xs">
                      <span>Voir dossiers</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── GESTION DES CANDIDATURES REÇUES ── */
        <div className="animate-in">
          <button type="button" className="btn btn--ghost btn--sm mb" onClick={() => setSelected(null)}>
            <ArrowLeft size={14} />
            <span>Retour aux offres de stage</span>
          </button>

          <div className="card card--pad mb">
            <div className="dash-head">
              <div>
                <h2>Candidatures pour « {selected.title} »</h2>
                <p className="muted">{candidates.length} dossier{candidates.length !== 1 ? 's' : ''} reçu{candidates.length !== 1 ? 's' : ''} ordonné{candidates.length !== 1 ? 's' : ''} par score d'adéquation</p>
              </div>
              <span className="tag tag--active">{candidates.length} postulant{candidates.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {!candidates.length ? (
            <div className="card empty-state">
              <p>Aucune candidature reçue pour cette offre pour le moment.</p>
            </div>
          ) : (
            <div className="card table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Candidat</th>
                    <th>Score de matching</th>
                    <th>Filière et cursus</th>
                    <th>Statut du recrutement</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => {
                    const score = Number(c.match_score) || 0;
                    return (
                      <tr key={c.application_id}>
                        <td><strong>{c.full_name}</strong></td>
                        <td>
                          <span className={`score-badge ${score >= 60 ? 'score-badge--good' : 'score-badge--mid'}`}>
                            {Math.round(score)}% adéquation
                          </span>
                        </td>
                        <td className="muted">{c.field_of_study || 'Non renseigné'}</td>
                        <td>
                          <select
                            className="status-select"
                            value={c.status}
                            onChange={(e) => setStatus(c.application_id, e.target.value)}
                            aria-label="Statut du recrutement"
                          >
                            <option value="submitted">Soumise</option>
                            <option value="viewed">Dossier examiné</option>
                            <option value="interview">Entretien planifié</option>
                            <option value="result_positive">Candidature acceptée</option>
                            <option value="result_negative">Candidature non retenue</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
