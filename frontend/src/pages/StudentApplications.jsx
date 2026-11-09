import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { FileText, Clock, Eye, Users, CheckCircle2, XCircle, Building2, ArrowRight, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
  submitted: { label: 'Soumise', icon: Clock, className: 'tag' },
  viewed: { label: 'Vue par RH', icon: Eye, className: 'tag tag--warning' },
  interview: { label: 'Entretien', icon: Users, className: 'tag tag--active' },
  result_positive: { label: 'Acceptée', icon: CheckCircle2, className: 'tag tag--success' },
  result_negative: { label: 'Refusée', icon: XCircle, className: 'tag tag--danger' },
};

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyApplications().then(setApplications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement des candidatures…</span></div></div>
  );

  const counts = {
    total: applications.length,
    active: applications.filter(a => !['result_positive', 'result_negative'].includes(a.status)).length,
    success: applications.filter(a => a.status === 'result_positive').length,
  };

  return (
    <div className="container page">
      <div className="page__head">
        <h1>Suivi de mes candidatures</h1>
        <p>Consultez en temps réel l'avancement et les décisions des recruteurs</p>
      </div>

      {applications.length > 0 && (
        <div className="stats-grid">
          {[
            { value: counts.total, label: 'Candidatures envoyées', icon: FileText },
            { value: counts.active, label: "En cours d'examen", icon: TrendingUp },
            { value: counts.success, label: 'Offres acceptées', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card"><div className="stat-card__row"><div className="stat-card__icon"><Icon size={20} /></div><div><div className="stat-card__value">{s.value}</div><div className="stat-card__label">{s.label}</div></div></div></div>
            );
          })}
        </div>
      )}

      {!applications.length && (
        <div className="card empty-state">
          <p>Vous n'avez pas encore postulé à des offres de stage.</p>
          <Link to="/internships" className="btn btn--primary"><span>Explorer les opportunités</span><ArrowRight size={16} /></Link>
        </div>
      )}

      {applications.length > 0 && (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>Poste cible</th><th>Entreprise</th><th>Score matching</th><th>Statut</th><th>Date d'envoi</th></tr></thead>
            <tbody>
              {applications.map((a) => {
                const cfg = STATUS_CONFIG[a.status] || { label: a.status, className: 'tag', icon: Clock };
                const Icon = cfg.icon;
                return (
                  <tr key={a.id}>
                    <td><strong>{a.title}</strong></td>
                    <td className="muted"><span className="field__label"><Building2 size={14} /> {a.company_name}</span></td>
                    <td><span className={Number(a.match_score) >= 60 ? 'score--good' : 'score--mid'}>{Number(a.match_score).toFixed(0)}%</span></td>
                    <td><span className={cfg.className}><Icon size={13} /><span>{cfg.label}</span></span></td>
                    <td className="muted">{new Date(a.applied_at).toLocaleDateString('fr-FR')}</td>
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
