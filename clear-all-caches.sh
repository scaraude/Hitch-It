#!/bin/bash
echo "🧹 Clearing all React Native/Expo caches..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Clear Metro bundler cache
echo "  - Metro bundler cache"
rm -rf "$SCRIPT_DIR/node_modules/.cache"

# Clear Expo cache
echo "  - Expo cache"
rm -rf ~/.expo/cache

# Clear watchman (if installed)
if command -v watchman &> /dev/null; then
    echo "  - Watchman cache"
    watchman watch-del-all 2>/dev/null
fi

# Clear Android build cache
echo "  - Android build cache"
rm -rf "$SCRIPT_DIR/android/app/build" 2>/dev/null

# Clear Expo Go cache on device/emulator (if connected)
if command -v adb &> /dev/null && adb devices | grep -q "device$"; then
    echo "  - Expo Go app cache"
    adb shell pm clear host.exp.exponent 2>/dev/null
fi

# Clear temp files
echo "  - Temp files"
rm -rf /tmp/metro-* /tmp/react-* /tmp/haste-* 2>/dev/null

echo ""
echo "✅ All caches cleared!"
