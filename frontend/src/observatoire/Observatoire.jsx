/**
 * ═══════════════════════════════════════════════════════════════════
 *  TABLEAU DE BORD PERSONNEL — Suivi de recherche de stage
 * ═══════════════════════════════════════════════════════════════════
 *
 * Design : moderne & premium, sans fioritures futuristes.
 * - Fond sombre ardoise (#111827) avec surface légèrement plus claire
 * - Typographie: Instrument Serif (titres) + Inter (corps)
 * - Canvas 2D : candidatures positionnées par (temps, intérêt)
 * - Navigation 5 points en bas — sobre et élégant
 * - Panneau détail flottant — verre dépoli blanc
 * - Formulaire "tiroir" depuis le bouton +
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { enrichedApplications, STATUS_COLORS, constellationInterviews } from './observatoireData';

// ─── Palette design system ────────────────────────────────────────────────────
const DS = {
  bg: '#0F1117',
  surface: '#161B27',
  surfaceLight: '#1E2535',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.14)',
  text: '#F0EDE8',
  textMuted: 'rgba(240,237,232,0.45)',
  textDim: 'rgba(240,237,232,0.25)',
  accent: '#6C8EFF',      // bleu doux
  accentWarm: '#E8A87C',  // amber chaud
  accentGreen: '#5EC78A', // vert succès
  accentRose: '#E87C8A',  // rose refus
};

// palettes statut — modernes, non conventionnelles
const STATUS_PALETTE = {
  'Entretien':  { dot: '#818CF8', bg: 'rgba(129,140,248,0.12)', text: '#A5B4FC', label: 'Entretien' },
  'Relancé':    { dot: '#38BDF8', bg: 'rgba(56,189,248,0.10)',  text: '#7DD3FC', label: 'Relancé'   },
  'En attente': { dot: '#D4A96B', bg: 'rgba(212,169,107,0.10)', text: '#E4C78B', label: 'En attente'},
  'Accepté':    { dot: '#5EC78A', bg: 'rgba(94,199,138,0.12)',  text: '#86EFB8', label: 'Accepté'   },
  'Refusé':     { dot: '#64748B', bg: 'rgba(100,116,139,0.08)', text: '#94A3B8', label: 'Refusé'    },
};

// ─── Navigation 5 points constellation ───────────────────────────────────────
const NAV_ITEMS = [
  { id: 'candidatures', label: 'Candidatures', icon: '◉' },
  { id: 'entretiens',   label: 'Entretiens',   icon: '◎' },
  { id: 'relances',     label: 'Relances',     icon: '◌' },
  { id: 'archive',      label: 'Archive',      icon: '◇' },
  { id: 'boussole',     label: 'Vue d\'ensemble', icon: '◈' },
];

function ConstellationNav({ active, onChange }) {
  const [hovered, setHovered] = useState(null);

  return (
    <nav
      aria-label="Navigation principale"
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: DS.surface,
        border: `1px solid ${DS.border}`,
        borderRadius: 50,
        padding: '8px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
      }}
    >
      {NAV_ITEMS.map((item, i) => {
        const isActive = active === item.id;
        const isHov = hovered === item.id;
        return (
          <div key={item.id} style={{ position: 'relative' }}>
            {/* Label tooltip */}
            <AnimatePresence>
              {isHov && (
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: 46,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    background: DS.surfaceLight,
                    border: `1px solid ${DS.border}`,
                    borderRadius: 8,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    color: DS.text,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => onChange(item.id)}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                width: 42, height: 42,
                borderRadius: '50%',
                border: 'none',
                background: isActive ? DS.accent + '22' : 'transparent',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                outline: 'none',
                transition: 'background 0.2s',
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="navPill"
                  style={{
                    position: 'absolute', inset: 4,
                    borderRadius: '50%',
                    background: DS.accent + '30',
                    border: `1px solid ${DS.accent}60`,
                  }}
                  transition={{ type: 'spring', damping: 22, stiffness: 350 }}
                />
              )}
              <span style={{
                fontSize: isActive ? 17 : 15,
                color: isActive ? DS.accent : isHov ? DS.text : DS.textMuted,
                transition: 'all 0.2s',
                position: 'relative', zIndex: 1,
                lineHeight: 1,
              }}>
                {item.icon}
              </span>
            </motion.button>
          </div>
        );
      })}
    </nav>
  );
}

