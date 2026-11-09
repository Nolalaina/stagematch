import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Building2, CheckCircle2, Clock, XCircle, MapPin, Users, ArrowLeft, Send, Calendar, Globe, PlusCircle, Check, Plus } from 'lucide-react';

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
    api.getMyInternships().then(setInternships).catch(() => {});
  }

  useEffect(() => { refresh(); api.getSkills().then(setAllSkills); }, []);

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
      setSuccess('Offre de stage publiée avec succès !');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function openCandidates(internship) {
    setSelected(internship);
    try {
      const rows = await api.getCandidates(internship.id);
      setCandidates(rows);
    } catch (err) {
      setError(err.message);
    }
  }

  async function setStatus(applicationId, status) {
    try {
      await api.updateApplicationStatus(applicationId, status);
      openCandidates(selected);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement de l'espace entreprise…</span></div></div>
  );

  if (!company) return (
    <div className="container"><div className="error-banner">Impossible de charger les données de votre entreprise.</div></div>
  );

  const isApproved = company.validation_status === 'approved';

  return (
    <div className="container page">
      <div className="dash-head animate-in">
        <div>
          <h1><Building2 size={28} /> {company.name}</h1>
          <p>Secteur d'activité : {company.sector || 'Non renseigné'}</p>
        </div>
        <span className={`tag ${isApproved ? 'tag--success' : company.validation_status === 'pending' ? 'tag--warning' : 'tag--danger'}`}>
          {isApproved ? <><CheckCircle2 size={15} /> Compte validé</> : company.validation_status === 'pending' ? <><Clock size={15} /> En attente de validation</> : <><XCircle size={15} /> Accès refusé</>}
        </span>
      </div>

      {!isApproved && (
        <div className="info-banner animate-in"><Clock size={16} /><span>Votre entreprise est en cours de vérification par un administrateur. La publication d'offres sera débloquée dès validation.</span></div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {!selected ? (
        <div className="dash-grid">
          <div className="card card--pad animate-in">
            <h2 className="mb"><span className="field__label"><PlusCircle size={20} /> Publier une offre de stage</span></h2>
            <form onSubmit={onCreate}>
              <div className="field"><label htmlFor="pub-title">Intitulé du poste</label><input id="pub-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex : Développeur Web Full-Stack (React / Node.js)" required disabled={!isApproved} /></div>
              <div className="field"><label htmlFor="pub-desc">Missions et profil recherché</label><textarea id="pub-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descriptif détaillé du stage, technologies utilisées, exigences…" required disabled={!isApproved} /></div>
              <div className="field__row mb">
                <div className="field"><label htmlFor="pub-loc"><span className="field__label"><MapPin size={13} /> Lieu</span></label><input id="pub-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex : Antananarivo" disabled={!isApproved} /></div>
                <div className="field"><label htmlFor="pub-dur"><span className="field__label"><Calendar size={13} /> Durée (semaines)</span></label><input id="pub-dur" type="number" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} placeholder="Ex : 12" disabled={!isApproved} /></div>
              </div>
              <label className="check mb"><input type="checkbox" checked={form.isRemote} onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} disabled={!isApproved} /><Globe size={15} /><span>Poste ouvert au télétravail</span></label>
              <div className="field"><label>Compétences techniques clés</label>
                <div className="gap-row--sm">
                  {allSkills.map((s) => {
                    const active = form.skillIds.includes(s.id);
                    return <button key={s.id} type="button" onClick={() => toggleSkill(s.id)} className={`tag ${active ? 'tag--active' : ''}`} disabled={!isApproved}>{active ? <Check size={12} /> : <Plus size={12} />}<span>{s.name}</span></button>;
                  })}
                </div>
              </div>
              <button type="submit" className="btn btn--primary btn--block" disabled={!isApproved}><Send size={16} /><span>Publier l'offre de stage</span></button>
            </form>
          </div>

          <div>
            <h2 className="mb">Offres publiées ({internships.length})</h2>
            {!internships.length && <div className="card empty-state">Aucune offre actuellement enregistrée.</div>}
            {internships.map((i) => (
              <div key={i.id} className="offer-row animate-in" onClick={() => openCandidates(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openCandidates(i)}>
                <div className="offer-row__body">
                  <h3>{i.title}</h3>
                  <div className="meta"><span><MapPin size={13} /> {i.location || 'Non précisé'}</span><span><Users size={13} /> {i.application_count || 0} candidature(s)</span></div>
                </div>
                <span className="btn btn--outline btn--sm"><span>Candidats</span><Users size={14} /></span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-in">
          <button type="button" className="btn btn--ghost mb" onClick={() => setSelected(null)}><ArrowLeft size={16} /><span>Retour aux offres</span></button>
          <div className="card card--pad mb"><h2 className="mb">Candidatures pour « {selected.title} »</h2><p className="muted">{candidates.length} dossier{candidates.length !== 1 ? 's' : ''} reçu{candidates.length !== 1 ? 's' : ''} (triés par score d'adéquation)</p></div>
          {!candidates.length ? (
            <div className="card empty-state">Aucune candidature reçue pour cette offre pour l'instant.</div>
          ) : (
            <div className="card table-wrap">
              <table>
                <thead><tr><th>Nom du candidat</th><th>Score matching</th><th>Filière et formation</th><th>Statut recrutement</th></tr></thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.application_id}>
                      <td><strong>{c.full_name}</strong></td>
                      <td><span className={Number(c.match_score) >= 60 ? 'score--good' : 'score--mid'}>{Number(c.match_score).toFixed(0)}%</span></td>
                      <td className="muted">{c.field_of_study || '—'}</td>
                      <td>
                        <select value={c.status} onChange={(e) => setStatus(c.application_id, e.target.value)} aria-label="Statut recrutement">
                          <option value="submitted">Soumise</option>
                          <option value="viewed">Examinée</option>
                          <option value="interview">Entretien planifié</option>
                          <option value="result_positive">Candidature retenue</option>
                          <option value="result_negative">Candidature non retenue</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
