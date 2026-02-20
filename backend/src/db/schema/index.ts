import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamp = () => integer({ mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date());

export const devices = sqliteTable('devices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  deviceId: text('device_id').notNull().unique(),
  createdAt: timestamp()
});

export const contacts = sqliteTable('contacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phoneNumber: text('phone_number').notNull().unique(),
  deviceId: integer('device_id').references(() => devices.id),
  createdAt: timestamp()
});

export const campaigns = sqliteTable('campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  message: text('message').notNull(),
  scheduledTime: integer('scheduled_time', { mode: 'timestamp_ms' }),
  status: text('status', { enum: ['scheduled', 'pending', 'processing', 'completed', 'failed'] })
    .notNull()
    .default('pending'),
  deviceId: integer('device_id').references(() => devices.id),
  createdAt: timestamp()
});

export const smsLogs = sqliteTable('sms_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  campaignId: integer('campaign_id')
    .notNull()
    .references(() => campaigns.id),
  phoneNumber: text('phone_number').notNull(),
  status: text('status', { enum: ['sent', 'failed', 'pending'] }).notNull().default('pending'),
  providerResponse: text('provider_response'),
  createdAt: timestamp()
});

export const deviceRelations = relations(devices, ({ many }) => ({
  contacts: many(contacts),
  campaigns: many(campaigns)
}));

export const campaignRelations = relations(campaigns, ({ one, many }) => ({
  device: one(devices, {
    fields: [campaigns.deviceId],
    references: [devices.id]
  }),
  logs: many(smsLogs)
}));

export const smsLogRelations = relations(smsLogs, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [smsLogs.campaignId],
    references: [campaigns.id]
  })
}));
