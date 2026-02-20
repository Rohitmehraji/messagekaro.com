import { api } from './client';

export const fetchStats = async () => (await api.get('/dashboard/stats')).data;
export const fetchDevices = async () => (await api.get('/devices')).data;
export const createDevice = async (payload: { name: string; deviceId: string }) =>
  (await api.post('/devices', payload)).data;

export const fetchContacts = async () => (await api.get('/contacts')).data;
export const addContact = async (payload: { phoneNumber: string; deviceId?: number }) =>
  (await api.post('/contacts/manual', payload)).data;

export const sendSmsNow = async (payload: { message: string; deviceId?: number }) =>
  (await api.post('/sms/send', payload)).data;

export const scheduleSms = async (payload: { message: string; deviceId?: number; scheduledTime: string }) =>
  (await api.post('/sms/schedule', payload)).data;

export const fetchLogs = async (params?: { status?: string; from?: string; to?: string }) =>
  (await api.get('/sms/logs', { params })).data;
