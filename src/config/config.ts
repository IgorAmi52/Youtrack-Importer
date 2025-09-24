import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Polling Configuration
  pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '10000', 10),

  // GitHub Configuration
  github: {
    repo: process.env.GITHUB_REPO || '',
    token: process.env.GITHUB_TOKEN || '',
  },

  // YouTrack Configuration
  youtrack: {
    baseUrl: process.env.YOUTRACK_BASE_URL || '',
    token: process.env.YOUTRACK_TOKEN || '',
    projectId: process.env.YOUTRACK_PROJECT_ID || '',
  },

  isDevelopment: () => config.nodeEnv === 'development',
  isProduction: () => config.nodeEnv === 'production',
  isTest: () => config.nodeEnv === 'test',
};