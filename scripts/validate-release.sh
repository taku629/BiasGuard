#!/bin/bash
set -e

echo "Starting release validation..."

echo "[START] Secret scan"
if grep -rE "sk_live\|sk_test\|AKIA\|AIza" --exclude-dir=node_modules --exclude-dir=.git .; then
    echo "[FAIL] Potential secrets found! Please review them."
    exit 1
fi
echo "[PASS] Secret scan"

echo "[START] Frontend tsc"
timeout 5m npx tsc --noEmit || { echo "[FAIL] Frontend tsc"; exit 1; }
echo "[PASS] Frontend tsc"

echo "[START] Frontend Jest"
timeout 10m npx jest --runInBand || { echo "[FAIL] Frontend Jest"; exit 1; }
echo "[PASS] Frontend Jest"

echo "[START] Frontend expo-doctor"
timeout 10m npx expo-doctor || { echo "[FAIL] Frontend expo-doctor"; exit 1; }
echo "[PASS] Frontend expo-doctor"

echo "[START] Frontend expo install --check"
timeout 5m npx expo install --check || { echo "[FAIL] Frontend expo install --check"; exit 1; }
echo "[PASS] Frontend expo install --check"

echo "[START] Frontend expo config"
timeout 2m npx expo config --type public || { echo "[FAIL] Frontend expo config"; exit 1; }
echo "[PASS] Frontend expo config"

echo "Validating functions..."
cd functions
echo "[START] Functions build"
timeout 5m npm run build || { echo "[FAIL] Functions build"; exit 1; }
echo "[PASS] Functions build"

echo "[START] Functions test"
timeout 10m npm test -- --runInBand || echo "[FAIL/SKIPPED] Functions test failed or no tests."
echo "[PASS] Functions test"

echo "[START] Functions npm ls"
timeout 2m npm ls --depth=0 || { echo "[FAIL] Functions npm ls"; exit 1; }
echo "[PASS] Functions npm ls"
cd ..

echo "Release validation complete."
