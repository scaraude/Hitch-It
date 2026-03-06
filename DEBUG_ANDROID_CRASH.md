# Debugging Android Crash au Démarrage

## 🔍 Le problème

L'app crash immédiatement après l'ouverture sur Android (Google Play Beta).
En dev local, l'app fonctionne sans problème.

## ✅ Configuration vérifiée

- [x] Point d'entrée correct : `index.js` avec `registerRootComponent`
- [x] Variables d'environnement configurées dans `eas.json`
- [x] Permissions Android correctement déclarées
- [x] Structure du code valide (pas d'erreurs TypeScript)

## 🎯 Causes probables

### 1. Nouveau Keystore généré (TRÈS PROBABLE)

EAS a généré un nouveau keystore lors du build :
```
✔ Generate a new Android Keystore? … yes
```

**Problème** : Si vous aviez déjà uploadé une version avec un autre keystore, la signature est différente.

**Solution** : Utiliser le même keystore pour tous les builds.

#### Comment récupérer et utiliser le keystore généré par EAS

```bash
# Télécharger les credentials EAS
eas credentials

# Dans le menu :
# - Select platform: Android
# - What do you want to do?: Set up credentials for build
# - Would you like to download the keystore?: Yes

# Le keystore sera téléchargé localement
# Vous pourrez le réutiliser pour tous les futurs builds
```

### 2. Dépendance manquante ou incompatible

Certaines bibliothèques natives peuvent ne pas être correctement liées en production.

**Coupables potentiels** :
- `react-native-gesture-handler` (doit être importé en premier dans `index.js` ✅)
- `react-native-reanimated`
- `react-native-maps`
- `@gorhom/bottom-sheet`

### 3. Variable d'environnement manquante

Le `app.config.js` lit des variables d'environnement. Si elles ne sont pas disponibles au build, l'app peut crash.

**Vérification** : Les variables sont bien définies dans `eas.json` ✅

### 4. Hermes Bytecode incompatible

Expo utilise Hermes par défaut. Parfois, il y a des incompatibilités.

## 🛠️ Solutions de debug

### Solution 1 : Build de développement (RECOMMANDÉ)

Créer un build APK installable avec logs de debug complets :

```bash
# 1. Créer un build development
eas build --platform android --profile development

# 2. Une fois le build terminé, télécharger l'APK
# 3. Installer l'APK sur votre téléphone
adb install -r path/to/downloaded.apk

# 4. Lancer l'app et voir les vraies erreurs dans les logs
adb logcat -c
adb logcat | grep -E "(AndroidRuntime|FATAL|ERROR|hitch|com.hitchit)"
```

### Solution 2 : Logs Google Play Console

1. Aller dans [Google Play Console](https://play.google.com/console)
2. Sélectionner votre app "Hitch It"
3. Menu : Quality → Crashes and ANRs
4. Attendre 2-24h que les crash reports arrivent
5. Analyser la stack trace

### Solution 3 : Build local avec logs

```bash
# Build localement avec expo
npx expo run:android --variant release

# Cela créera un APK release avec les logs visibles
# L'erreur sera visible directement dans le terminal
```

## 🔧 Fixes potentiels à tester

### Fix 1 : Désactiver Hermes temporairement

Ajouter dans `app.json` :

```json
{
  "expo": {
    "android": {
      "jsEngine": "jsc"
    }
  }
}
```

Puis rebuild avec EAS.

### Fix 2 : Ajouter babel-plugin-react-native-reanimated

Si `react-native-reanimated` est la cause, vérifier que le plugin Babel est configuré.

Vérifier dans `babel.config.js` ou créer s'il n'existe pas :

```js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### Fix 3 : Nettoyer et rebuild

```bash
# Nettoyer tous les caches
pnpm clear-caches

# Supprimer node_modules et reinstaller
rm -rf node_modules
pnpm install

# Rebuild avec EAS
eas build --platform android --profile production --clear-cache
```

## 📋 Checklist de debug

- [ ] Créer un build development avec `eas build --platform android --profile development`
- [ ] Installer l'APK development et récupérer les logs via `adb logcat`
- [ ] Vérifier les crash reports dans Google Play Console (attendre 2-24h)
- [ ] Essayer de désactiver Hermes
- [ ] Vérifier que babel-plugin-react-native-reanimated est configuré
- [ ] Rebuild avec `--clear-cache`

## 🎯 Prochaine étape recommandée

**Créer un build development immédiatement pour voir les vraies erreurs** :

```bash
eas build --platform android --profile development
```

Une fois l'APK téléchargé et installé, les logs vous diront exactement ce qui ne va pas.
