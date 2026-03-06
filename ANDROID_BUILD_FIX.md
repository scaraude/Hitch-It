# Fix: Android App Crash au Démarrage

## 🔴 Problème
L'application se ferme immédiatement après l'ouverture sur Android (Google Play Beta).

## 🔍 Cause
`react-native-maps` nécessite une clé Google Maps API pour fonctionner sur Android. Sans cette clé, l'app crash au démarrage.

## ✅ Solution

### Étape 1 : Obtenir une clé Google Maps API

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un projet existant
3. Activer l'API "Maps SDK for Android" :
   - Menu hamburger → APIs & Services → Library
   - Rechercher "Maps SDK for Android"
   - Cliquer sur "Enable"
4. Créer une clé API :
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Copier la clé générée
5. **Sécuriser la clé (IMPORTANT)** :
   - Cliquer sur la clé créée
   - Application restrictions → Android apps
   - Add an item :
     - Package name: `com.hitchit.app`
     - SHA-1 certificate fingerprint: obtenir via `eas credentials` ou depuis Google Play Console
   - API restrictions → Restrict key
   - Sélectionner "Maps SDK for Android"
   - Save

### Étape 2 : Configurer la clé dans le projet

#### Option A : Via fichier .env (développement local)
```bash
# .env
GOOGLE_MAPS_API_KEY=AIza...votre_clé_ici
```

#### Option B : Via eas.json (production - RECOMMANDÉ)
Éditer `eas.json` et remplacer `YOUR_GOOGLE_MAPS_API_KEY_HERE` par votre vraie clé :

```json
{
  "build": {
    "production": {
      "env": {
        "GOOGLE_MAPS_API_KEY": "AIza...votre_clé_ici"
      }
    }
  }
}
```

### Étape 3 : Rebuild et déployer

```bash
# Nettoyer les caches
pnpm clear-caches

# Build production
eas build --platform android --profile production

# Une fois le build terminé, uploader vers Google Play
```

### Étape 4 : Vérifier les logs après installation

Si le problème persiste, récupérer les logs Android :

```bash
# Via ADB (téléphone connecté en USB avec débogage USB activé)
adb logcat | grep -E "(hitch|AndroidRuntime|FATAL)"

# Ou attendre les crash reports dans Google Play Console (quelques heures)
```

## 📋 Changements effectués

1. ✅ Variables d'environnement configurées dans `eas.json`
2. ✅ Secrets Supabase retirés de `app.json`
3. ✅ `app.config.js` configuré pour lire `GOOGLE_MAPS_API_KEY`
4. ✅ `.env.example` mis à jour

## 🚨 Autres causes possibles (si Google Maps ne résout pas)

### 1. Vérifier expo-maps vs react-native-maps
L'app utilise `react-native-maps`. Si `expo-maps` est aussi dans `package.json`, il peut y avoir conflit.

### 2. Vérifier les permissions Android
Les permissions sont correctement configurées dans `app.json` :
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION`

### 3. Vérifier la signature du keystore
EAS a généré un nouveau keystore pendant le build. Si vous aviez déjà uploadé une version signée avec un autre keystore, il faut :
- Utiliser le même keystore pour tous les builds
- Ou créer une nouvelle version de l'app avec un nouveau package name

### 4. Build en mode développement (debugging)
Pour tester sans passer par Google Play :

```bash
# Build en mode development
eas build --platform android --profile development

# Installer l'APK manuellement sur le téléphone
```

## 📞 Support

Si le problème persiste après avoir ajouté la clé Google Maps :
1. Récupérer les logs complets via `adb logcat`
2. Vérifier les crash reports dans Google Play Console
3. Tester avec un build `development` pour voir les vraies erreurs
