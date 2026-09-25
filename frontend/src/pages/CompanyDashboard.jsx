import { useEffect, useState } from 'react';
import { api } from '../api.js';

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
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>{company.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Secteur : {company.sector || 'Non renseigné'}
          </div>
        </div>

        <div>
          <span className={`tag ${isApproved ? 'tag--success' : company.validation_status === 'pending' ? 'tag--warning' : 'tag--danger'}`} style={{ padding: '6px 16px', fontSize: 13 }}>
            {isApproved ? '✓ Compte Validé' : company.validation_status === 'pending' ? '⏳ En attente de validation' : '✗ Compte Refusé'}
          </span>
        </div>
      </div>

      {!isApproved && (
        <div className="info-banner animate-in" style={{ marginBottom: 28 }}>
          Votre compte est en cours d'examen par les administrateurs. Vous pourrez publier des offres de stage dès sa validation.
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {!selected ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* Formulaire de publication */}
          <div className="card animate-in">
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Publier une nouvelle offre</h2>
            <form onSubmit={onCreate}>
              <div className="field">
                <label htmlFor="pub-title">Titre de l'offre</label>
                <input
                  id="pub-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex : Développeur Web Full-Stack"
                  required
                  disabled={!isApproved}
                />
              </div>

              <div className="field">
                <label htmlFor="pub-desc">Description du poste</label>
                <textarea
                  id="pub-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Missions, environnement technique, profil recherché..."
                  required
                  disabled={!isApproved}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="pub-loc">Lieu</label>
                  <input
                    id="pub-loc"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ex : Antananarivo"
                    disabled={!isApproved}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="pub-dur">Durée (semaines)</label>
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
                Télétravail possible
              </label>

              <div className="field">
                <label>Compétences requises</label>
                <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
                  {allSkills.map((s) => {
                    const active = form.skillIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkill(s.id)}
                        className={`tag ${active ? 'tag--active' : ''}`}
                        style={{ cursor: isApproved ? 'pointer' : 'not-allowed', fontSize: 12, marginBottom: 6 }}
                        disabled={!isApproved}
                      >
                        {active ? '✓ ' : '+ '}{s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary"
                style={{ width: '100%', marginTop: 8 }}
                disabled={!isApproved}
              >
                ⚡ Publier l'offre
              </button>
            </form>
          </div>

          {/* Liste des offres */}
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Mes offres publiées ({internships.length})</h2>

            {!internships.length && (
              <div className="empty-state card">
                Aucune offre publiée pour le moment.
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
                  <h3 style={{ fontSize: 18, marginBottom: 4 }}>{i.title}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    📍 {i.location || 'Non précisé'} · 👥 {i.application_count || 0} candidature(s)
                  </div>
                </div>
                <span className="btn btn--outline btn--sm">Candidats →</span>
              </div>
            ))}
          </div>

        </div>
      ) : (

        /* Vue candidats pour une offre sélectionnée */
        <div className="animate-in">
          <button className="btn btn--ghost" style={{ marginBottom: 20 }} onClick={() => setSelected(null)}>
            ← Retour à mes offres
          </button>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, marginBottom: 6 }}>Candidats pour "{selected.title}"</h2>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {candidates.length} candidature{candidates.length !== 1 ? 's' : ''} reçue{candidates.length !== 1 ? 's' : ''} (triées par score de matching)
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
                    <th style={{ padding: '16px 20px' }}>Candidat</th>
                    <th style={{ padding: '16px 20px' }}>Score Matching</th>
                    <th style={{ padding: '16px 20px' }}>Filière</th>
                    <th style={{ padding: '16px 20px' }}>Statut Candidature</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.application_id}>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{c.full_name}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontWeight: 700, color: Number(c.match_score) >= 60 ? 'var(--success)' : 'var(--accent)' }}>
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
                          <option value="viewed">Vue</option>
                          <option value="interview">Entretien</option>
                          <option value="result_positive">Acceptée</option>
                          <option value="result_negative">Refusée</option>
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
