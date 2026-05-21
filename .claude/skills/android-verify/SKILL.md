---
name: android-verify
description: >-
  Run the Hitch-It app on the local Android emulator and capture screenshots to
  visually validate UI changes (especially branding/design PRs). Use whenever you
  need to SEE a change render on a real device — verifying a UI ticket, confirming
  a component/screen looks right, producing before/after screenshots for a PR, or
  answering "does this actually look correct on Android?". This environment already
  has the Android SDK + a working emulator; this skill documents the exact, proven
  commands so you don't rediscover them each time.
---

# Android verify — run the app on the emulator and screenshot it

This is a Bash + `adb` workflow. No MCP or extra install is needed — the SDK and an AVD already exist here. The point is to render real screens and deliver PNGs (this is a remote session; the user receives screenshots inline / as files).

## Environment facts (verified on this machine)

- SDK lives at `~/Android/Sdk` but is **not on `PATH`** by default. Export it first.
- `/dev/kvm` exists and the user is in the `kvm` group → hardware-accelerated emulation works.
- Pre-made AVD: **`android34`** (Android 14, `google_apis/x86_64`). App package: **`com.hitchit.app`**.
- `pnpm` is NOT on `PATH` — use `npx` (and `node_modules/.bin/*`) instead.
- This is a **managed** Expo project (no committed `android/`), so the first run must prebuild + Gradle-build a dev client.

## Always start with this env

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
```

## 1. Get a booted emulator

```bash
adb devices            # if a device is already listed and booted, REUSE it — skip booting
```

If none is running, boot headless (run in background):

```bash
emulator @android34 -no-window -gpu swiftshader_indirect -no-audio -no-boot-anim -no-snapshot
```

Then wait for boot: poll `adb shell getprop sys.boot_completed` until it returns `1`.

> Booting a second emulator with an AVD that's already running fails with "Running multiple emulators with the same AVD…". Reuse the running one, or add `-read-only`.

## 2. Build + install the app (first time only — ~10 min)

```bash
yes | sdkmanager --licenses >/dev/null 2>&1 || true
CI=1 npx expo run:android
```

- `CI=1` keeps it non-interactive. With a single attached device it auto-targets it — **do NOT pass `--device <serial>`** (that flag wants an AVD name, not the `emulator-5554` serial, and errors out).
- This runs `expo prebuild` (generates an untracked `android/` dir — **don't commit it**), Gradle-builds a debug APK, installs `com.hitchit.app`, and starts **Metro on `:8081`**.
- Confirm Metro: `curl -s http://localhost:8081/status` → `packager-status:running`.

**Subsequent runs:** JS/branding edits hot-reload — no rebuild. If Metro isn't running, start it (`npx expo start` in background) and relaunch the app. Only re-run `expo run:android` when native deps change.

## 3. Clean launch (skip the permission dialog)

```bash
pkg=com.hitchit.app
adb shell pm grant $pkg android.permission.ACCESS_FINE_LOCATION
adb shell pm grant $pkg android.permission.ACCESS_COARSE_LOCATION
adb shell am force-stop $pkg
adb shell am start -n $pkg/.MainActivity
```

Give the JS bundle a few seconds to render before the first screenshot.

## 4. Screenshot + interact

```bash
adb exec-out screencap -p > /tmp/shot.png   # then view it with the Read tool
adb shell input tap <x> <y>                  # device pixels (screen is 1080x2280)
adb shell input text 'hello'                 # type into a focused field
adb shell input keyevent KEYCODE_BACK        # back
```

**Tap-coordinate gotcha:** `screencap` PNGs are full device resolution (1080×2280), but the preview you view may be downscaled. Compute taps from the **device** size (`adb shell wm size`) using the on-screen *fraction*, not the preview's pixel numbers — getting the scale wrong makes taps land ~tens of px off.

**Dev LogBox toast:** "Open debugger to view warnings" sits over the bottom nav and can eat taps. Dismiss its ✕ or tap around it.

## 5. Deliver

Save the PNGs and show them to the user with the Read tool (renders inline). For a set, an HTML gallery referencing the PNGs matches this user's file-delivery preference.

## Notes

- Google Maps tiles render here (API key is configured), so map screens work — but maps are irrelevant to most branding checks; auth/journey/nav screens validate buttons, tokens, and type without a map.
- Be honest about what you saw vs. couldn't reach. A screen you didn't navigate to is not "verified."
