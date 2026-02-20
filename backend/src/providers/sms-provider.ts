export interface SmsSendPayload {
  to: string;
  body: string;
}

export interface SmsProvider {
  send(payload: SmsSendPayload): Promise<{ status: 'sent' | 'failed'; response: string }>;
}
