import { Router } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client';
import { contacts } from '../../db/schema';
import { toE164 } from '../../utils/phone';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const manualSchema = z.object({
  phoneNumber: z.string(),
  deviceId: z.number().int().positive().optional()
});

router.post('/manual', async (req, res) => {
  const payload = manualSchema.parse(req.body);
  const normalized = toE164(payload.phoneNumber);

  if (!normalized) {
    return res.status(400).json({ message: 'Invalid phone number. Use E.164 format.' });
  }

  const existing = await db.query.contacts.findFirst({ where: eq(contacts.phoneNumber, normalized) });
  if (existing) {
    return res.status(409).json({ message: 'Contact already exists' });
  }

  const [created] = await db
    .insert(contacts)
    .values({ phoneNumber: normalized, deviceId: payload.deviceId })
    .returning();

  return res.status(201).json(created);
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, { defval: '' });

  const numbers = rows
    .map((row) => row.phone_number || row.phone || row.mobile || Object.values(row)[0])
    .map((value) => toE164(String(value ?? '')))
    .filter((value): value is string => Boolean(value));

  const unique = [...new Set(numbers)];
  const existingRows = unique.length
    ? await db.select({ phoneNumber: contacts.phoneNumber }).from(contacts).where(inArray(contacts.phoneNumber, unique))
    : [];

  const existingSet = new Set(existingRows.map((row) => row.phoneNumber));
  const toInsert = unique
    .filter((number) => !existingSet.has(number))
    .map((phoneNumber) => ({ phoneNumber }));

  if (toInsert.length) {
    await db.insert(contacts).values(toInsert);
  }

  return res.json({
    uploaded: rows.length,
    valid: unique.length,
    inserted: toInsert.length,
    skippedDuplicates: unique.length - toInsert.length
  });
});

router.get('/', async (req, res) => {
  const deviceId = req.query.deviceId ? Number(req.query.deviceId) : undefined;

  const list = await db.query.contacts.findMany({
    where: deviceId ? eq(contacts.deviceId, deviceId) : undefined,
    orderBy: (tbl, { desc }) => [desc(tbl.createdAt)]
  });

  res.json({ total: list.length, contacts: list });
});

export default router;
