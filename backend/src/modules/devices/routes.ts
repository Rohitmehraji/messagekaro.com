import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import { devices } from '../../db/schema';

const router = Router();

const createDeviceSchema = z.object({
  name: z.string().min(2),
  deviceId: z.string().min(3)
});

router.post('/', async (req, res) => {
  const payload = createDeviceSchema.parse(req.body);

  const existing = await db.query.devices.findFirst({ where: eq(devices.deviceId, payload.deviceId) });
  if (existing) {
    return res.status(409).json({ message: 'Device ID already exists' });
  }

  const [created] = await db.insert(devices).values(payload).returning();

  return res.status(201).json(created);
});

router.get('/', async (_req, res) => {
  const results = await db.query.devices.findMany({ orderBy: (tbl, { desc }) => [desc(tbl.createdAt)] });
  return res.json(results);
});

export default router;
