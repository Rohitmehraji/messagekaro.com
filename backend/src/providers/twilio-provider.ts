import twilio from 'twilio';
import { env } from '../config/env';
import { SmsProvider } from './sms-provider';

export class TwilioProvider implements SmsProvider {
  private client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  async send(payload: { to: string; body: string }) {
    if (!env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER is missing');
    }

    const message = await this.client.messages.create({
      from: env.TWILIO_PHONE_NUMBER,
      to: payload.to,
      body: payload.body
    });

    return {
      status: 'sent' as const,
      response: message.sid
    };
  }
}
