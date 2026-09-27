import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Send, 
  Briefcase, 
  Calendar,
  Globe,
  PlusCircle,
  Check
} from 'lucide-react';

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
    api.getMyCompany()
      .then(setCompany)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

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
    <div className="container">
      <div className="loading-page"><div className="spinner" /><span>Chargement de l'espace entreprise…</span></div>
    </div>
  );

  if (!company) return (
    <div className="container">
      <div className="error-banner">Impossible de charger les données de votre entreprise.</div>
    </div>
  );

  const isApproved = company.validation_status === 'approved';

  return (
    <div className="container">

      {/* Header Entreprise */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }} className="animate-in">
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building2 size={28} style={{ color: 'var(--accent)' }} />
            <span>{company.name}</span>
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Secteur d'activité : {company.sector || 'Non renseigné'}
          </div>
        </div>

        <div>
          <span className={`tag ${isApproved ? 'tag--success' : company.validation_status === 'pending' ? 'tag--warning' : 'tag--danger'}`} style={{ padding: '6px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {isApproved ? (
              <><CheckCircle2 size={15} /> Compte Validé</>
            ) : company.validation_status === 'pending' ? (
              <><Clock size={15} /> En attente de validation</>
            ) : (
              <><XCircle size={15} /> Accès Refusé</>
            )}
          </span>
        </div>
      </div>

      {!isApproved && (
        <div className="info-banner animate-in" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} />
          <span>Votre entreprise est en cours de vérification par un administrateur. Les fonctionnalités de publication d'offres seront débloquées dès validation.</span>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {!selected ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* Formulaire de publication */}
          <div className="card animate-in">
            <h2 style={{ fontSize: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlusCircle size={20} style={{ color: 'var(--accent)' }} />
              <span>Publier une offre de stage</span>
            </h2>
            <form onSubmit={onCreate}>
              <div className="field">
                <label htmlFor="pub-title">Intitulé du poste</label>
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
                <label htmlFor="pub-desc">Missions &amp; profil recherché</label>
                <textarea
                  id="pub-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descriptif détaillé du stage, technologies utilisées, exigences..."
                  required
                  disabled={!isApproved}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="pub-loc" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} /> Lieu
                  </label>
                  <input
                    id="pub-loc"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ex : Antananarivo"
                    disabled={!isApproved}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="pub-dur" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={13} /> Durée (semaines)
                  </label>
                  <input
                    id="pub-dur"
                    type="number"
                    value={form.durationWeeks}
                    onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
                    placeholder="Ex : 12"
                    disabled={!isApproved}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)', margin: '18px 0', cursor: isApproved ? 'pointer' : 'not-allowed' }}>
                <input
                  type="checkbox"
                  checked={form.isRemote}
                  onChange={(e) => setForm({ ...form, isRemote: e.target.checked })}
                  disabled={!isApproved}
                />
                <Globe size={15} style={{ color: 'var(--accent)' }} />
                <span>Poste ouvert au télétravail</span>
              </label>

              <div className="field">
                <label>Compétences techniques clés</label>
                <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
                  {allSkills.map((s) => {
                    const active = form.skillIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkill(s.id)}
                        className={`tag ${active ? 'tag--active' : ''}`}
                        style={{ cursor: isApproved ? 'pointer' : 'not-allowed', fontSize: 12, marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        disabled={!isApproved}
                      >
                        {active ? <Check size={12} /> : <Plus size={12} />}
                        <span>{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                disabled={!isApproved}
              >
                <Send size={16} />
                <span>Publier l'offre de stage</span>
              </button>
            </form>
          </div>

          {/* Liste des offres */}
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Offres publiées ({internships.length})</h2>

            {!internships.length && (
              <div className="empty-state card">
                Aucune offre actuellement enregistrée.
              </div>
            )}

            {internships.map((i) => (
              <div
                key={i.id}
                className="offer-row animate-in"
                style={{ cursor: 'pointer', marginBottom: 16 }}
                onClick={() => openCandidates(i)}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 6 }}>{i.title}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {i.location || 'Non précisé'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={13} /> {i.application_count || 0} candidature(s)
                    </span>
                  </div>
                </div>
                <span className="btn btn--outline btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span>Candidats</span>
                  <Users size={14} />
                </span>
              </div>
            ))}
          </div>

        </div>
      ) : (

        /* Vue candidats pour une offre sélectionnée */
        <div className="animate-in">
          <button className="btn btn--ghost" style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setSelected(null)}>
            <ArrowLeft size={16} />
            <span>Retour aux offres</span>
          </button>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Candidatures pour "{selected.title}"</h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {candidates.length} dossier{candidates.length !== 1 ? 's' : ''} de candidature reçu{candidates.length !== 1 ? 's' : ''} (triés par score d'adéquation)
            </div>
          </div>

          {!candidates.length ? (
            <div className="empty-state card">
              Aucune candidature reçue pour cette offre pour l'instant.
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px 20px' }}>Nom du Candidat</th>
                    <th style={{ padding: '16px 20px' }}>Score Matching</th>
                    <th style={{ padding: '16px 20px' }}>Filière &amp; Formation</th>
                    <th style={{ padding: '16px 20px' }}>Statut Recrutement</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.application_id}>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{c.full_name}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontWeight: 800, color: Number(c.match_score) >= 60 ? 'var(--success)' : 'var(--accent)' }}>
                          {Number(c.match_score).toFixed(0)} %
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{c.field_of_study || '—'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <select
                          value={c.status}
                          onChange={(e) => setStatus(c.application_id, e.target.value)}
                        >
                          <option value="submitted">Soumise</option>
                          <option value="viewed">Examinée</option>
                          <option value="interview">Entretien Planifié</option>
                          <option value="result_positive">Candidature Retenue</option>
                          <option value="result_negative">Candidature Non Retenue</option>
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
