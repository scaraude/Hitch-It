# Hitch-It — Brand Book v1

> Référence d'identité visuelle. Livrable du ticket **TCK-84** (Brand book discovery). Sert de critère d'acceptation pour **TCK-85** (Branding pass — application aux tokens & UI).
>
> Aperçu visuel interactif : `docs/brand-sheet.html` (à ouvrir dans un navigateur).

## 1. Essence de marque

- **Produit :** app d'auto-stop, mobile (React Native + Expo).
- **Audience :** 20–35 ans, aventurières et aventuriers. Deux profils : l'auto-stoppeur·se débutant·e, et l'habitué·e sur longs trajets / territoires inconnus. Dimension communautaire : spots, blogs, partages.
- **3 adjectifs :** Aventure · Simplicité · Action.
- **Direction retenue :** « Sunbeam & Petrol » — jaune (action) + bleu-pétrole (structure/secondaire) + neutres chauds.

### Ton de voix

Familier, joueur, fun.

| Do | Don't |
| --- | --- |
| Tutoyer, parler comme un copain de route | Jargon, ton corporate ou administratif |
| Phrases courtes, orientées action | Paragraphes lourds |
| Une pointe d'humour, de la vie | En faire trop / forcer le « fun » à chaque écran |

## 2. Couleurs

Mode **clair** uniquement (v1). Neutres **chauds et doux** pour l'ambiance ; **texte en encre foncée** pour garantir l'accessibilité **AAA**.

| Token | Hex | Rôle |
| --- | --- | --- |
| `sunbeam` | `#FFB703` | Primaire · couleur d'action · CTA · « Hitch it » |
| `sunbeam-tint` | `#FFCB47` | Survol, fonds doux |
| `sunbeam-deep` | `#E09600` | État pressé |
| `ink` | `#1B2A41` | Texte principal · structure |
| `ink-soft` | `#5A6472` | Texte secondaire |
| `petrol` | `#0F6E72` | Secondaire · liens · accents froids |
| `petrol-tint` | `#E2F0F0` | Fonds d'info doux |
| `coral` | `#FB5343` | **Accent expressif** (hero, illustrations, empty states, badges) |
| `background` | `#FFFDF9` | Fond d'écran (blanc chaud) |
| `surface` | `#F6F3EC` | Cartes, chips (papier chaud) |
| `border` | `#E9E5DC` | Bordures, séparateurs |
| `success` | `#2E9E5B` | Bon spot, validé |
| `warning` | `#E8810C` | Alerte (orange distinct du jaune primaire) |
| `error` | `#E5484D` | Erreurs, danger |
| `info` | `#2D7DD2` | Infos neutres |

### Règles de couleur (importantes)

- **Jaune jamais en texte.** Un jaune vif sur blanc ≈ 1.4:1 (échec total). Le jaune sert de **fond d'action** avec contenu encre par-dessus (jaune + ink ≈ 11:1, AAA ✓) ou d'accent.
- **Texte sur jaune = `ink` ou `petrol`** uniquement (les deux passent AAA). Pas de corail ni de blanc nu en texte sur jaune.
- **Corail = remplissage**, jamais en texte sur jaune. Excellent en fond de pastille / badge / bloc, avec contenu blanc ou ink.
- **Blanc nu** réservé aux fonds **non-jaunes** (pétrole, ink), où il ressort. Sur jaune, le blanc nu ≈ 1.6:1 (illisible) — sauf s'il porte un contour foncé (cf. logo).
- Tout le **texte courant** est en `ink` / `ink-soft` sur fond clair → AAA.

