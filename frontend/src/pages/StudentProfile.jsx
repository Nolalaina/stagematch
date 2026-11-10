import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { FileText, UploadCloud, Sparkles, Save, Check, Plus, User, GraduationCap, Briefcase, MapPin, Globe, CheckCircle2, Calendar } from 'lucide-react';

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
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getMyStudentProfile(), api.getSkills()]).then(([p, skills]) => {
      setForm({ fullName: p.full_name || '', yearOfStudy: p.year_of_study || '', desiredDomain: p.desired_domain || '', location: p.location || '', acceptsRemote: !!p.accepts_remote });
      setCvInfo({ cvUrl: p.cv_url || '', cvParsedAt: p.cv_parsed_at || null });
      setSelectedSkillIds((p.skills || []).map((s) => s.id));
      setAllSkills(skills || []);
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

  const filteredSkills = activeCategory === 'Tous' ? allSkills : allSkills.filter((s) => s.category === activeCategory);

  return (
    <div className="container page wide">
      <div className="page__head">
        <h1>Mon profil et CV</h1>
        <p>Gérez vos données de formation et vos compétences techniques pour maximiser vos opportunités</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {saved && <div className="success-banner"><CheckCircle2 size={16} /><span>Profil mis à jour avec succès. Redirection vers votre tableau de bord…</span></div>}

      {/* ── MODULE EXTRACTION CV ── */}
      <div className="card card--pad mb animate-in">
        <div className="section-header-compact">
          <div className="avatar avatar--sm"><FileText size={20} /></div>
          <div>
            <h2>Analyseur automatique de CV</h2>
            <p className="muted">Importez votre CV pour extraire et classifier instantanément vos compétences</p>
          </div>
        </div>

        {cvInfo.cvUrl && (
          <div className="info-banner">
            <CheckCircle2 size={16} />
            <div className="meta">
              <span>Document enregistré : <strong>{cvInfo.cvUrl}</strong></span>
              {cvInfo.cvParsedAt && <span><Calendar size={13} /> {new Date(cvInfo.cvParsedAt).toLocaleDateString('fr-FR')}</span>}
            </div>
          </div>
        )}

        {cvMessage && <div className="success-banner"><CheckCircle2 size={16} /><span>{cvMessage}</span></div>}

        <form onSubmit={handleCvUpload} className="cv-upload-form">
          <div
            className="file-dropzone"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="cvFile"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="visually-hidden"
            />
            <UploadCloud size={30} className="file-dropzone__icon" />
            <div className="file-dropzone__text">
              <strong>{cvFileName ? cvFileName : 'Cliquez pour sélectionner votre fichier CV'}</strong>
              <span className="muted">Formats acceptés : PDF, TXT, DOCX (analyse textuelle)</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="cvText"><span className="field__label"><FileText size={13} /> Ou collez directement le texte de votre parcours</span></label>
            <textarea
              id="cvText"
              rows={3}
              placeholder="Ex : Développeur Web React, Node.js, TypeScript, PostgreSQL, Docker, Git, Méthodes Agiles…"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn--outline btn--sm" disabled={cvLoading || (!cvFileName && !cvText)}>
            <Sparkles size={14} />
            <span>{cvLoading ? 'Extraction en cours…' : "Lancer l'extraction de compétences"}</span>
          </button>
        </form>
      </div>

      {/* ── FORMULAIRE INFORMATIONS PERSONNELLES ── */}
      <form onSubmit={onSubmit}>
        <div className="card card--pad mb animate-in">
          <h2>Informations personnelles</h2>
          <p className="muted mb">Ces données sont transmises aux recruteurs lors de vos candidatures</p>

          <div className="field__row">
            <div className="field">
              <label htmlFor="fullName"><span className="field__label"><User size={13} /> Nom et prénom</span></label>
              <input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ex : Alexandre Rakoto"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="year"><span className="field__label"><GraduationCap size={13} /> Niveau / Promotion</span></label>
              <input
                id="year"
                value={form.yearOfStudy}
                onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                placeholder="Ex : Licence 3 Informatique, Master 2 GL"
              />
            </div>
            <div className="field">
              <label htmlFor="domain"><span className="field__label"><Briefcase size={13} /> Filière ciblée</span></label>
              <input
                id="domain"
                value={form.desiredDomain}
                onChange={(e) => setForm({ ...form, desiredDomain: e.target.value })}
                placeholder="Ex : Génie Logiciel, Big Data, DevOps"
              />
            </div>
            <div className="field">
              <label htmlFor="location"><span className="field__label"><MapPin size={13} /> Ville / Région</span></label>
              <input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex : Antananarivo"
              />
            </div>
          </div>

          <label className="check mt">
            <input
              type="checkbox"
              checked={form.acceptsRemote}
              onChange={(e) => setForm({ ...form, acceptsRemote: e.target.checked })}
            />
            <Globe size={15} />
            <span>Ouvert et disponible pour des stages en télétravail</span>
          </label>
        </div>

        {/* ── SÉLECTION DES COMPÉTENCES ── */}
        <div className="card card--pad mb animate-in">
          <div className="dash-head">
            <div>
              <h2>Référentiel de compétences</h2>
              <p className="muted">Sélectionnez les technologies que vous maîtrisez pour le matching</p>
            </div>
            <span className="tag tag--active">{selectedSkillIds.length} sélectionnée{selectedSkillIds.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="category-tabs-wrap mb">
            <div className="tabs" role="tablist" aria-label="Catégories de compétences">
              {CATEGORIES.filter(c => c === 'Tous' || allSkills.some(s => s.category === c)).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="skills-selection-grid">
            {filteredSkills.map((s) => {
              const isActive = selectedSkillIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSkill(s.id)}
                  className={`skill-tag-btn ${isActive ? 'skill-tag-btn--active' : ''}`}
                  aria-pressed={isActive}
                >
                  {isActive ? <Check size={13} /> : <Plus size={13} />}
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          <Save size={16} />
          <span>{loading ? 'Enregistrement en cours…' : 'Enregistrer mon profil et mes compétences'}</span>
        </button>
      </form>
    </div>
  );
}
