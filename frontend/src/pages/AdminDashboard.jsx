import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { BarChart3, Building2, Users, Sliders, Target, FileText, Sparkles, GraduationCap, Mail, CheckCircle2, XCircle, Plus, Trash2, Ban, ShieldCheck, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [fields, setFields] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    Promise.all([
      api.getPendingCompanies().catch(() => []),
      api.getAdminStats().catch(() => null),
      api.getAdminSkills().catch(() => []),
      api.getAdminFields().catch(() => []),
      api.getAdminUsers().catch(() => [])
    ])
      .then(([pend, st, sk, fd, usrs]) => {
        setPending(pend || []);
        setStats(st);
        setSkills(sk || []);
        setFields(fd || []);
        setUsers(usrs || []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function decideCompany(id, decision) {
    try {
      await api.validateCompany(id, decision);
      setSuccessMsg(decision === 'approved' ? 'Entreprise validée avec succès.' : 'Entreprise refusée.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivateUser(id) {
    if (!confirm('Voulez-vous vraiment désactiver cet utilisateur ?')) return;
    try {
      await api.deactivateUser(id);
      setSuccessMsg('Compte utilisateur désactivé.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    try {
      await api.createAdminSkill({ name: newSkillName, category: newSkillCategory });
      setNewSkillName(''); setNewSkillCategory('');
      setSuccessMsg('Compétence ajoutée avec succès au référentiel.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSkill(id) {
    if (!confirm('Voulez-vous supprimer cette compétence ?')) return;
    try {
      await api.deleteAdminSkill(id);
      setSuccessMsg('Compétence retirée.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddField(e) {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    try {
      await api.createAdminField({ name: newFieldName });
      setNewFieldName('');
      setSuccessMsg('Filière ajoutée avec succès.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteField(id) {
    if (!confirm('Voulez-vous supprimer cette filière ?')) return;
    try {
      await api.deleteAdminField(id);
      setSuccessMsg('Filière supprimée.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement de la console d'administration…</span></div></div>
  );

  return (
    <div className="container page">
      {/* ── HEADER ADMIN ── */}
      <div className="dash-head">
        <div>
          <h1><ShieldCheck size={26} /> Console d'administration</h1>
          <p>Supervision de la plateforme, gestion des accès et référentiel de compétences</p>
        </div>
        <div className="tabs" role="tablist" aria-label="Sections admin">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <BarChart3 size={14} />
            <span>Statistiques</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            <Building2 size={14} />
            <span>Entreprises ({pending.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={14} />
            <span>Utilisateurs ({users.length})</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'referentiel' ? 'active' : ''}`}
            onClick={() => setActiveTab('referentiel')}
          >
            <Sliders size={14} />
            <span>Référentiel</span>
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner"><CheckCircle2 size={15} /><span>{successMsg}</span></div>}

      {/* ── TAB STATISTIQUES ── */}
      {activeTab === 'stats' && (
        <div className="animate-in">
          {stats ? (
            <>
              <div className="stats-grid mb">
                {[
                  ['Stages publiés', stats.nb_stages_publies || 0, Target],
                  ['Candidatures déposées', stats.nb_candidatures || 0, FileText],
                  ['Score matching moyen', stats.score_matching_moyen != null ? `${Math.round(stats.score_matching_moyen)}%` : '—', Sparkles],
                  ['Entreprises validées', stats.nb_entreprises_validees || 0, Building2],
                  ['Étudiants inscrits', stats.nb_etudiants || 0, GraduationCap],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="stat-card">
                    <div className="stat-card__row">
                      <div className="stat-card__icon"><Icon size={20} /></div>
                      <div>
                        <div className="stat-card__value">{value}</div>
                        <div className="stat-card__label">{label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dash-grid">
                <div className="card card--pad">
                  <h3 className="mb">Répartition des candidatures</h3>
                  {stats.applicationsByStatus && stats.applicationsByStatus.length > 0 ? (
                    stats.applicationsByStatus.map((item) => {
                      const total = stats.nb_candidatures || 1;
                      const pct = Math.round((item.count / total) * 100);
                      const statusLabels = {
                        submitted: 'Soumises',
                        viewed: 'Dossiers examinés',
                        interview: 'Entretiens planifiés',
                        result_positive: 'Candidatures acceptées',
                        result_negative: 'Candidatures refusées'
                      };
                      return (
                        <div key={item.status} className="progress">
                          <div className="progress__head">
                            <span className="muted">{statusLabels[item.status] || item.status}</span>
                            <span>{item.count} ({pct}%)</span>
                          </div>
                          <div className="progress__track">
                            <div
                              className={`progress__fill ${item.status === 'result_positive' ? 'progress__fill--success' : ''}`}
                              style={{ '--w': `${Math.max(pct, 5)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : <div className="empty-state">Aucune candidature enregistrée pour le moment.</div>}
                </div>

                <div className="card card--pad">
                  <h3 className="mb">Performance du moteur d'affinité</h3>
                  <div className="engine-stats-box">
                    <div className="engine-stat-item">
                      <div className="stat-card__value">{stats.score_matching_moyen ? `${Math.round(stats.score_matching_moyen)}%` : '0%'}</div>
                      <div className="stat-card__label">Score moyen global d'adéquation</div>
                    </div>
                    <div className="engine-stat-item">
                      <div className="stat-card__value">{stats.nb_entreprises_validees || 0}</div>
                      <div className="stat-card__label">Recruteurs partenaires actifs</div>
                    </div>
                    <div className="engine-stat-item">
                      <div className="stat-card__value">{pending.length}</div>
                      <div className="stat-card__label">Dossiers entreprises en attente</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : <div className="empty-state card">Statistiques d'utilisation non disponibles.</div>}
        </div>
      )}

      {/* ── TAB ENTREPRISES PENDING ── */}
      {activeTab === 'companies' && (
        <div className="animate-in">
          <div className="dash-head">
            <h2>Demandes de validation entreprises</h2>
            <span className="tag">{pending.length} en attente</span>
          </div>

          {!pending.length && (
            <div className="empty-state card">
              <CheckCircle2 size={32} className="muted" />
              <p>Toutes les demandes de validation d'entreprises ont été traitées.</p>
            </div>
          )}

          <div className="stack">
            {pending.map((c) => (
              <div key={c.id} className="card card--pad company-validation-row">
                <div className="company-validation-info">
                  <h3>{c.name}</h3>
                  <div className="meta">
                    <span><Mail size={13} /> {c.contact_email || 'Email non renseigné'}</span>
                    <span>Secteur : {c.sector || 'Technologies / Non renseigné'}</span>
                  </div>
                </div>
                <div className="row-end">
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => decideCompany(c.id, 'rejected')}>
                    <XCircle size={14} />
                    <span>Refuser</span>
                  </button>
                  <button type="button" className="btn btn--success btn--sm" onClick={() => decideCompany(c.id, 'approved')}>
                    <CheckCircle2 size={14} />
                    <span>Valider l'entreprise</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB UTILISATEURS ── */}
      {activeTab === 'users' && (
        <div className="animate-in">
          <div className="dash-head">
            <h2>Comptes utilisateurs</h2>
            <span className="tag">{users.length} enregistrés</span>
          </div>

          <div className="card table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Adresse email</th>
                  <th>Rôle attribué</th>
                  <th>Statut du compte</th>
                  <th>Date d'inscription</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.email}</strong></td>
                    <td>
                      <span className={`tag ${u.role === 'admin' ? 'tag--active' : u.role === 'company' ? 'tag--warning' : ''}`}>
                        {u.role === 'student' ? 'Étudiant' : u.role === 'company' ? 'Entreprise' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <span className={`tag ${u.is_active ? 'tag--success' : 'tag--danger'}`}>
                        {u.is_active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="muted">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      {u.is_active && u.role !== 'admin' ? (
                        <button type="button" className="btn btn--danger btn--xs" onClick={() => handleDeactivateUser(u.id)}>
                          <Ban size={12} />
                          <span>Désactiver</span>
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB RÉFÉRENTIEL ── */}
      {activeTab === 'referentiel' && (
        <div className="dash-grid animate-in">
          {/* Compétences */}
          <div className="card card--pad">
            <div className="card-section mb">
              <h2>Référentiel de compétences</h2>
              <p className="muted">Vocabulaire contrôlé utilisé pour le matching prédictif</p>
            </div>

            <form onSubmit={handleAddSkill} className="stack mb">
              <div className="field">
                <label htmlFor="sk-name">Intitulé de la compétence</label>
                <input
                  id="sk-name"
                  placeholder="Ex : Docker, GraphQL, Kubernetes…"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="sk-cat">Catégorie</label>
                <input
                  id="sk-cat"
                  placeholder="Ex : DevOps, Frameworks, Mobile…"
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn--primary btn--sm">
                <Plus size={14} />
                <span>Ajouter la compétence</span>
              </button>
            </form>

            <hr className="divider" />

            <div className="dash-head">
              <h3>Compétences répertoriées</h3>
              <span className="tag">{skills.length}</span>
            </div>

            <div className="referentiel-list">
              {skills.map((s) => (
                <div key={s.id} className="referentiel-item">
                  <div className="referentiel-item__info">
                    <strong>{s.name}</strong>
                    {s.category && <span className="muted"> ({s.category})</span>}
                  </div>
                  <button type="button" onClick={() => handleDeleteSkill(s.id)} className="btn btn--ghost btn--xs" title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Filières d'études */}
          <div className="card card--pad">
            <div className="card-section mb">
              <h2>Filières d'études</h2>
              <p className="muted">Parcours académiques des étudiants ciblés</p>
            </div>

            <form onSubmit={handleAddField} className="stack mb">
              <div className="field">
                <label htmlFor="fd-name">Nom de la filière</label>
                <input
                  id="fd-name"
                  placeholder="Ex : Génie Logiciel, CyberSécurité, IA…"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary btn--sm">
                <Plus size={14} />
                <span>Ajouter la filière</span>
              </button>
            </form>

            <hr className="divider" />

            <div className="dash-head">
              <h3>Filières enregistrées</h3>
              <span className="tag">{fields.length}</span>
            </div>

            <div className="referentiel-list">
              {!fields.length && <p className="muted">Aucune filière configurée.</p>}
              {fields.map((f) => (
                <div key={f.id} className="referentiel-item">
                  <strong>{f.name}</strong>
                  <button type="button" onClick={() => handleDeleteField(f.id)} className="btn btn--ghost btn--xs" title="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
