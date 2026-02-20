import { and, eq, lte, or } from 'drizzle-orm';
import { db } from '../../db/client';
import { campaigns, contacts, smsLogs } from '../../db/schema';
import { getSmsProvider } from '../../providers';
import { validateMessageWordLimit } from '../../utils/message';

export const createCampaign = async (params: {
  message: string;
  deviceId?: number;
  scheduledTime?: Date;
  status: 'pending' | 'scheduled';
  contactNumbers?: string[];
}) => {
  const messageValidation = validateMessageWordLimit(params.message);
  if (!messageValidation.valid) {
    throw new Error(`Message exceeds ${messageValidation.maxWords} words`);
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({
      message: params.message,
      deviceId: params.deviceId,
      scheduledTime: params.scheduledTime,
      status: params.status
    })
    .returning();

  const recipients = params.contactNumbers?.length
    ? params.contactNumbers
    : (
        await db
          .select({ phoneNumber: contacts.phoneNumber })
          .from(contacts)
          .where(params.deviceId ? eq(contacts.deviceId, params.deviceId) : undefined)
      ).map((row) => row.phoneNumber);

  if (!recipients.length) {
    return { campaign, logsCreated: 0 };
  }

  await db.insert(smsLogs).values(
    recipients.map((phoneNumber) => ({
      campaignId: campaign.id,
      phoneNumber,
      status: 'pending'
    }))
  );

  return { campaign, logsCreated: recipients.length };
};

export const processCampaign = async (campaignId: number) => {
  const provider = getSmsProvider();

  const campaign = await db.query.campaigns.findFirst({ where: eq(campaigns.id, campaignId) });
  if (!campaign) return;

  await db.update(campaigns).set({ status: 'processing' }).where(eq(campaigns.id, campaignId));

  const logs = await db.query.smsLogs.findMany({
    where: and(eq(smsLogs.campaignId, campaignId), or(eq(smsLogs.status, 'pending'), eq(smsLogs.status, 'failed')))
  });

  let hasFailure = false;
  for (const log of logs) {
    try {
      const result = await provider.send({ to: log.phoneNumber, body: campaign.message });
      await db
        .update(smsLogs)
        .set({ status: result.status, providerResponse: result.response })
        .where(eq(smsLogs.id, log.id));
    } catch (error) {
      hasFailure = true;
      await db
        .update(smsLogs)
        .set({ status: 'failed', providerResponse: String(error) })
        .where(eq(smsLogs.id, log.id));
    }
  }

  await db
    .update(campaigns)
    .set({ status: hasFailure ? 'failed' : 'completed' })
    .where(eq(campaigns.id, campaignId));
};

export const processDueCampaigns = async () => {
  const dueCampaigns = await db.query.campaigns.findMany({
    where: and(lte(campaigns.scheduledTime, new Date()), eq(campaigns.status, 'scheduled'))
  });

  for (const campaign of dueCampaigns) {
    await processCampaign(campaign.id);
  }
};
