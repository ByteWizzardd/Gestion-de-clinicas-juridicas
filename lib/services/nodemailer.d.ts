declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface SendMailOptions {
    from?: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }

  export interface SentMessageInfo {
    messageId: string;
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<SentMessageInfo>;
  }

  export function createTransport(options: TransportOptions): Transporter;
}

