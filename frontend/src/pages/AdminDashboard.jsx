import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'companies' | 'users' | 'referentiel'
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  // Referentiel state
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
    ]).then(([pend, st, sk, fd, usrs]) => {
      setPending(pend);
      setStats(st);
      setSkills(sk);
      setFields(fd);
      setUsers(usrs);
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function decideCompany(id, decision) {
    try {
      await api.validateCompany(id, decision);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivateUser(id) {
    if (!confirm('Voulez-vous vraiment désactiver cet utilisateur ?')) return;
    try {
      await api.deactivateUser(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.createAdminSkill({ name: newSkillName, category: newSkillCategory });
      setNewSkillName('');
      setNewSkillCategory('');
      setSuccessMsg('Compétence ajoutée avec succès.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteSkill(id) {
    if (!confirm('Voulez-vous supprimer cette compétence ?')) return;
    try {
      await api.deleteAdminSkill(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddField(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
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
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="container">
      <div className="loading-page"><div className="spinner" /><span>Chargement de l'administration…</span></div>
    </div>
  );

  return (
    <div className="container">

      {/* Header Admin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Espace <span className="grad-text">Administration</span></h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Supervision globale de la plateforme StageMatch</div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistiques
          </button>
          <button
            className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            🏢 Entreprises ({pending.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Utilisateurs ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'referentiel' ? 'active' : ''}`}
            onClick={() => setActiveTab('referentiel')}
          >
            ⚙️ Référentiel
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* TAB 1: STATISTIQUES */}
      {activeTab === 'stats' && (
        <div className="animate-in">
          {stats ? (
            <>
              {/* Stat Cards Grid */}
              <div className="stats-grid">
                {[
                  ['Stages publiés', stats.nb_stages_publies || 0, '🎯'],
                  ['Candidatures', stats.nb_candidatures || 0, '📑'],
                  ['Score moyen', stats.score_matching_moyen != null ? `${Number(stats.score_matching_moyen).toFixed(0)}%` : '—', '⚡'],
                  ['Entreprises validées', stats.nb_entreprises_validees || 0, '🏢'],
                  ['Étudiants inscrits', stats.nb_etudiants || 0, '🎓'],
                ].map(([label, value, icon]) => (
                  <div key={label} className="stat-card">
                    <div className="stat-card__icon">{icon}</div>
                    <div className="stat-card__value">{value}</div>
                    <div className="stat-card__label">{label}</div>
                  </div>
                ))}
              </div>

              {/* Graphical Charts Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

                {/* Graphique 1: Répartition des candidatures */}
                <div className="card">
                  <h3 style={{ fontSize: 18, marginBottom: 20 }}>Répartition des candidatures</h3>
                  {stats.applicationsByStatus && stats.applicationsByStatus.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {stats.applicationsByStatus.map((item) => {
                        const total = stats.nb_candidatures || 1;
                        const pct = Math.round((item.count / total) * 100);
                        const statusLabels = {
                          submitted: 'Soumises',
                          viewed: 'Vues',
                          interview: 'Entretiens',
                          result_positive: 'Acceptées',
                          result_negative: 'Refusées'
                        };
                        return (
                          <div key={item.status}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{statusLabels[item.status] || item.status}</span>
                              <span style={{ fontWeight: 600 }}>{item.count} ({pct}%)</span>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-bar__fill"
                                style={{
                                  width: `${Math.max(pct, 5)}%`,
                                  background: item.status === 'result_positive' ? 'var(--success)' : item.status === 'interview' ? 'var(--accent)' : 'var(--grad-primary)'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">Aucune candidature pour le moment.</div>
                  )}
                </div>

                {/* Graphique 2: Performance Moteur Matching */}
                <div className="card">
                  <h3 style={{ fontSize: 18, marginBottom: 20 }}>Performance Algorithmique</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 0' }}>
                    <div style={{ textAlign: 'center' }}>
                      <svg width="130" height="130" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#grad-svg)"
                          strokeWidth="3.5"
                          strokeDasharray={`${stats.score_matching_moyen || 0}, 100`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="grad-svg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                        <text x="18" y="20.5" fill="var(--text-primary)" fontSize="7.5" textAnchor="middle" fontWeight="bold" fontFamily="Outfit, sans-serif">
                          {stats.score_matching_moyen ? `${Math.round(stats.score_matching_moyen)}%` : '0%'}
                        </text>
                      </svg>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600 }}>Score Moyen Global</div>
                    </div>

                    <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 24 }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Validées</div>
                        <div style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--success)' }}>{stats.nb_entreprises_validees || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>En Attente</div>
                        <div style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--warning)' }}>{pending.length}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="empty-state">Statistiques non disponibles.</div>
          )}
        </div>
      )}

      {/* TAB 2: VALIDATION ENTREPRISES */}
      {activeTab === 'companies' && (
        <div className="animate-in">
          <h2 style={{ fontSize: 20, marginBottom: 18 }}>Demandes de validation entreprises ({pending.length})</h2>
          {!pending.length && <div className="empty-state card">Aucune entreprise en attente de validation.</div>}
          {pending.map((c) => (
            <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  ✉ Contact : {c.contact_email || 'Non renseigné'} · Secteur : {c.sector || 'Non renseigné'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn--danger btn--sm" onClick={() => decideCompany(c.id, 'rejected')}>
                  Refuser
                </button>
                <button className="btn btn--success btn--sm" onClick={() => decideCompany(c.id, 'approved')}>
                  ✓ Valider l'entreprise
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: GESTION UTILISATEURS */}
      {activeTab === 'users' && (
        <div className="animate-in">
          <h2 style={{ fontSize: 20, marginBottom: 18 }}>Liste des utilisateurs ({users.length})</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 20px' }}>Email</th>
                  <th style={{ padding: '16px 20px' }}>Rôle</th>
                  <th style={{ padding: '16px 20px' }}>Statut</th>
                  <th style={{ padding: '16px 20px' }}>Inscrit le</th>
                  <th style={{ padding: '16px 20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{u.email}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`tag ${u.role === 'admin' ? 'tag--active' : u.role === 'company' ? 'tag--warning' : ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`tag ${u.is_active ? 'tag--success' : 'tag--danger'}`}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {u.is_active && u.role !== 'admin' ? (
                        <button className="btn btn--danger btn--xs" onClick={() => handleDeactivateUser(u.id)}>
                          Désactiver
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RÉFÉRENTIEL COMPÉTENCES & FILIÈRES */}
      {activeTab === 'referentiel' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="animate-in">

          {/* Section Compétences */}
          <div className="card">
            <h2 style={{ fontSize: 18, marginBottom: 18 }}>Référentiel de Compétences</h2>

            <form onSubmit={handleAddSkill} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="sk-name">Nom de la compétence</label>
                <input
                  id="sk-name"
                  placeholder="Ex : Docker, GraphQL, Figma..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  required
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="sk-cat">Catégorie</label>
                <input
                  id="sk-cat"
                  placeholder="Ex : DevOps, Backend, Design..."
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn--primary btn--sm" style={{ alignSelf: 'flex-start' }}>
                + Ajouter la compétence
              </button>
            </form>

            <div className="section-title">Compétences existantes ({skills.length})</div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {skills.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                    {s.category && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>({s.category})</span>}
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(s.id)}
                    className="btn btn--ghost btn--xs"
                    style={{ color: 'var(--danger)' }}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section Filières */}
          <div className="card">
            <h2 style={{ fontSize: 18, marginBottom: 18 }}>Filières d'Études</h2>

            <form onSubmit={handleAddField} style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="fd-name">Nom de la filière</label>
                <input
                  id="fd-name"
                  placeholder="Ex : Génie Logiciel, CyberSécurité..."
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary btn--sm" style={{ alignSelf: 'flex-start' }}>
                + Ajouter la filière
              </button>
            </form>

            <div className="section-title">Filières existantes ({fields.length})</div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {!fields.length && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Aucune filière configurée.</div>}
              {fields.map((f) => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>
                  <button
                    onClick={() => handleDeleteField(f.id)}
                    className="btn btn--ghost btn--xs"
                    style={{ color: 'var(--danger)' }}
                  >
                    Supprimer
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
