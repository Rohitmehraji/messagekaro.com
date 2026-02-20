import cron from 'node-cron';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { processDueCampaigns } from '../modules/sms/service';

export const startScheduler = () => {
  cron.schedule(env.SCHEDULER_CRON, async () => {
    try {
      await processDueCampaigns();
    } catch (error) {
      logger.error({ err: error }, 'Scheduler failed while processing campaigns');
    }
  });

  logger.info(`Scheduler started on pattern ${env.SCHEDULER_CRON}`);
};