> Le **jaune exact reste à caler** sur le hex du logo (le logo peut aussi s'aligner sur `#FFB703`). À confirmer.

## 3. Typographie

Deux polices rondes, gratuites (Google Fonts / `@expo-google-fonts`).

- **Fredoka** — titres et headings. Géométrique, ronde, joyeuse, moderne.
- **Nunito Sans** — corps et UI. Ronde mais très lisible jusqu'en petit.

### Échelle

| Rôle | Taille | Police / poids |
| --- | --- | --- |
| Display | 28 | Fredoka 600 |
| Title | 24 | Fredoka 600 |
| Heading | 20 | Fredoka 500 |
| Body | 16 | Nunito Sans 400 |
| Label | 14 | Nunito Sans 700 |
| Caption | 12 | Nunito Sans 600 |

### Règle wordmark

Le **logo et la police d'UI sont deux métiers différents.** Le wordmark « Hitch-It » s'écrit en **Fredoka 500** (poids léger). On **évite Fredoka 700 aux grandes tailles** (effet cartoon « Simpsons »). Les titres in-app restent en Fredoka 500–600.

## 4. Formes & arrondis

Arrondi **moyen et constant** — rond sans effet « bubble » daté. Pilule réservée aux CTA, tags et FAB.

| Token | Valeur | Usage |
| --- | --- | --- |
| `radius-xs` | 8 | Chips, inputs |
| `radius-sm` | 12 | Petits boutons |
| `radius-md` | 16 | **Cartes (défaut)** |
| `radius-lg` | 20 | Modales |
| `radius-xl` | 24 | Bottom sheet |
| `radius-pill` | 9999 | CTA ronds, tags, FAB |

## 5. Espacement & densité

- Échelle conservée : `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48`.
- **Contenu aéré** (formulaires, profil, sheets) — grandes zones tactiles, adapté à l'usage en extérieur / mouvement.
- **Chrome discret sur la carte** — la carte reste l'héroïne.

## 6. Iconographie

- Set **Ionicons** (via `@expo/vector-icons` — déjà installé).
- **Line (outline)** par défaut, **filled** pour l'état actif / sélectionné.
- Sur fond jaune (ex. CTA), icône en **`ink`** (raccord avec le texte, AAA). Icône blanche réservée aux fonds non-jaunes.

## 7. Composants & patterns

- **Bouton primaire :** fond `sunbeam`, texte `ink`, `radius-md`.
- **Bouton secondaire :** fond `petrol`, texte blanc.
- **Bouton ghost :** bordure `petrol`, texte `petrol`.
- **CTA « Hitch it » :** pilule `sunbeam`, texte `ink`, icône **Ionicons `thumbs-up` en `ink`** ; pulse subtil au repos, stoppé pendant l'enregistrement.
- **Carte de spot :** `surface` + `border`, `radius-md`, photo en haut, chips d'info (note, type de route, départs).
- **Bottom sheet « À proximité » :** `radius-xl` en haut, poignée 40×4, distances en `petrol`.
- **Légende marqueurs carte :** vert = très bon, jaune = correct, orange = moyen, rouge = mauvais.

### Pattern « les 3 mots » (et principe général)

La palette est figée (tokens) ; **la composition reste libre** selon le contexte. Deux patterns sanctionnés à piocher :

- **A — Typographie colorée** (recommandé pour le hero) : mots en `petrol` / `ink`, séparés par des étoiles. Joyeux, éditorial, pas « bouton ».
- **B — Pills blanches + icône colorée** : fond blanc, icône Ionicons colorée, texte `ink`. Léger, lisible.
- **C — Pills colorées pleines** : fond `petrol` / `coral` / `ink`, texte blanc. Vif et punchy.

> Principe : on associe tokens et patterns selon le besoin de chaque écran, pas une mise en page unique figée.

## 8. Mouvement

Micro-interactions utiles seulement — « un peu de vie, pas Disney Land ».

- Appui bouton : scale 0.96 + ressort.
- « Hitch it » : pulse doux au repos.
- Bottom sheet : snap ressort fluide.
- Marqueurs : apparition fondu / scale au chargement.
- Badge d'enregistrement : fondu subtil.
- Standard : 200–250 ms, ease-out, ressort (`react-native-reanimated`).

## 9. Photo & illustration

- **Photos** : sur les spots et dans les articles / blogs (peu ailleurs).
- **Illustrations** : légères, style line, pour empty states & onboarding (vibe aventure : routes, panneaux, van). Cohérentes avec le style d'icônes.

## 10. Implémentation (pour TCK-85)

- Tokens couleur / spacing : `src/constants/index.ts` (`COLORS`, `SPACING`).
- Radius / typo / tailles : `src/constants/sizes.ts` (`SIZES`).
- Composants partagés : `src/components/ui/*`.
- Polices : ajouter via `@expo-google-fonts/fredoka` et `@expo-google-fonts/nunito-sans`.
- Aucune couleur hex hardcodée dans le code feature/screens (cf. `CLAUDE.md` — Design System Rules).

## 11. À confirmer

- [ ] Hex exact du jaune (caler `sunbeam` sur le logo, ou aligner le logo sur `#FFB703`).
- [ ] Mode sombre : hors scope v1, à décider plus tard.
- [ ] Set d'illustrations (style line) : source / création.
