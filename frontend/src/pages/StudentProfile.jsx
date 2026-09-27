import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  Save, 
  Check, 
  Plus, 
  User, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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
    <div className="container" style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Mon Profil <span className="grad-text">&amp; CV</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Gérez vos informations de carrière et compétences pour optimiser vos scores de matching</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {saved && <div className="success-banner">Profil mis à jour avec succès ! Redirection en cours...</div>}

      {/* ── Section CV ── */}
      <div className="card animate-in" style={{ marginBottom: 24, borderColor: 'rgba(139, 92, 246, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)'
          }}>
            <FileText size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, marginBottom: 2 }}>Analyseur Automatique de CV</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Importez votre CV ou collez son contenu pour faire extraire automatiquement vos compétences
            </p>
          </div>
        </div>

        {cvInfo.cvUrl && (
          <div className="info-banner" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
            <span>
              Document analysé : <strong>{cvInfo.cvUrl}</strong>
              {cvInfo.cvParsedAt && <span style={{ marginLeft: 8, opacity: 0.8 }}>
                · Modifié le {new Date(cvInfo.cvParsedAt).toLocaleDateString('fr-FR')}
              </span>}
            </span>
          </div>
        )}

        {cvMessage && <div className="success-banner">{cvMessage}</div>}

        <form onSubmit={handleCvUpload}>
          <div className="field">
            <label htmlFor="cvFile" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UploadCloud size={14} /> Document CV (PDF, TXT, DOCX)
            </label>
            <input id="cvFile" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
          </div>
          <div className="field">
            <label htmlFor="cvText">Ou collez le texte extrait du CV</label>
            <textarea
              id="cvText"
              rows={3}
              placeholder="Ex : Développeur Web React, Node.js, TypeScript, Docker, SQL, passionné d'architecture logicielle..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn--outline btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} disabled={cvLoading}>
            <Sparkles size={15} />
            <span>{cvLoading ? 'Analyse vectorielle en cours…' : 'Lancer l\'extraction de compétences'}</span>
          </button>
        </form>
      </div>

      {/* ── Infos personnelles ── */}
      <form onSubmit={onSubmit}>
        <div className="card animate-in" style={{ marginBottom: 24, animationDelay: '60ms' }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Informations Personnelles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="fullName" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={13} /> Nom &amp; Prénom
              </label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ex : Jean Dupont"
                required
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="year" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GraduationCap size={13} /> Niveau d'études
              </label>
              <input
                id="year"
                value={form.yearOfStudy}
                onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                placeholder="Ex : Master 1 Génie Logiciel"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="domain" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={13} /> Domaine recherché
              </label>
              <input
                id="domain"
                value={form.desiredDomain}
                onChange={(e) => setForm({ ...form, desiredDomain: e.target.value })}
                placeholder="Ex : Développement Web Full-Stack"
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="location" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} /> Localisation
              </label>
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
            <Globe size={15} style={{ color: 'var(--accent)' }} />
            <span>Ouvert aux opportunités en télétravail</span>
          </label>
        </div>

        {/* ── Compétences ── */}
        <div className="card animate-in" style={{ marginBottom: 24, animationDelay: '120ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18 }}>Référentiel de Compétences</h2>
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
                  style={{ cursor: 'pointer', fontSize: 13, padding: '6px 14px', marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  {isActive ? <Check size={14} /> : <Plus size={14} />}
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          disabled={loading}
        >
          <Save size={18} />
          <span>{loading ? 'Enregistrement…' : 'Enregistrer mon profil'}</span>
        </button>
      </form>
    </div>
  );
}