// ─── Point candidature ────────────────────────────────────────────────────────
function AppDot({ app, canvasW, canvasH, isSelected, onSelect }) {
  const cx = app.xNorm * canvasW;
  const cy = app.yNorm * canvasH;
  const pal = STATUS_PALETTE[app.status] ?? STATUS_PALETTE['En attente'];
  const size = app.companySize ?? 10;

  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Halo urgence — discret */}
      {app.urgency > 0.4 && (
        <motion.circle
          cx="0" cy="0"
          r={size + 10}
          fill="none"
          stroke={pal.dot}
          strokeWidth="1"
          animate={{ r: [size + 8, size + 16, size + 8], opacity: [0.4, 0.05, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Glow doux */}
      {isSelected && (
        <circle cx="0" cy="0" r={size + 14}
          fill={pal.dot + '20'}
          style={{ filter: 'blur(6px)' }}
        />
      )}

      {/* Corps du point */}
      <motion.circle
        cx="0" cy="0"
        r={size}
        fill={pal.dot}
        opacity={app.status === 'Refusé' ? 0.35 : 0.9}
        style={{ cursor: 'pointer' }}
        onClick={e => { e.stopPropagation(); onSelect(app); }}
        animate={isSelected ? { r: size * 1.25 } : { r: size }}
        whileHover={{ r: size * 1.2, opacity: 1 }}
        transition={{ duration: 0.2 }}
        aria-label={`${app.company} — ${app.status}`}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect(app)}
      />

      {/* Anneau de sélection */}
      {isSelected && (
        <motion.circle
          cx="0" cy="0"
          r={size + 5}
          fill="none"
          stroke={pal.dot}
          strokeWidth="1.5"
          initial={{ opacity: 0, r: size }}
          animate={{ opacity: 1, r: size + 5 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Label entreprise */}
      <text
        y={size + 13}
        textAnchor="middle"
        fill={isSelected ? DS.text : DS.textMuted}
        fontSize="9.5"
        fontFamily="'Inter', sans-serif"
        fontWeight={isSelected ? '600' : '400'}
        letterSpacing="0.03em"
        style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
      >
        {app.company}
      </text>
    </g>
  );
}

// ─── Panneau détail ───────────────────────────────────────────────────────────
function DetailPanel({ app, canvasW, canvasH, onClose }) {
  if (!app) return null;

  const PANEL_W = 320;
  const PANEL_H = 460;
  const rawX = app.xNorm * canvasW + 28;
  const rawY = app.yNorm * canvasH - 50;
  const x = Math.min(rawX, canvasW - PANEL_W - 16);
  const y = Math.max(10, Math.min(rawY, canvasH - PANEL_H - 10));

  const pal = STATUS_PALETTE[app.status] ?? STATUS_PALETTE['En attente'];

  return (
    <motion.div
      key={app.id}
      style={{
        position: 'absolute',
        left: x, top: y,
        width: PANEL_W,
        zIndex: 50,
        background: '#1A2030',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid rgba(255,255,255,0.1)`,
        borderTop: `2px solid ${pal.dot}`,
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.06) inset',
        padding: '20px 22px 18px',
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        aria-label="Fermer"
        style={{
          position: 'absolute', top: 14, right: 14,
          width: 26, height: 26, borderRadius: '50%',
          background: DS.surfaceLight,
          border: `1px solid ${DS.border}`,
          color: DS.textMuted,
          cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.target.style.background = DS.surfaceLight}
      >✕</button>

      {/* Header */}
      <div style={{ marginBottom: 14, paddingRight: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
          <span style={{
            fontSize: 20,
            width: 32, height: 32,
            borderRadius: 8,
            background: pal.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>{app.emoji}</span>
          <h2 style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 18, fontWeight: 400,
            color: DS.text, margin: 0, lineHeight: 1.2,
          }}>{app.company}</h2>
        </div>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11.5, color: DS.textMuted,
          margin: '0 0 10px 0', lineHeight: 1.45,
        }}>{app.position}</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <StatusBadge pal={pal}>{app.status}</StatusBadge>
          <Chip>📍 {app.location}</Chip>
          <Chip>💼 {app.stipend}</Chip>
        </div>
      </div>

      <Divider />

      {/* Timeline */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>Historique</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {app.timeline.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === app.timeline.length - 1 ? pal.dot : DS.textDim,
                  flexShrink: 0,
                }} />
                {i < app.timeline.length - 1 && (
                  <div style={{ width: 1, flexGrow: 1, background: DS.border, marginTop: 3 }} />
                )}
              </div>
              <div style={{ paddingBottom: i < app.timeline.length - 1 ? 6 : 0 }}>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11, fontWeight: 500,
                  color: DS.text, margin: 0,
                }}>{step.title}</p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10.5, color: DS.textMuted,
                  margin: '2px 0 0 0',
                }}>{step.date} · {step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Prochaine action */}
      <div style={{
        background: pal.bg,
        borderRadius: 10,
        padding: '10px 13px',
        marginBottom: 14,
        border: `1px solid ${pal.dot}30`,
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 9.5, fontWeight: 600,
          color: pal.text, letterSpacing: '0.07em',
          textTransform: 'uppercase', margin: '0 0 4px 0',
        }}>Prochaine action</p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12, color: DS.text, margin: 0,
        }}>{app.nextAction}</p>
      </div>

      {/* Notes */}
      {app.notes && (
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11.5, color: DS.textMuted,
          lineHeight: 1.55, margin: '0 0 14px 0',
          fontStyle: 'italic',
        }}>"{app.notes}"</p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 14, color: DS.accentWarm,
        }}>{app.contact}</span>
        <a href={`mailto:${app.contactEmail}`} style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10.5, fontWeight: 500,
          color: DS.accent,
          border: `1px solid ${DS.accent}44`,
          borderRadius: 8, padding: '4px 12px',
          textDecoration: 'none',
          transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = DS.accent + '18'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >Contacter →</a>
      </div>
    </motion.div>
  );
}

// ─── Petits composants UI ─────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: DS.border, margin: '12px 0' }} />;
}
function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: 9.5, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      color: DS.textDim, margin: '0 0 8px 0',
    }}>{children}</p>
  );
}
function StatusBadge({ pal, children }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20,
      background: pal.bg, border: `1px solid ${pal.dot}50`,
      color: pal.text, fontSize: 10, fontWeight: 600,
      fontFamily: "'Inter', sans-serif", letterSpacing: '0.04em',
    }}>{children}</span>
  );
}
function Chip({ children }) {
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 20,
      background: DS.surfaceLight,
      border: `1px solid ${DS.border}`,
      color: DS.textMuted, fontSize: 10,
      fontFamily: "'Inter', sans-serif",
    }}>{children}</span>
  );
}

// ─── Légende statuts ──────────────────────────────────────────────────────────
function StatusLegend() {
  return (
    <div style={{
      position: 'absolute', top: 68, left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', gap: 16, zIndex: 8, pointerEvents: 'none',
    }}>
      {Object.values(STATUS_PALETTE).map(({ dot, text, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, opacity: 0.8 }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: DS.textDim, letterSpacing: '0.05em' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stats — ligne de chiffres sobres ────────────────────────────────────────
function StatBar({ apps }) {
  const total = apps.length;
  const entretiens = apps.filter(a => a.status === 'Entretien').length;
  const accepte = apps.filter(a => a.status === 'Accepté').length;
  const relances = apps.filter(a => a.status === 'Relancé').length;

  const items = [
    { value: total, label: 'candidatures' },
    { value: entretiens, label: 'entretiens' },
    { value: relances, label: 'relances' },
    { value: accepte, label: 'offre acceptée', highlight: true },
  ];

  return (
    <div style={{
      position: 'absolute', top: 18, right: 28,
      display: 'flex', gap: 22, zIndex: 10, pointerEvents: 'none',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ textAlign: 'right' }}>
          <p style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 22, fontWeight: 400,
            color: item.highlight ? DS.accentGreen : DS.text,
            margin: 0, lineHeight: 1,
          }}>{item.value}</p>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 9, color: DS.textDim,
            margin: '2px 0 0 0', letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Canvas candidatures ──────────────────────────────────────────────────────
function CandidatureCanvas({ apps, canvasW, canvasH, selectedApp, onSelect }) {
  // Axe X temporel (labels)
  const xLabels = [
    { label: "Auj.", x: 0.08 },
    { label: '1 sem', x: 0.30 },
    { label: '2 sem', x: 0.55 },
    { label: '3 sem', x: 0.75 },
    { label: '1 mois+', x: 0.92 },
  ];

  return (
    <svg
      width={canvasW} height={canvasH}
      style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      aria-label="Carte des candidatures"
    >
      <defs>
        <filter id="dotGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grille légère */}
      <g opacity="0.06">
        {[0.2, 0.4, 0.6, 0.8].map(y => (
          <line key={y}
            x1={canvasW * 0.04} y1={canvasH * y}
            x2={canvasW * 0.96} y2={canvasH * y}
            stroke="#FFFFFF" strokeWidth="0.5"
          />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map(x => (
          <line key={x}
            x1={canvasW * x} y1={canvasH * 0.05}
            x2={canvasW * x} y2={canvasH * 0.88}
            stroke="#FFFFFF" strokeWidth="0.5"
          />
        ))}
      </g>

      {/* Axe X — temps */}
      <g opacity="0.35">
        {xLabels.map(({ label, x }) => (
          <g key={label} transform={`translate(${canvasW * x}, ${canvasH * 0.91})`}>
            <line x1="0" y1="-4" x2="0" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <text fill="rgba(240,237,232,0.4)" fontSize="9" fontFamily="'Inter',sans-serif" textAnchor="middle" y="12">
              {label}
            </text>
          </g>
        ))}
        {/* Label axe */}
        <text
          x={canvasW * 0.5} y={canvasH * 0.97}
          fill="rgba(240,237,232,0.2)" fontSize="8.5"
          fontFamily="'Inter',sans-serif" textAnchor="middle"
          letterSpacing="0.08em" style={{ textTransform: 'uppercase' }}
        >
          TEMPS DEPUIS L'ENVOI →
        </text>
      </g>

      {/* Axe Y — intérêt */}
      <g opacity="0.3">
        <text
          x={canvasW * 0.02} y={canvasH * 0.5}
          fill="rgba(240,237,232,0.2)" fontSize="8.5"
          fontFamily="'Inter',sans-serif" textAnchor="middle"
          transform={`rotate(-90, ${canvasW * 0.02}, ${canvasH * 0.5})`}
          letterSpacing="0.08em"
        >
          ↑ INTÉRÊT
        </text>
      </g>

      {/* Points candidatures */}
      {apps.map(app => (
        <AppDot
          key={app.id}
          app={app}
          canvasW={canvasW}
          canvasH={canvasH * 0.88}
          isSelected={selectedApp?.id === app.id}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
}

// ─── Vue Entretiens ───────────────────────────────────────────────────────────
function EntretiensView() {
  return (
    <div style={{ padding: '80px 48px 120px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 32, fontWeight: 400,
          color: DS.text, margin: 0,
        }}>Entretiens à venir</h1>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13, color: DS.textMuted,
          margin: '6px 0 0 0',
        }}>3 rendez-vous prévus dans les prochains jours</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {constellationInterviews.map((iv, i) => {
          const pal = Object.values(STATUS_PALETTE)[i % 5];
          return (
            <motion.div
              key={iv.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{
                background: DS.surface,
                border: `1px solid ${DS.border}`,
                borderLeft: `3px solid ${iv.accent}`,
                borderRadius: 14,
                padding: '18px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  color: iv.accent, margin: '0 0 5px 0',
                }}>{iv.type}</p>
                <h3 style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 20, fontWeight: 400,
                  color: DS.text, margin: '0 0 4px 0',
                }}>{iv.company}</h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12, color: DS.textMuted, margin: 0,
                }}>avec {iv.interviewer}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: 18, color: DS.text, margin: '0 0 3px 0',
                }}>{iv.time}</p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11, color: DS.textMuted, margin: '0 0 8px 0',
                }}>{iv.date}</p>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10, color: DS.textMuted,
                  background: DS.surfaceLight,
                  border: `1px solid ${DS.border}`,
                  borderRadius: 8, padding: '3px 9px',
                }}>📡 {iv.mode}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vue Relances ─────────────────────────────────────────────────────────────
function RelancesView({ apps }) {
  const relances = apps.filter(a => a.status === 'Relancé' || (a.urgency > 0.5 && a.status === 'En attente'));

  return (
    <div style={{ padding: '80px 48px 120px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: DS.text, margin: 0 }}>
          Relances
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: DS.textMuted, margin: '6px 0 0 0' }}>
          {relances.length} candidature{relances.length > 1 ? 's' : ''} en attente de suivi
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {relances.map((app, i) => {
          const pal = STATUS_PALETTE[app.status] ?? STATUS_PALETTE['En attente'];
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: DS.surface, border: `1px solid ${DS.border}`,
                borderRadius: 12, padding: '15px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{app.emoji}</span>
                <div>
                  <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: DS.text, margin: 0 }}>{app.company}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: DS.textMuted, margin: '2px 0 0 0' }}>{app.position}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge pal={pal}>{app.status}</StatusBadge>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: DS.textDim, margin: '5px 0 0 0' }}>{app.days}j depuis l'envoi</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vue Archive ──────────────────────────────────────────────────────────────
function ArchiveView({ apps }) {
  const archive = apps.filter(a => a.status === 'Refusé' || a.status === 'Accepté');

  return (
    <div style={{ padding: '80px 48px 120px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: DS.text, margin: 0 }}>
          Archive
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: DS.textMuted, margin: '6px 0 0 0' }}>
          {archive.length} candidature{archive.length > 1 ? 's' : ''} avec réponse définitive
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {archive.map((app, i) => {
          const pal = STATUS_PALETTE[app.status] ?? STATUS_PALETTE['Refusé'];
          const accepted = app.status === 'Accepté';
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: accepted ? 1 : 0.55 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: accepted ? 'rgba(94,199,138,0.06)' : DS.surface,
                border: `1px solid ${accepted ? DS.accentGreen + '30' : DS.border}`,
                borderRadius: 12, padding: '15px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{app.emoji}</span>
                <div>
                  <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: DS.text, margin: 0 }}>{app.company}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: DS.textMuted, margin: '2px 0 0 0' }}>{app.position}</p>
                </div>
              </div>
              <StatusBadge pal={pal}>{app.status}</StatusBadge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vue d'ensemble (Boussole) ────────────────────────────────────────────────
function OverviewView({ apps }) {
  const total = apps.length;
  const entretiens = apps.filter(a => a.status === 'Entretien').length;
  const reponses = apps.filter(a => ['Entretien', 'Accepté', 'Refusé'].includes(a.status)).length;
  const tauxRep = Math.round((reponses / total) * 100);
  const avgInterest = Math.round(apps.reduce((s, a) => s + a.interest, 0) / total);
  const topApp = [...apps].sort((a, b) => b.interest - a.interest)[0];

  const stats = [
    { value: total, label: 'Candidatures envoyées', color: DS.accent },
    { value: entretiens, label: 'Entretiens actifs', color: '#818CF8' },
    { value: `${tauxRep}%`, label: 'Taux de réponse', color: '#38BDF8' },
    { value: `${avgInterest}/100`, label: 'Intérêt moyen', color: DS.accentWarm },
  ];

  return (
    <div style={{ padding: '80px 48px 120px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: DS.text, margin: 0 }}>
          Vue d'ensemble
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: DS.textMuted, margin: '6px 0 0 0' }}>
          Semaine du 22 au 28 septembre 2026
        </p>
      </div>

      {/* Métriques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            style={{
              background: DS.surface,
              border: `1px solid ${DS.border}`,
              borderRadius: 14, padding: '20px 22px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: s.color + '80',
            }} />
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, fontWeight: 400, color: s.color, margin: 0, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: DS.textMuted, margin: '8px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Candidature prioritaire */}
      {topApp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            background: DS.surface,
            border: `1px solid ${DS.border}`,
            borderRadius: 14, padding: '18px 22px',
          }}
        >
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 600, color: DS.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
            Priorité no 1
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{topApp.emoji}</span>
              <div>
                <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 19, color: DS.text, margin: 0 }}>{topApp.company}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: DS.textMuted, margin: '3px 0 0 0' }}>{topApp.nextAction}</p>
              </div>
            </div>
            <StatusBadge pal={STATUS_PALETTE[topApp.status] ?? STATUS_PALETTE['En attente']}>{topApp.status}</StatusBadge>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Formulaire — tiroir depuis le bouton + ───────────────────────────────────
const STATUS_OPTIONS = ['En attente', 'Entretien', 'Relancé', 'Accepté', 'Refusé'];

function AddForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    company: '', position: '', status: 'En attente',
    date: new Date().toISOString().slice(0, 10),
    interest: 70, location: '', notes: '',
  });

  const inp = {
    width: '100%', background: DS.surfaceLight,
    border: `1px solid ${DS.border}`,
    borderRadius: 8, padding: '9px 11px',
    color: DS.text, fontFamily: "'Inter', sans-serif",
    fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
  };
  const lbl = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10.5, fontWeight: 500,
    color: DS.textMuted, display: 'block',
    marginBottom: 5, letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const onFocus = e => { e.target.style.borderColor = DS.accent + '80'; };
  const onBlur = e => { e.target.style.borderColor = DS.border; };

  const submit = e => {
    e.preventDefault();
    if (!form.company) return;
    onAdd?.({
      ...form,
      id: `custom-${Date.now()}`,
      emoji: '📎',
      contract: 'Stage 6 mois',
      companySize: 10,
      urgency: 0.3,
      contact: 'À renseigner',
      contactEmail: '',
      nextAction: 'En attente de retour',
      timeline: [{ date: 'Aujourd\'hui', title: 'Candidature ajoutée', desc: 'Saisie manuelle' }],
    });
    onClose();
  };

  return (
    <motion.div
      style={{
        position: 'fixed', bottom: 90, right: 24,
        width: 330,
        background: DS.surface,
        border: `1px solid ${DS.border}`,
        borderRadius: 18,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        zIndex: 200, overflow: 'hidden',
      }}
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
    >
      {/* Header du formulaire */}
      <div style={{
        padding: '16px 20px 14px',
        borderBottom: `1px solid ${DS.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, fontWeight: 400, color: DS.text, margin: 0 }}>
          Nouvelle candidature
        </h2>
        <button onClick={onClose} style={{
          width: 24, height: 24, borderRadius: '50%',
          background: DS.surfaceLight, border: `1px solid ${DS.border}`,
          color: DS.textMuted, cursor: 'pointer', fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      <form onSubmit={submit} style={{ padding: '16px 20px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={lbl}>Entreprise</label>
            <input style={inp} placeholder="ex. Stripe, Mistral AI…" value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              onFocus={onFocus} onBlur={onBlur} required />
          </div>
          <div>
            <label style={lbl}>Poste</label>
            <input style={inp} placeholder="ex. Frontend Engineer Intern" value={form.position}
              onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
              onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Statut</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: DS.surface }}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Date d'envoi</label>
              <input type="date" style={{ ...inp, colorScheme: 'dark' }} value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label style={{ ...lbl, display: 'flex', justifyContent: 'space-between' }}>
              <span>Intérêt</span><span style={{ color: DS.accent }}>{form.interest}/100</span>
            </label>
            <input type="range" min="0" max="100" value={form.interest}
              onChange={e => setForm(f => ({ ...f, interest: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: DS.accent, cursor: 'pointer' }} />
          </div>
          <div>
            <label style={lbl}>Localisation</label>
            <input style={inp} placeholder="Paris · Remote…" value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              onFocus={onFocus} onBlur={onBlur} />
          </div>
          <button type="submit" style={{
            width: '100%', padding: '10px',
            background: DS.accent, border: 'none', borderRadius: 10,
            color: '#fff', fontFamily: "'Inter', sans-serif",
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            letterSpacing: '0.03em', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Ajouter la candidature
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function Observatoire() {
  const [activeSection, setActiveSection] = useState('candidatures');
  const [selectedApp, setSelectedApp] = useState(null);
  const [apps, setApps] = useState(enrichedApplications);
  const [showForm, setShowForm] = useState(false);
  const [canvasSize, setCanvasSize] = useState(() => ({
    w: window.innerWidth, h: window.innerHeight,
  }));

  useEffect(() => {
    const update = () => setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleAddApp = useCallback((newApp) => {
    const statusColors = {
      'Entretien':  { core: '#818CF8', glow: 'rgba(129,140,248,0.5)' },
      'Relancé':    { core: '#38BDF8', glow: 'rgba(56,189,248,0.4)'  },
      'En attente': { core: '#D4A96B', glow: 'rgba(212,169,107,0.4)' },
      'Accepté':    { core: '#5EC78A', glow: 'rgba(94,199,138,0.5)'  },
      'Refusé':     { core: '#64748B', glow: 'rgba(100,116,139,0.3)' },
    };
    setApps(prev => [{
      ...newApp,
      days: 0,
      xNorm: 0.08,
      yNorm: 0.12 + ((100 - newApp.interest) / 100) * 0.76,
      color: statusColors[newApp.status] ?? statusColors['En attente'],
    }, ...prev]);
  }, []);

  const { w: W, h: H } = canvasSize;

  return (
    <div
      id="observatoire-root"
      style={{
        width: '100vw', height: '100vh',
        background: DS.bg,
        position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
      onClick={() => setSelectedApp(null)}
    >
      {/* ── En-tête flottant ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 56, zIndex: 20, pointerEvents: 'none',
        display: 'flex', alignItems: 'center',
        padding: '0 28px',
        borderBottom: `1px solid ${DS.border}`,
        background: DS.bg + 'E0',
        backdropFilter: 'blur(12px)',
      }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 17, fontWeight: 400,
          color: 'rgba(240,237,232,0.75)', margin: 0,
          letterSpacing: '0.02em',
        }}>StageTracker</h1>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 10, color: DS.textDim,
          marginLeft: 12, paddingLeft: 12,
          borderLeft: `1px solid ${DS.border}`,
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>Lucas Martin · M2 Informatique</span>
      </div>

      {/* ── Stats top-right ── */}
      <div style={{ position: 'absolute', top: 68, right: 28, zIndex: 10, pointerEvents: 'none' }}>
        <StatBar apps={apps} />
      </div>

      {/* ── Sections ── */}
      <AnimatePresence mode="wait">
        {activeSection === 'candidatures' && (
          <motion.div
            key="canvas"
            style={{ position: 'absolute', inset: 0, zIndex: 3 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={e => e.target === e.currentTarget && setSelectedApp(null)}
          >
            <CandidatureCanvas
              apps={apps}
              canvasW={W} canvasH={H}
              selectedApp={selectedApp}
              onSelect={setSelectedApp}
            />
            <StatusLegend />
            <AnimatePresence>
              {selectedApp && (
                <DetailPanel
                  key={selectedApp.id}
                  app={selectedApp}
                  canvasW={W} canvasH={H}
                  onClose={() => setSelectedApp(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeSection === 'entretiens' && (
          <motion.div key="entretiens" style={{ position: 'absolute', inset: 0, zIndex: 3, overflowY: 'auto', paddingTop: 56 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <EntretiensView />
          </motion.div>
        )}

        {activeSection === 'relances' && (
          <motion.div key="relances" style={{ position: 'absolute', inset: 0, zIndex: 3, overflowY: 'auto', paddingTop: 56 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <RelancesView apps={apps} />
          </motion.div>
        )}

        {activeSection === 'archive' && (
          <motion.div key="archive" style={{ position: 'absolute', inset: 0, zIndex: 3, overflowY: 'auto', paddingTop: 56 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <ArchiveView apps={apps} />
          </motion.div>
        )}

        {activeSection === 'boussole' && (
          <motion.div key="boussole" style={{ position: 'absolute', inset: 0, zIndex: 3, overflowY: 'auto', paddingTop: 56 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            <OverviewView apps={apps} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ── */}
      <ConstellationNav active={activeSection} onChange={s => { setSelectedApp(null); setActiveSection(s); }} />

      {/* ── Bouton + et formulaire ── */}
      <AnimatePresence>
        {showForm && (
          <AddForm onAdd={handleAddApp} onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      <motion.button
        onClick={e => { e.stopPropagation(); setShowForm(o => !o); }}
        aria-label={showForm ? 'Fermer' : 'Ajouter une candidature'}
        style={{
          position: 'fixed', bottom: 28, right: 24,
          width: 48, height: 48, borderRadius: '50%',
          border: 'none',
          background: showForm ? DS.surfaceLight : DS.accent,
          color: '#fff', fontSize: 22, fontWeight: 300,
          cursor: 'pointer', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: showForm ? 'none' : '0 4px 24px rgba(108,142,255,0.45)',
          border: showForm ? `1px solid ${DS.border}` : 'none',
        }}
        animate={{ rotate: showForm ? 45 : 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        transition={{ duration: 0.2 }}
      >
        <span style={{ lineHeight: 1, marginTop: showForm ? 0 : -1 }}>+</span>
      </motion.button>
    </div>
  );
}
