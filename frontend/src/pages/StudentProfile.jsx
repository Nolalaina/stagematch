import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { FileText, UploadCloud, Sparkles, Save, Check, Plus, User, GraduationCap, Briefcase, MapPin, Globe, CheckCircle2 } from 'lucide-react';

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
      setForm({ fullName: p.full_name || '', yearOfStudy: p.year_of_study || '', desiredDomain: p.desired_domain || '', location: p.location || '', acceptsRemote: !!p.accepts_remote });
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

  const filteredSkills = activeCategory === 'Tous' ? allSkills : allSkills.filter((s) => s.category === activeCategory);

  return (
    <div className="container page wide">
      <div className="page__head">
        <h1>Mon profil et CV</h1>
        <p>Gérez vos informations et compétences pour optimiser vos scores de matching</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {saved && <div className="success-banner">Profil mis à jour avec succès ! Redirection en cours…</div>}

      <div className="card card--pad mb animate-in">
        <div className="gap-row mb"><div className="avatar avatar--sm"><FileText size={22} /></div><div><h2>Analyseur automatique de CV</h2><p className="muted">Importez votre CV ou collez son contenu pour extraire automatiquement vos compétences</p></div></div>
        {cvInfo.cvUrl && (
          <div className="info-banner"><CheckCircle2 size={16} /><span>Document analysé : <strong>{cvInfo.cvUrl}</strong>{cvInfo.cvParsedAt && <span> · Modifié le {new Date(cvInfo.cvParsedAt).toLocaleDateString('fr-FR')}</span>}</span></div>
        )}
        {cvMessage && <div className="success-banner">{cvMessage}</div>}
        <form onSubmit={handleCvUpload}>
          <div className="field">
            <label htmlFor="cvFile"><span className="field__label"><UploadCloud size={14} /> Document CV (PDF, TXT, DOCX)</span></label>
            <input id="cvFile" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
          </div>
          <div className="field">
            <label htmlFor="cvText">Ou collez le texte extrait du CV</label>
            <textarea id="cvText" rows={3} placeholder="Ex : Développeur Web React, Node.js, TypeScript, Docker, SQL…" value={cvText} onChange={(e) => setCvText(e.target.value)} />
          </div>
          <button type="submit" className="btn btn--outline btn--sm" disabled={cvLoading}><Sparkles size={15} /><span>{cvLoading ? 'Analyse en cours…' : "Lancer l'extraction de compétences"}</span></button>
        </form>
      </div>

      <form onSubmit={onSubmit}>
        <div className="card card--pad mb animate-in">
          <h2 className="mb">Informations personnelles</h2>
          <div className="field__row">
            <div className="field"><label htmlFor="fullName"><span className="field__label"><User size={13} /> Nom et prénom</span></label><input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Ex : Jean Dupont" required /></div>
            <div className="field"><label htmlFor="year"><span className="field__label"><GraduationCap size={13} /> Niveau d'études</span></label><input id="year" value={form.yearOfStudy} onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })} placeholder="Ex : Master 1 Génie Logiciel" /></div>
            <div className="field"><label htmlFor="domain"><span className="field__label"><Briefcase size={13} /> Domaine recherché</span></label><input id="domain" value={form.desiredDomain} onChange={(e) => setForm({ ...form, desiredDomain: e.target.value })} placeholder="Ex : Développement Web Full-Stack" /></div>
            <div className="field"><label htmlFor="location"><span className="field__label"><MapPin size={13} /> Localisation</span></label><input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex : Antananarivo" /></div>
          </div>
          <label className="check mt"><input type="checkbox" checked={form.acceptsRemote} onChange={(e) => setForm({ ...form, acceptsRemote: e.target.checked })} /><Globe size={15} /><span>Ouvert aux opportunités en télétravail</span></label>
        </div>

        <div className="card card--pad mb animate-in">
          <div className="dash-head"><h2>Référentiel de compétences</h2><span className="tag tag--active">{selectedSkillIds.length} sélectionnée{selectedSkillIds.length !== 1 ? 's' : ''}</span></div>
          <div className="gap-row--sm mb">
            {CATEGORIES.filter(c => c === 'Tous' || allSkills.some(s => s.category === c)).map((cat) => (
              <button key={cat} type="button" onClick={() => setActiveCategory(cat)} className={`tag ${activeCategory === cat ? 'tag--active' : ''}`}>{cat}</button>
            ))}
          </div>
          <div className="gap-row--sm">
            {filteredSkills.map((s) => {
              const isActive = selectedSkillIds.includes(s.id);
              return (
                <button key={s.id} type="button" onClick={() => toggleSkill(s.id)} className={`tag ${isActive ? 'tag--active' : ''}`}>
                  {isActive ? <Check size={14} /> : <Plus size={14} />}<span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}><Save size={18} /><span>{loading ? 'Enregistrement…' : 'Enregistrer mon profil'}</span></button>
      </form>
    </div>
  );
}
