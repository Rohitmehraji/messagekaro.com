import { env } from '../config/env';
import { MockProvider } from './mock-provider';
import { SmsProvider } from './sms-provider';
import { TwilioProvider } from './twilio-provider';

export const getSmsProvider = (): SmsProvider => {
  if (env.SMS_PROVIDER === 'twilio') {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio configuration is incomplete. Set account sid, auth token and phone number.');
    }

    return new TwilioProvider();
  }

  return new MockProvider();
};
