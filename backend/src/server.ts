import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { ensureSchema } from './db/migrate';
import { startScheduler } from './scheduler/sms-scheduler';

ensureSchema();
startScheduler();

app.listen(env.PORT, () => {
  logger.info(`Backend running on http://localhost:${env.PORT}`);
});
