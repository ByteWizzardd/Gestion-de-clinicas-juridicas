/**
 * Servicio de envío de emails usando Gmail SMTP con nodemailer
 * Requiere variables de entorno: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */

import nodemailer from 'nodemailer';

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
 * Crea y retorna un transporter de nodemailer configurado para Gmail SMTP
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.error('❌ SMTP_USER y SMTP_PASS deben estar configurados en las variables de entorno');
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true para 465, false para otros puertos
    auth: {
      user: smtpUser,
      pass: smtpPass, // Contraseña de aplicación de Google
    },
  });
}

/**
 * Envía un email usando Gmail SMTP con nodemailer
 * Requiere variables de entorno: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */
async function sendEmailViaGmail(options: EmailOptions): Promise<boolean> {
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!fromEmail) {
    console.error('❌ SMTP_FROM o SMTP_USER debe estar configurado');
    return false;
  }

  const transporter = createTransporter();
  if (!transporter) {
    return false;
  }

  try {
    console.log(`📤 Enviando email desde ${fromEmail} hacia ${options.to}`);

    const info = await transporter.sendMail({
      from: `"Sistema de Recuperación" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    console.log(`✅ Email enviado exitosamente (Message ID: ${info.messageId}) a ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email vía Gmail SMTP:');
    console.error('   Destinatario:', options.to);
    
    if (error instanceof Error) {
      console.error('   Error:', error.message);
      
      // Errores comunes de Gmail
      if (error.message.includes('Invalid login')) {
        console.error('   💡 Posible problema: Usuario o contraseña de aplicación incorrectos');
      }
      if (error.message.includes('Connection timeout')) {
        console.error('   💡 Posible problema: Problema de conexión con el servidor SMTP');
      }
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        console.error('   💡 Posible problema: Límite de emails alcanzado (500/día en Gmail)');
      }
    } else {
      console.error('   Error:', error);
    }
    
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
    console.log(`📧 Intentando enviar código a: ${email}`);
    
    const subject = 'Código de Verificación - Recuperación de Contraseña';
    const html = generateResetPasswordEmail(codigo, nombre);
    const text = `Hola ${nombre},\n\nHas solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación:\n\n${codigo}\n\nEste código expirará en 24 horas.\n\nSi no solicitaste este cambio, puedes ignorar este correo.`;

    const emailOptions = {
      to: email.trim().toLowerCase(),
      subject,
      html,
      text,
    };

    const result = await sendEmailViaGmail(emailOptions);
    
    if (!result) {
      console.error(`❌ No se pudo enviar el email a ${email}`);
    }
    
    return result;
  },
};

