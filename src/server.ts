import Fastify from 'fastify';
import { healthRoutes } from './routes/health';
import { userMappingsRoutes } from './routes/userMappings';
import { config } from './config/config';
import { loadUserMappingsFromEnv } from './utils/userMappings';
import './db'
import { githubWorker } from './workers/githubPoller';

const app = Fastify({
  logger: config.isDevelopment() ? false : {
    level: config.logLevel
  }
});


app.register(healthRoutes);
app.register(userMappingsRoutes);

const start = async () => {
  try {
    loadUserMappingsFromEnv()

    if (config.github.repo) {
      githubWorker.start()
    } else {
      console.warn('⚠️ GITHUB_REPO not configured, polling worker disabled')
    }

    await app.listen({
      port: config.port,
      host: config.host
    });
    console.log(`Server is running on http://${config.host}:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
