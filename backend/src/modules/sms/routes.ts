import { Router } from 'express';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { stringify } from 'csv-stringify/sync';
import { z } from 'zod';
import { db } from '../../db/client';
import { smsLogs } from '../../db/schema';
import { validateMessageWordLimit } from '../../utils/message';
import { createCampaign, processCampaign } from './service';

const router = Router();

const sendSchema = z.object({
  message: z.string().min(1),
  deviceId: z.number().int().positive().optional(),
  contactNumbers: z.array(z.string()).optional()
});

const scheduleSchema = sendSchema.extend({
  scheduledTime: z.string().datetime()
});

router.post('/send', async (req, res) => {
  const payload = sendSchema.parse(req.body);
  const wordValidation = validateMessageWordLimit(payload.message);
  if (!wordValidation.valid) {
    return res.status(400).json({ message: `Message exceeds ${wordValidation.maxWords} words`, wordCount: wordValidation.wordCount });
  }

  const { campaign, logsCreated } = await createCampaign({
    message: payload.message,
    deviceId: payload.deviceId,
    status: 'pending',
    contactNumbers: payload.contactNumbers
  });

  await processCampaign(campaign.id);

  return res.status(201).json({ campaignId: campaign.id, logsCreated });
});

router.post('/schedule', async (req, res) => {
  const payload = scheduleSchema.parse(req.body);
  const wordValidation = validateMessageWordLimit(payload.message);
  if (!wordValidation.valid) {
    return res.status(400).json({ message: `Message exceeds ${wordValidation.maxWords} words`, wordCount: wordValidation.wordCount });
  }

  const { campaign, logsCreated } = await createCampaign({
    message: payload.message,
    deviceId: payload.deviceId,
    scheduledTime: new Date(payload.scheduledTime),
    status: 'scheduled',
    contactNumbers: payload.contactNumbers
  });

  return res.status(201).json({ campaignId: campaign.id, logsCreated, status: 'scheduled' });
});

router.get('/logs', async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;

  const conditions = [
    status ? eq(smsLogs.status, status as 'sent' | 'failed' | 'pending') : undefined,
    from ? gte(smsLogs.createdAt, from) : undefined,
    to ? lte(smsLogs.createdAt, to) : undefined
  ].filter(Boolean);

  const logs = await db.query.smsLogs.findMany({
    where: conditions.length ? and(...(conditions as any[])) : undefined,
    with: { campaign: true },
    orderBy: [desc(smsLogs.createdAt)]
  });

  if (req.query.format === 'csv') {
    const csv = stringify(
      logs.map((log) => ({
        id: log.id,
        campaign_id: log.campaignId,
        phone_number: log.phoneNumber,
        status: log.status,
        provider_response: log.providerResponse,
        created_at: log.createdAt?.toISOString?.() ?? log.createdAt
      })),
      { header: true }
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sms-logs.csv"');
    return res.send(csv);
  }

  return res.json(logs);
});

export default router;
