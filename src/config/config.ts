import dotenv from 'dotenv';

const originalLog = console.log; // Turning off dotenv logs
console.log = () => {};
dotenv.config();
console.log = originalLog;

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    throw new Error(`Missing or empty required environment variable: ${name}`)
  }
  return value
}

export interface Config {
  port: number
  host: string
  nodeEnv: string
  logLevel: string
  pollingIntervalMs: number
  github: {
    repo: string
    token: string
  }
  youtrack: {
    baseUrl: string
    token: string
    projectId: string
  }
  isDevelopment: () => boolean
  isProduction: () => boolean
  isTest: () => boolean
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '10000', 10),

  github: {
    repo: requireEnv('GITHUB_REPO'),
    token: requireEnv('GITHUB_TOKEN'),
  },

  youtrack: {
    baseUrl: requireEnv('YOUTRACK_BASE_URL'),
    token: requireEnv('YOUTRACK_TOKEN'),
    projectId: requireEnv('YOUTRACK_PROJECT_ID'),
  },

  isDevelopment: () => config.nodeEnv === 'development',
  isProduction: () => config.nodeEnv === 'production',
  isTest: () => config.nodeEnv === 'test',
};