import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { 
  FileText, 
  Clock, 
  Eye, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const STATUS_CONFIG = {
  submitted:        { label: 'Soumise',    icon: Clock,        className: 'tag', color: 'var(--text-muted)' },
  viewed:           { label: 'Vue par RH', icon: Eye,          className: 'tag tag--warning', color: 'var(--warning)' },
  interview:        { label: 'Entretien',  icon: Users,        className: 'tag tag--active', color: 'var(--accent)' },
  result_positive:  { label: 'Acceptée',   icon: CheckCircle2, className: 'tag tag--success', color: 'var(--success)' },
  result_negative:  { label: 'Refusée',    icon: XCircle,      className: 'tag tag--danger', color: 'var(--danger)' },
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
      <div className="loading-page"><div className="spinner" /><span>Chargement des candidatures…</span></div>
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
        <h1 style={{ fontSize: 32, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          Suivi de mes <span className="grad-text">Candidatures</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Consultez en temps réel l'avancement et les décisions des recruteurs</p>
      </div>

      {/* Summary stats */}
      {applications.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { value: counts.total, label: 'Candidatures envoyées', color: 'var(--accent)', icon: FileText },
            { value: counts.active, label: 'En cours d\'examen', color: 'var(--warning)', icon: TrendingUp },
            { value: counts.success, label: 'Offres acceptées', color: 'var(--success)', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: s.color
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!applications.length && (
        <div className="empty-state card">
          <p>Vous n'avez pas encore postulé à des offres de stage.</p>
          <Link to="/internships" className="btn btn--primary" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span>Explorer les opportunités</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {applications.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px' }}>Poste Cible</th>
                <th style={{ padding: '16px 20px' }}>Entreprise</th>
                <th style={{ padding: '16px 20px' }}>Score Matching</th>
                <th style={{ padding: '16px 20px' }}>Statut</th>
                <th style={{ padding: '16px 20px' }}>Date d'envoi</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => {
                const cfg = STATUS_CONFIG[a.status] || { label: a.status, className: 'tag', icon: Clock };
                const Icon = cfg.icon;
                return (
                  <tr key={a.id}>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{a.title}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={14} /> {a.company_name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontWeight: 800, color: Number(a.match_score) >= 60 ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {Number(a.match_score).toFixed(0)}%
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={cfg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Icon size={13} />
                        <span>{cfg.label}</span>
                      </span>
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
