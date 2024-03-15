const config = `module.exports = {
  // General Settings
  roots: ['<rootDir>'], // Tests are typically in a 'src' folder
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    
  },

  // Environment
  testEnvironment: 'node', // Use Node.js environment
};
`;

export default config;
