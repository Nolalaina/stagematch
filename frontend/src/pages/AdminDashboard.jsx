import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { BarChart3, Building2, Users, Sliders, Target, FileText, Sparkles, GraduationCap, Mail, CheckCircle2, XCircle, Plus, Trash2, Ban, ShieldCheck } from 'lucide-react';

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
    Promise.all([api.getPendingCompanies().catch(() => []), api.getAdminStats().catch(() => null), api.getAdminSkills().catch(() => []), api.getAdminFields().catch(() => []), api.getAdminUsers().catch(() => [])])
      .then(([pend, st, sk, fd, usrs]) => { setPending(pend); setStats(st); setSkills(sk); setFields(fd); setUsers(usrs); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  async function decideCompany(id, decision) {
    try { await api.validateCompany(id, decision); refresh(); } catch (err) { setError(err.message); }
  }
  async function handleDeactivateUser(id) {
    if (!confirm('Voulez-vous vraiment désactiver cet utilisateur ?')) return;
    try { await api.deactivateUser(id); refresh(); } catch (err) { setError(err.message); }
  }
  async function handleAddSkill(e) {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    try { await api.createAdminSkill({ name: newSkillName, category: newSkillCategory }); setNewSkillName(''); setNewSkillCategory(''); setSuccessMsg('Compétence ajoutée avec succès.'); refresh(); } catch (err) { setError(err.message); }
  }
  async function handleDeleteSkill(id) {
    if (!confirm('Voulez-vous supprimer cette compétence ?')) return;
    try { await api.deleteAdminSkill(id); refresh(); } catch (err) { setError(err.message); }
  }
  async function handleAddField(e) {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    try { await api.createAdminField({ name: newFieldName }); setNewFieldName(''); setSuccessMsg('Filière ajoutée avec succès.'); refresh(); } catch (err) { setError(err.message); }
  }
  async function handleDeleteField(id) {
    if (!confirm('Voulez-vous supprimer cette filière ?')) return;
    try { await api.deleteAdminField(id); refresh(); } catch (err) { setError(err.message); }
  }

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement de l'administration…</span></div></div>
  );

  return (
    <div className="container page">
      <div className="dash-head">
        <div>
          <h1><ShieldCheck size={28} /> Console d'administration</h1>
          <p>Supervision globale et gestion des accès StageMatch</p>
        </div>
        <div className="tabs" role="tablist" aria-label="Sections admin">
          <button type="button" className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><BarChart3 size={15} /><span>Statistiques</span></button>
          <button type="button" className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`} onClick={() => setActiveTab('companies')}><Building2 size={15} /><span>Entreprises ({pending.length})</span></button>
          <button type="button" className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={15} /><span>Utilisateurs ({users.length})</span></button>
          <button type="button" className={`tab-btn ${activeTab === 'referentiel' ? 'active' : ''}`} onClick={() => setActiveTab('referentiel')}><Sliders size={15} /><span>Référentiel</span></button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {activeTab === 'stats' && (
        <div className="animate-in">
          {stats ? (
            <>
              <div className="stats-grid">
                {[
                  ['Stages publiés', stats.nb_stages_publies || 0, Target],
                  ['Candidatures', stats.nb_candidatures || 0, FileText],
                  ['Score moyen', stats.score_matching_moyen != null ? `${Number(stats.score_matching_moyen).toFixed(0)}%` : '—', Sparkles],
                  ['Entreprises validées', stats.nb_entreprises_validees || 0, Building2],
                  ['Étudiants inscrits', stats.nb_etudiants || 0, GraduationCap],
                ].map(([label, value, Icon]) => (
                  <div key={label} className="stat-card"><div className="stat-card__icon"><Icon size={24} /></div><div className="stat-card__value">{value}</div><div className="stat-card__label">{label}</div></div>
                ))}
              </div>
              <div className="dash-grid">
                <div className="card card--pad">
                  <h3 className="mb">Répartition des candidatures</h3>
                  {stats.applicationsByStatus && stats.applicationsByStatus.length > 0 ? (
                    stats.applicationsByStatus.map((item) => {
                      const total = stats.nb_candidatures || 1;
                      const pct = Math.round((item.count / total) * 100);
                      const statusLabels = { submitted: 'Soumises', viewed: 'Examinées', interview: 'Entretiens planifiés', result_positive: 'Candidatures retenues', result_negative: 'Candidatures refusées' };
                      return (
                        <div key={item.status} className="progress">
                          <div className="progress__head"><span className="muted">{statusLabels[item.status] || item.status}</span><span>{item.count} ({pct}%)</span></div>
                          <div className="progress__track"><div className={`progress__fill ${item.status === 'result_positive' ? 'progress__fill--success' : ''}`} style={{ '--w': `${Math.max(pct, 5)}%` }} /></div>
                        </div>
                      );
                    })
                  ) : <div className="empty-state">Aucune candidature enregistrée.</div>}
                </div>
                <div className="card card--pad">
                  <h3 className="mb">Adéquation moteur matching</h3>
                  <div className="gap-row">
                    <div className="center"><div className="stat-card__value">{stats.score_matching_moyen ? `${Math.round(stats.score_matching_moyen)}%` : '0%'}</div><div className="stat-card__label">Score moyen global</div></div>
                    <div><div className="stat-card__label">Comptes validés</div><div className="score--good">{stats.nb_entreprises_validees || 0}</div><div className="stat-card__label mt">Demandes en attente</div><div className="score--mid">{pending.length}</div></div>
                  </div>
                </div>
              </div>
            </>
          ) : <div className="empty-state">Statistiques non disponibles.</div>}
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="animate-in">
          <h2 className="mb">Demandes de validation entreprises ({pending.length})</h2>
          {!pending.length && <div className="empty-state card">Aucune entreprise en attente de validation.</div>}
          {pending.map((c) => (
            <div key={c.id} className="card card--pad mb gap-row">
              <div className="stack"><strong>{c.name}</strong><span className="meta"><span><Mail size={13} /> {c.contact_email || 'Non renseigné'}</span><span>Secteur : {c.sector || 'Non renseigné'}</span></span></div>
              <div className="row-end mt"><button type="button" className="btn btn--danger btn--sm" onClick={() => decideCompany(c.id, 'rejected')}><XCircle size={14} /> Refuser</button><button type="button" className="btn btn--success btn--sm" onClick={() => decideCompany(c.id, 'approved')}><CheckCircle2 size={14} /> Valider l'entreprise</button></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="animate-in">
          <h2 className="mb">Répertoire des comptes utilisateurs ({users.length})</h2>
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Email</th><th>Rôle</th><th>Statut</th><th>Inscrit le</th><th>Action</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.email}</strong></td>
                    <td><span className={`tag ${u.role === 'admin' ? 'tag--active' : u.role === 'company' ? 'tag--warning' : ''}`}>{u.role}</span></td>
                    <td><span className={`tag ${u.is_active ? 'tag--success' : 'tag--danger'}`}>{u.is_active ? 'Actif' : 'Inactif'}</span></td>
                    <td className="muted">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>{u.is_active && u.role !== 'admin' ? <button type="button" className="btn btn--danger btn--xs" onClick={() => handleDeactivateUser(u.id)}><Ban size={12} /> Désactiver</button> : <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'referentiel' && (
        <div className="dash-grid animate-in">
          <div className="card card--pad">
            <h2 className="mb">Référentiel de compétences</h2>
            <form onSubmit={handleAddSkill} className="stack mb">
              <div className="field"><label htmlFor="sk-name">Nom de la compétence</label><input id="sk-name" placeholder="Ex : Docker, GraphQL, Figma…" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} required /></div>
              <div className="field"><label htmlFor="sk-cat">Catégorie</label><input id="sk-cat" placeholder="Ex : DevOps, Backend, Design…" value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)} /></div>
              <button type="submit" className="btn btn--primary btn--sm"><Plus size={14} /> Ajouter la compétence</button>
            </form>
            <div className="section-title">Compétences enregistrées ({skills.length})</div>
            <div className="stack--sm">
              {skills.map((s) => (
                <div key={s.id} className="gap-row"><span><strong>{s.name}</strong>{s.category && <span className="muted"> ({s.category})</span>}</span><button type="button" onClick={() => handleDeleteSkill(s.id)} className="btn btn--ghost btn--xs"><Trash2 size={12} /> Supprimer</button></div>
              ))}
            </div>
          </div>
          <div className="card card--pad">
            <h2 className="mb">Filières d'études</h2>
            <form onSubmit={handleAddField} className="stack mb">
              <div className="field"><label htmlFor="fd-name">Nom de la filière</label><input id="fd-name" placeholder="Ex : Génie Logiciel, CyberSécurité…" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} required /></div>
              <button type="submit" className="btn btn--primary btn--sm"><Plus size={14} /> Ajouter la filière</button>
            </form>
            <div className="section-title">Filières enregistrées ({fields.length})</div>
            <div className="stack--sm">
              {!fields.length && <p className="muted">Aucune filière configurée.</p>}
              {fields.map((f) => (
                <div key={f.id} className="gap-row"><strong>{f.name}</strong><button type="button" onClick={() => handleDeleteField(f.id)} className="btn btn--ghost btn--xs"><Trash2 size={12} /> Supprimer</button></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
