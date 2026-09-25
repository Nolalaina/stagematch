import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const STATUS_CONFIG = {
  submitted:        { label: 'Soumise',    className: 'tag', color: 'var(--text-muted)' },
  viewed:           { label: 'Vue',         className: 'tag tag--warning', color: 'var(--warning)' },
  interview:        { label: 'Entretien',  className: 'tag tag--active', color: 'var(--accent)' },
  result_positive:  { label: '✓ Acceptée', className: 'tag tag--success', color: 'var(--success)' },
  result_negative:  { label: '✗ Refusée', className: 'tag tag--danger', color: 'var(--danger)' },
};

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container">
      <div className="loading-page"><div className="spinner" /><span>Chargement…</span></div>
    </div>
  );

  const counts = {
    total: applications.length,
    active: applications.filter(a => !['result_positive','result_negative'].includes(a.status)).length,
    success: applications.filter(a => a.status === 'result_positive').length,
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Mes <span className="grad-text">Candidatures</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Suivez en temps réel l'avancement de vos candidatures</p>
      </div>

      {/* Summary stats */}
      {applications.length > 0 && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          {[
            { value: counts.total, label: 'Total', color: 'var(--accent)' },
            { value: counts.active, label: 'En cours', color: 'var(--warning)' },
            { value: counts.success, label: 'Acceptées', color: 'var(--success)' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {!applications.length && (
        <div className="empty-state">
          <p>Vous n'avez pas encore postulé.</p>
          <Link to="/internships" className="btn btn--primary" style={{ marginTop: 16 }}>
            Explorer les offres →
          </Link>
        </div>
      )}

      {applications.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px' }}>Offre</th>
                <th style={{ padding: '16px 20px' }}>Entreprise</th>
                <th style={{ padding: '16px 20px' }}>Score</th>
                <th style={{ padding: '16px 20px' }}>Statut</th>
                <th style={{ padding: '16px 20px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => {
                const cfg = STATUS_CONFIG[a.status] || { label: a.status, className: 'tag' };
                return (
                  <tr key={a.id}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{a.title}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{a.company_name}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontWeight: 700, color: Number(a.match_score) >= 60 ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {Number(a.match_score).toFixed(0)}%
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={cfg.className}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(a.applied_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
