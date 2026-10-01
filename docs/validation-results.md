# Validation Results

## BiasGuard Frontend

Command executed:
`npx tsc --noEmit && npx jest --runInBand && npx expo-doctor && npx expo install --check && npx expo config --type public`

- **tsc --noEmit**: Exit Code `0` (Success)
- **jest --runInBand**: Exit Code `0` (Success) - *Required adding react-native mock to jest.config.js*
- **expo-doctor**: Exit Code `0` (Success)
- **expo install --check**: Exit Code `0` (Success)
- **expo config --type public**: Exit Code `0` (Success)

**Status:** PASS

---

## BiasGuard Functions

Command executed:
`npm run build && npm test -- --runInBand && npm ls --depth=0`

- **npm run build (tsc)**: Exit Code `0` (Success)
- **npm test -- --runInBand (jest)**: Exit Code `0` (Success)
- **npm ls --depth=0**: Exit Code `0` (Success)

**Status:** PASS
