import { sql } from 'drizzle-orm';
import { db } from './client';

export const ensureSchema = () => {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      device_id TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL
    );
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL UNIQUE,
      device_id INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(device_id) REFERENCES devices(id)
    );
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      scheduled_time INTEGER,
      status TEXT NOT NULL,
      device_id INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(device_id) REFERENCES devices(id)
    );
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS sms_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      phone_number TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_response TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    );
  `);
};
