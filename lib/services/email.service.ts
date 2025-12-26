/**
 * Servicio de envío de emails usando Resend API
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Genera el HTML del email con el código de verificación
 */
function generateResetPasswordEmail(codigo: string, nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8B1538; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .code { background-color: #fff; border: 2px dashed #8B1538; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; color: #8B1538; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recuperación de Contraseña</h1>
        </div>
        <div class="content">
          <p>Hola ${nombre},</p>
          <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación:</p>
          <div class="code">${codigo}</div>
          <p>Este código expirará en 24 horas.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no respondas.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envía un email usando Resend API
 * Requiere variable de entorno RESEND_API_KEY
 * Documentación: https://resend.com/docs/api-reference/emails/send-email
 */
async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  
  // Usar dominio de prueba de Resend por defecto
  // Puedes configurar SMTP_FROM en .env para usar otro dominio
  const fromEmail = process.env.SMTP_FROM || 'onboarding@resend.dev';

  if (!apiKey) {
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return false;
    }

    // Resend devuelve { id: string } en caso de éxito
    if (responseData.id) {
      return true;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Servicio de email
 */
export const emailService = {
  /**
   * Envía código de verificación para recuperación de contraseña
   */
  sendPasswordResetCode: async (
    email: string,
    codigo: string,
    nombre: string
  ): Promise<boolean> => {
    const subject = 'Código de Verificación - Recuperación de Contraseña';
    const html = generateResetPasswordEmail(codigo, nombre);
    const text = `Hola ${nombre},\n\nHas solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación:\n\n${codigo}\n\nEste código expirará en 24 horas.\n\nSi no solicitaste este cambio, puedes ignorar este correo.`;

    const emailOptions = {
      to: email,
      subject,
      html,
      text,
    };

    return await sendEmailViaResend(emailOptions);
  },
};

