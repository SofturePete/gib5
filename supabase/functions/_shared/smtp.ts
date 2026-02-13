import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const config: EmailConfig = {
    host: Deno.env.get('SMTP_HOST') || '',
    port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
    username: Deno.env.get('SMTP_USER') || '',
    password: Deno.env.get('SMTP_PASS') || '',
    from: Deno.env.get('SMTP_FROM') || 'noreply@example.com'
  };

  const client = new SMTPClient({
    connection: {
      hostname: config.host,
      port: config.port,
      tls: true,
      auth: {
        username: config.username,
        password: config.password,
      },
    },
  });

  await client.send({
    from: config.from,
    to: to,
    subject: subject,
    content: 'auto',
    html: html,
  });

  await client.close();
}
