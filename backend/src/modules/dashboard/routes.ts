import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { campaigns, devices, smsLogs } from '../../db/schema';

const router = Router();

router.get('/stats', async (_req, res) => {
  const [totals] = await db
    .select({
      totalSms: sql<number>`count(*)`,
      sent: sql<number>`sum(case when ${smsLogs.status} = 'sent' then 1 else 0 end)`,
      failed: sql<number>`sum(case when ${smsLogs.status} = 'failed' then 1 else 0 end)`,
      pending: sql<number>`sum(case when ${smsLogs.status} = 'pending' then 1 else 0 end)`
    })
    .from(smsLogs);

  const [scheduled] = await db
    .select({ scheduled: sql<number>`count(*)` })
    .from(campaigns)
    .where(eq(campaigns.status, 'scheduled'));

  const deviceWise = await db
    .select({
      deviceId: devices.id,
      name: devices.name,
      total: sql<number>`count(${smsLogs.id})`
    })
    .from(devices)
    .leftJoin(campaigns, eq(campaigns.deviceId, devices.id))
    .leftJoin(smsLogs, eq(smsLogs.campaignId, campaigns.id))
    .groupBy(devices.id);

  const campaignWise = await db
    .select({
      campaignId: campaigns.id,
      message: campaigns.message,
      status: campaigns.status,
      totalSms: sql<number>`count(${smsLogs.id})`
    })
    .from(campaigns)
    .leftJoin(smsLogs, eq(smsLogs.campaignId, campaigns.id))
    .groupBy(campaigns.id)
    .orderBy(sql`${campaigns.createdAt} desc`)
    .limit(20);

  res.json({
    totalSms: totals?.totalSms ?? 0,
    totalSentSms: totals?.sent ?? 0,
    failedSms: totals?.failed ?? 0,
    pendingSms: totals?.pending ?? 0,
    scheduledSms: scheduled?.scheduled ?? 0,
    deviceWise,
    campaignWise
  });
});

export default router;
