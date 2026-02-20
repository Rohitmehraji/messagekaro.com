import { SmsProvider } from './sms-provider';

export class MockProvider implements SmsProvider {
  async send(payload: { to: string; body: string }) {
    return {
      status: 'sent' as const,
      response: `mock:${payload.to}:${payload.body.length}`
    };
  }
}
