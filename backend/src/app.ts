import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import contactsRoutes from './modules/contacts/routes';
import dashboardRoutes from './modules/dashboard/routes';
import devicesRoutes from './modules/devices/routes';
import smsRoutes from './modules/sms/routes';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(pinoHttp({ logger }));
app.use(
  rateLimit({
    windowMs: env.API_RATE_LIMIT_WINDOW_MS,
    max: env.API_RATE_LIMIT_MAX,
    standardHeaders: true
  })
);

app.get('/health', (_req, res) => res.json({ status: 'ok', name: 'messagekaro.com api' }));
app.use('/devices', devicesRoutes);
app.use('/contacts', contactsRoutes);
app.use('/sms', smsRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
