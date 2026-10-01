module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(firebase|@firebase|react-native|@react-native|expo|@expo|expo-router)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.js'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/functions/'
  ],
  globals: {
    '__DEV__': true
  }
};
