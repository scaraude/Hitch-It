# Backlog retour Ludo - Hitch-It

> Capture brute des demandes à découper ensuite en petites tâches/PR.
> Dernière mise à jour: 2026-03-09

## ✅ Done (Merged)

### Small tasks (S1-S6)
- [x] **S1+S2** - Direction i18n: Traduire champ direction + cardinals (PR #27 + #32)
- [x] **S3** - Rename historique → My trips (PR #28)
- [x] **S4** - Update my trips icon (PR #29)
- [x] **S5** - Disable destination button when field empty (PR #30)
- [x] **S6** - Real username as author (PR #31)

### Other merged
- [x] Hide favorite button (PR #24)
- [x] ORS key iOS runtime (PR #23)
- [x] Journey counters refresh (PR #26)

## ❌ Closed/Abandoned

- [ ] Bug iPhone/Android keyboard overlap (PR #25 - closed, approach didn't work)

---

## 📋 TODO - Auth / Spot ownership

- [ ] Un utilisateur doit pouvoir supprimer ses propres spots.
- [ ] Un utilisateur doit avoir une vue "mes spots".
  - Au clic sur un spot: retour map, focus sur le point sélectionné + ouverture de la spot detail sheet.

## 📋 TODO - Map / UX

- [ ] Au premier fetch de localisation après ouverture app, la map doit se centrer sur la position actuelle.
  - Réutiliser la logique du bouton location/LocateMe.
- [ ] Si l'utilisateur dézoome trop (spots cachés): afficher un petit bouton proposant d'afficher les spots.
  - Au clic: afficher une barre de chargement pendant le download des spots.
- [ ] Le bouton LocateMe doit redemander l'accord de localisation si non accordé.

## 📋 TODO - Spot form / keyboard UX

- [ ] **Bug iPhone** (global spot flows): le clavier se superpose aux composants dans les flows spot.
  - Cas 1: écran d'ajout de spot (la sheet ne remonte pas correctement au focus).
  - Cas 2: `SpotDetailsSheet` en ajout de commentaire (la zone de saisie/commentaires est masquée).
  - **Note:** PR #25 fermée - approche ne fonctionnait pas, à retravailler
- [ ] **Bug Android**: sur l'écran d'ajout de spot, la sheet remonte avec le clavier
      mais laisse un gap quand le clavier disparaît.

## 📋 TODO - Spot data quality / DB

- [ ] Supprimer les coordonnées dans la colonne `destinations` de la table `spot`.
- [ ] Supprimer la valeur "imported spot" dans la colonne `main_road` de la table `spot`.
- [ ] Les champs facultatifs/obligatoires doivent être plus clairs dans le formulaire d'ajout de spot.

## 📋 TODO - Journey model / recording

- [ ] Dans `journey_point`, supprimer le champ `type`.
- [ ] Renommer `journey_point` en `journey_stops` (ou équivalent), car la table ne devrait stocker que les arrêts.
- [ ] Les points de trajectoire ne doivent plus vivre dans `journey_point`; ils doivent être portés par `route_polyline` sur la table `journey`.
- [ ] Pendant la navigation, sauvegarder tout le trajet en cache (points + stops).
- [ ] En mode navigation active, afficher un indicateur minimaliste (badge) indiquant que l'enregistrement du trajet est en cours (ex: "Recording").
- [ ] À l'arrêt manuel du trajet, ne pas enregistrer automatiquement sans confirmation.
  - Proposer explicitement d'enregistrer ou non le trajet.
  - Option UX: réutiliser le même modal que celui utilisé à l'arrivée.
- [ ] En fin de trajet, convertir le cache en:
  - une row `journey` avec `route_polyline`
  - plusieurs rows `journey_stops/journey_points` pour les lieux où l'utilisateur reste > X minutes.
- [ ] Dans cette logique, le bouton "mark add stop" sur l'écran navigation doit disparaître.
- [ ] `journey_points` (ou table équivalente) doit être supprimée en cascade lors de la suppression d'un `journey`.

## 📋 TODO - Navigation / wording / icons

- [ ] Vérifier bug Laureen: bouton "Go" désactivé dans `NavigationSetupSheet` (conditions d'activation à valider et corriger).
- [ ] Dans `NavigationSetupSheet`, remplacer le texte "Use my current location" par "Ma position actuelle" (FR) + traduire les autres langues.
- [ ] Dans `NavigationSetupSheet`, remplacer les icônes Ionicons "location-outline" par des icônes de point d'origine/destination plus claires.

## 📋 TODO - Navigation modes

- [ ] Créer 3 modes de navigation distincts:
  1. **"I'm driving"** (conducteur) – guidage turn-by-turn classique
  2. **"I'm hitchhiking"** (autostoppeur) – navigation passive, enregistrement du trajet
  3. **"I'm picking up a hitchhiker"** (conducteur prend autostoppeur) – guidage + partage de trajet
- [ ] Mode hitchhiking: désactiver les instructions vocales turn-by-turn, focus sur le tracking uniquement.
- [ ] Pour chaque mode, adapter l'UI navigation (ex: boutons différents, messages adaptés).
