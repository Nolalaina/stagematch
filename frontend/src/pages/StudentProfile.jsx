import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const CATEGORIES = ['Tous', 'Frameworks', 'Langages', 'Bases de données', 'DevOps', 'Architecture', 'Outils', 'Mobile', 'Soft skills'];

export default function StudentProfile() {
  const [form, setForm] = useState({ fullName: '', yearOfStudy: '', desiredDomain: '', location: '', acceptsRemote: false });
  const [cvInfo, setCvInfo] = useState({ cvUrl: '', cvParsedAt: null });
  const [cvText, setCvText] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [cvMessage, setCvMessage] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getMyStudentProfile(), api.getSkills()]).then(([p, skills]) => {
      setForm({
        fullName: p.full_name || '',
        yearOfStudy: p.year_of_study || '',
        desiredDomain: p.desired_domain || '',
        location: p.location || '',
        acceptsRemote: !!p.accepts_remote,
      });
      setCvInfo({ cvUrl: p.cv_url || '', cvParsedAt: p.cv_parsed_at || null });
      setSelectedSkillIds((p.skills || []).map((s) => s.id));
      setAllSkills(skills);
    }).catch((err) => setError(err.message));
  }, []);

  function toggleSkill(id) {
    setSelectedSkillIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  }

  async function handleCvUpload(e) {
    e.preventDefault();
    setError('');
    setCvMessage('');
    setCvLoading(true);
    try {
      const res = await api.uploadCv({ cvText, fileName: cvFileName || 'cv_etudiant.pdf' });
      setCvInfo({ cvUrl: res.cvUrl, cvParsedAt: res.parsedAt });
      setCvMessage(res.message);
      if (res.extractedSkills?.length > 0) {
        const newIds = res.extractedSkills.map((s) => s.id);
        setSelectedSkillIds((prev) => Array.from(new Set([...prev, ...newIds])));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCvLoading(false);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setCvText(event.target.result || '');
      reader.readAsText(file);
    }
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.updateMyStudentProfile({ ...form, skillIds: selectedSkillIds });
      setSaved(true);
      setTimeout(() => navigate('/student'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredSkills = activeCategory === 'Tous'
    ? allSkills
    : allSkills.filter((s) => s.category === activeCategory);

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Mon Profil <span className="grad-text">&amp; CV</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gérez vos informations et vos compétences pour améliorer vos recommandations</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {saved && <div className="success-banner">Profil enregistré avec succès !</div>}

      {/* ── Section CV ── */}
      <div className="card animate-in" style={{ marginBottom: 24, borderColor: 'rgba(129,140,248,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 24 }}>📄</div>
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 2 }}>Extraction automatique du CV</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Importez votre CV ou collez son contenu pour détecter automatiquement vos compétences
            </p>
          </div>
        </div>

        {cvInfo.cvUrl && (
          <div className="info-banner" style={{ marginBottom: 16 }}>
            CV actuel : <strong>{cvInfo.cvUrl}</strong>
            {cvInfo.cvParsedAt && <span style={{ marginLeft: 8, opacity: 0.7 }}>
              · Analysé le {new Date(cvInfo.cvParsedAt).toLocaleDateString('fr-FR')}
            </span>}
          </div>
        )}

        {cvMessage && <div className="success-banner">{cvMessage}</div>}

        <form onSubmit={handleCvUpload}>
          <div className="field">
            <label htmlFor="cvFile">Sélectionner un fichier CV (PDF, TXT, DOC)</label>
            <input id="cvFile" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
          </div>
          <div className="field">
            <label htmlFor="cvText">Ou coller le texte du CV</label>
            <textarea
              id="cvText"
              rows={3}
              placeholder="Ex : Développeur React, Node.js, TypeScript, Docker, passionné de JavaScript…"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--outline btn--sm" disabled={cvLoading}>
            {cvLoading ? '⏳ Analyse en cours…' : '⚡ Analyser et extraire les compétences'}
          </button>
        </form>
      </div>

      {/* ── Infos personnelles ── */}
      <form onSubmit={onSubmit}>
        <div className="card animate-in" style={{ marginBottom: 24, animationDelay: '60ms' }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Informations personnelles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="fullName">Nom complet</label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ex : Rakoto Jean"
                required
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="year">Niveau d'études</label>
              <input
                id="year"
                value={form.yearOfStudy}
                onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                placeholder="Ex : Licence 3, Master 1"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="domain">Domaine souhaité</label>
              <input
                id="domain"
                value={form.desiredDomain}
                onChange={(e) => setForm({ ...form, desiredDomain: e.target.value })}
                placeholder="Ex : Développement web"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="location">Localisation</label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex : Antananarivo"
              />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)', marginTop: 20, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.acceptsRemote}
              onChange={(e) => setForm({ ...form, acceptsRemote: e.target.checked })}
            />
            J'accepte les postes en télétravail
          </label>
        </div>

        {/* ── Compétences ── */}
        <div className="card animate-in" style={{ marginBottom: 24, animationDelay: '120ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18 }}>Compétences</h2>
            <span className="tag tag--active">{selectedSkillIds.length} sélectionnée{selectedSkillIds.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {CATEGORIES.filter(c => c === 'Tous' || allSkills.some(s => s.category === c)).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`tag ${activeCategory === cat ? 'tag--active' : ''}`}
                style={{ cursor: 'pointer', fontSize: 12 }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div>
            {filteredSkills.map((s) => {
              const isActive = selectedSkillIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSkill(s.id)}
                  className={`tag ${isActive ? 'tag--active' : ''}`}
                  style={{ cursor: 'pointer', fontSize: 13, padding: '6px 14px', marginBottom: 8 }}
                >
                  {isActive ? '✓ ' : '+ '}{s.name}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: '100%', padding: '14px' }}
          disabled={loading}
        >
          {loading ? 'Enregistrement…' : '💾 Enregistrer le profil'}
        </button>
      </form>
    </div>
  );
}
