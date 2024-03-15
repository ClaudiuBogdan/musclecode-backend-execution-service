const config = `module.exports = {
  // General Settings
  roots: ['<rootDir>'], // Tests are typically in a 'src' folder
  preset: 'ts-jest',
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Use ts-jest for TypeScript
  },

  // Environment
  testEnvironment: 'node', // Use Node.js environment
};
`;

export default config;
