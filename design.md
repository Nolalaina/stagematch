# design.md — Système verrouillé StageMatch

Ce fichier verrouille le système de design. Il override tout ce qui précède et est partagé par toutes les pages. Toute modification doit passer par une mise à jour de ce fichier.

## 1. Identification

- **Projet** : StageMatch — plateforme de matching stage étudiants ↔ recruteurs
- **Thème** : Dusk (deal 1/3, seed `stagematch-plateforme-matching-stage-fbeb·f75eaa97·2026-11-09·r0`)
- **Genre** : modern-minimal
- **Job principal** : sign up (créer un profil)
- **Signature** : interface de matching affichée dans le slot du hero
- **Version** : v2.0.0 — Hallmark

## 2. Tokens (source unique : `frontend/src/tokens.css`)

Aucune couleur, police, espacement, rayon ou ombre ne peut être écrit en dur hors de ce bloc.

### Couleurs (oklch)
- `--color-paper` : fond principal (dark)
- `--color-paper-2` / `--color-paper-3` : surfaces de carte et slots
- `--color-ink` : texte principal
- `--color-muted` : texte secondaire
- `--color-rule` : bordures hairline
- `--color-accent` : signal unique (periwinkle / émeraude)
- `--color-accent-ink` : texte sur accent
- `--color-accent-hi` / `--color-accent-deep` : états hover / active
- `--color-accent-soft` : surface hover légère
- `--color-success` / `--color-error` : états sémantiques
- `--color-focus` : anneau de focus visible

### Espace
`--space-3xs` (2px) à `--space-4xl` (144px). Gutter : `--gutter` (64px desktop, 24px < 60rem, 16px < 40rem).

### Typographie (2 familles max)
- `--font-display` : "Wix Madefor Display" — titres uniquement
- `--font-body` : "Wix Madefor Text" — corps, labels, boutons, nav

### Autres
- `--radius-card` (18px), `--radius-inner` (10px), `--radius-pill` (999px)
- `--rule-hair` (1px)
- `--ease-out` / `--ease-in` / `--ease-in-out` ; `--dur-micro` / `--dur-short` / `--dur-long`

## 3. Règles du Floor (appliquées, non négociables)

1. Toute couleur et toute police passent par un token déclaré à `:root`. Aucune valeur littérale hors du bloc token.
2. Jamais `transition: all`. Jamais d'animation sur `width`, `height`, `top`, `left`.
3. Jamais un mot en italique à l'intérieur d'un titre romain.
4. `overflow-x: clip` sur `html` et `body`. Jamais `hidden`, jamais `100vw`.
5. Tracks d'image en grille : `minmax(0, 1fr)`. Têtes d'affichage : `overflow-wrap: break-word; min-width: 0`.
6. Chaque élément interactif a un `:focus-visible` immédiat.
7. Toute animation a un fallback `prefers-reduced-motion: reduce`. Contenu visible sans脚本.
8. Aucune métrique, témoignage, logo wall ou compte de cas d'étude inventé.
9. Aucun sourcil. Aucun label en tracked capitals ou small caps. Labels, légendes, têtes de table, tags et liens de nav : corps (ou face label du thème), plus petit, casse de phrase ou minuscule, non tracké.
10. Aucune chaîne meta jointe par point médian, aucune flèche collée au texte de lien, aucun point de statut décoratif.
11. Aucun dégradé violet-bleu, aucune carte dans une carte, aucun emoji comme icône, aucune fenêtre de navigateur ou d'OS dessinée à la main.
12. Le titre du hero, une phrase et l'action primaire sont visibles à 1280 × 800 sans défiler.
13. Environ 80 mots maximum par écran ; le hero = titre, une phrase et ses actions.
14. Conteneur capé et centré ; à 1920 les gutters croissent, la mesure et les grilles ne croissent pas.
15. Première ligne non vide du CSS source = stamp Hallmark, puis ligne de critique, puis waivers. Tout dans les 40 premières lignes.
16. `sloplint --render` doit être clean (0 FAIL, 0 REFLEX, 0 WARN) avant remise.

## 4. Composants verrouillés

### Boutons (`.btn`)
Un seul style primaire (`--color-accent`), un outline, un ghost. États : repos, hover, active, focus-visible, disabled. Pas de `transition: all`.

### Cartes (`.card`)
Fond `--color-paper-2`, bordure hairline `--color-rule`, radius `--radius-card`, texte `--color-ink`. Pas de carte imbriquée dans une carte.

### Champs (`.field`)
Label non tracké, casse de phrase, taille plus petite. Input/select/textarea héritent de la police du système. Focus visible via `base.css`.

### Tags (`.tag`)
Pill, border hairline, texte non tracké, casse minuscule ou phrase.

### Navigation
Topbar sticky, wordmark à gauche, liens de nav à droite. Un seul lien actif (`aria-current="page"`).

### Footer
Mast + wordmark, liens en colonne, mesure des paragraphes entre 45 et 75ch, fine print en bas.

## 5. Mise en page

- `.container` : `max-width: var(--container)`, centré, `padding-inline: var(--gutter)`.
- Grilles : `repeat(auto-fit, minmax(0, 1fr))` ou colonnes fixes avec `minmax(0, 1fr)` sur les tracks images.
- Sections : padding vertical `--section-gap` (et variantes s / l).
- Hero : posture "Stage", titre à gauche sur colonnes 1–5, slot image sur 6–12 (ou plein largeur sur mobile).
- Un idee par écran. Maximum 6–9 sections (hero + footer compris).
- Maximum ~450 mots visibles par page.

## 6. Images et slots

- Les images portent `data-slot` et sont injectées par le slot script Hallmark.
- Pas d'URL de banque d'images, aucune illustration dessinée, aucun lavis vide.
- Chaque photo de bibliothèque est créditée dans le footer.
- Les tracks de grille portant des images utilisent `minmax(0, 1fr)`.

## 7. Mouvement

- Seules `transform` et `opacity` sont animées.
- `prefers-reduced-motion: reduce` réduit toutes les durées à 0.01ms et annule le scroll smooth.
- Une seule révélation (reveal) maximum par page, nulle part où le thème impose l'immobilité.

## 8. Interdites (verrouillées)

Dégradés purple-to-blue, cartes dans cartes, emojis comme icônes, fenêtres de navigateur dessinées, sourcil, labels en tracked capitals, points médians dans les métas, flèches collées aux liens, points de statut décoratifs, `overflow-x: hidden`, `100vw`, `transition: all`.

## 9. Stamp

Toute feuille de style de page commence par :

```
/* Hallmark · shape: <shape> · genre: modern-minimal · theme: Dusk · job: sign up · draw: <seed>
 * hero: <posture> · nav: <shape> · footer: <shape> · imagery: <photographs | product | none> · signature: <the one move> · axes: dark/grotesk-sans/cool · posture: committed · contrast: pass · fold: pass · v2.0.0 */
/* Hallmark · pre-emit critique: P_ H_ E_ S_ R_ V_ · weakest: _ · <what you did about it> */
@import url("./tokens.css");
@import url("./base.css");
```

## 10. Waivers

Aucun waiver actif actuellement.
