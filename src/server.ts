import Fastify from 'fastify';
import { healthRoutes } from './routes/health';
import { config } from './config/config';

const app = Fastify({
  logger: {
    level: config.logLevel
  }
});

app.register(healthRoutes);

const start = async () => {
  try {
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
