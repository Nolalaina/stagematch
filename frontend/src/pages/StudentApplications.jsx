import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { FileText, Clock, Eye, Users, CheckCircle2, XCircle, Building2, ArrowRight, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

const STATUS_CONFIG = {
  submitted: { label: 'Soumise', icon: Clock, className: 'tag' },
  viewed: { label: 'Consultée par RH', icon: Eye, className: 'tag tag--warning' },
  interview: { label: 'Entretien planifié', icon: Users, className: 'tag tag--active' },
  result_positive: { label: 'Candidature retenue', icon: CheckCircle2, className: 'tag tag--success' },
  result_negative: { label: 'Non retenue', icon: XCircle, className: 'tag tag--danger' },
};

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyApplications().then(setApplications).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container"><div className="loading-page"><div className="spinner" /><span>Chargement de vos candidatures…</span></div></div>
  );

  const counts = {
    total: applications.length,
    active: applications.filter(a => !['result_positive', 'result_negative'].includes(a.status)).length,
    success: applications.filter(a => a.status === 'result_positive').length,
  };

  return (
    <div className="container page">
      <div className="dash-head">
        <div>
          <h1>Suivi de mes candidatures</h1>
          <p>Consultez en direct l'avancement et les décisions des recruteurs</p>
        </div>
        <Link to="/internships" className="btn btn--outline btn--sm">
          <span>Découvrir de nouvelles offres</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {applications.length > 0 && (
        <div className="stats-grid mb">
          {[
            { value: counts.total, label: 'Candidatures transmises', icon: FileText },
            { value: counts.active, label: "En cours d'évaluation", icon: TrendingUp },
            { value: counts.success, label: 'Offres acceptées', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div className="stat-card__row">
                  <div className="stat-card__icon"><Icon size={20} /></div>
                  <div>
                    <div className="stat-card__value">{s.value}</div>
                    <div className="stat-card__label">{s.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!applications.length && (
        <div className="card empty-state animate-in">
          <p>Vous n'avez pas encore postulé à des offres de stage.</p>
          <Link to="/internships" className="btn btn--primary">
            <span>Explorer les opportunités</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {applications.length > 0 && (
        <div className="card table-wrap animate-in">
          <table className="app-table">
            <thead>
              <tr>
                <th>Intitulé de l'offre</th>
                <th>Entreprise</th>
                <th>Score de compatibilité</th>
                <th>Statut du recrutement</th>
                <th>Date d'envoi</th>
                <th className="th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => {
                const cfg = STATUS_CONFIG[a.status] || { label: a.status, className: 'tag', icon: Clock };
                const Icon = cfg.icon;
                const score = Number(a.match_score) || 0;
                return (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.title}</strong>
                    </td>
                    <td className="muted">
                      <span className="field__label"><Building2 size={14} /> {a.company_name}</span>
                    </td>
                    <td>
                      <span className={`score-badge ${score >= 60 ? 'score-badge--good' : 'score-badge--mid'}`}>
                        {Math.round(score)}% match
                      </span>
                    </td>
                    <td>
                      <span className={cfg.className}>
                        <Icon size={12} />
                        <span>{cfg.label}</span>
                      </span>
                    </td>
                    <td className="muted">
                      <span className="field__label"><Calendar size={13} /> {new Date(a.applied_at).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td>
                      <Link to={`/internships/${a.internship_id || a.id}`} className="btn btn--ghost btn--xs" title="Consulter la fiche de stage">
                        <span>Fiche</span>
                        <ExternalLink size={12} />
                      </Link>
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
