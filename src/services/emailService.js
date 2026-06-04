const nodemailer = require('nodemailer');
const { env } = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: env.EMAIL_SERVICE,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Bienvenido a Sistema SISVIC',
      html: `
        <h2>¡Bienvenido ${name}!</h2>
        <p>Tu cuenta ha sido creada exitosamente en el Sistema SISVIC.</p>
        <p>Ya puedes iniciar sesión con tus credenciales.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de bienvenida enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, newPassword) {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: 'Recuperación de Contraseña - Sistema SISVIC',
      html: `
        <h2>Recuperación de Contraseña</h2>
        <p>Se ha generado una nueva contraseña para tu cuenta.</p>
        <h3>Tu nueva contraseña es: <strong>${newPassword}</strong></h3>
        <p><strong>Por favor cambia esta contraseña después de iniciar sesión.</strong></p>
        <br>
        <p>Si no solicitaste esta recuperación, por favor contacta al administrador.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de recuperación enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return false;
    }
  }

  async sendPasswordResetLink(email, resetUrl) {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: '🔐 Recuperar Contraseña — Sistema SISVIC',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#765A05;">Sistema SISVIC — Misión Nevado</h2>
          <p>Has solicitado restablecer tu contraseña de acceso.</p>
          <p>Haz clic en el botón para crear una nueva contraseña:</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}"
               style="background-color:#765A05;color:white;padding:14px 32px;
                      border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="font-size:12px;color:#999;">
            Si no solicitaste este cambio, ignora este mensaje.<br>
            Este enlace solo puede usarse una vez.
          </p>
        </div>
      `
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Enlace de recuperación enviado a ${email}`);
      return true;
    } catch (error) {
      console.error('Error al enviar enlace de recuperación:', error);
      return false;
    }
  }

  async sendAdminAlert(adminEmail, tipo, detalles) {
    const esAdopcion = tipo === 'adopcion';
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: adminEmail,
      subject: `🔔 Nueva ${esAdopcion ? 'solicitud de adopción' : 'donación'} — SISVIC`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #765A05;">Sistema SISVIC — Misión Nevado</h2>
          <p>Hola Administrador,</p>
          <p>Hay una nueva <strong>${esAdopcion ? 'solicitud de adopción' : 'donación'}</strong>
             registrada en el sistema esperando tu revisión.</p>
          <div style="background:#FFEFD1;border-left:4px solid #765A05;padding:12px 16px;border-radius:8px;margin:16px 0;">
            ${detalles}
          </div>
          <p>Ingresa al panel de administración para procesarla.</p>
          <p style="font-size:11px;color:#999;">Mensaje automático — Sistema SISVIC</p>
        </div>
      `
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Alerta de ${tipo} enviada al administrador`);
      return true;
    } catch (error) {
      console.error('Error al enviar alerta admin:', error);
      return false;
    }
  }

  async sendStatusUpdateEmail(email, tipo, estado) {
    const esAdopcion = tipo === 'adopcion';
    const mensajeEstado = estado === 'Aprobada' ? 'aprobada' : estado === 'Rechazada' ? 'rechazada' : 'actualizada';

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: `✅ Tu solicitud de ${esAdopcion ? 'adopción' : 'donación'} ha sido ${mensajeEstado}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#2D6A4F;">🐾 Fundación Misión Nevado — SISCVI</h2>
          <p style="font-size:16px;">¡Hola!</p>
          <p style="font-size:15px;line-height:1.6;">
            Queremos informarte que tu solicitud de <strong>${esAdopcion ? 'adopción' : 'donación'}</strong>
            ha sido <strong style="color:#2D6A4F;">${mensajeEstado}</strong>.
          </p>

          ${estado === 'Aprobada' ? `
            <div style="background:#E8F5E9;border-left:4px solid #2D6A4F;padding:15px;border-radius:5px;margin:20px 0;">
              <p style="margin:0;font-size:15px;color:#1B5E20;">
                <strong>¡Felicidades!</strong> Tu trámite ha avanzado. Nuestro equipo se comunicará contigo
                muy pronto con los próximos pasos.
              </p>
            </div>
          ` : estado === 'Rechazada' ? `
            <div style="background:#FFEBEE;border-left:4px solid #D32F2F;padding:15px;border-radius:5px;margin:20px 0;">
              <p style="margin:0;font-size:15px;color:#B71C1C;">
                Si tienes dudas sobre esta decisión, por favor contáctanos.
              </p>
            </div>
          ` : ''}

          <p style="font-size:13px;color:#999;margin-top:30px;">
            Gracias por ser parte de SISCVI y apoyar nuestra misión de proteger a nuestros animalitos.
          </p>
          <p style="font-size:11px;color:#CCC;">Mensaje automático — No respondas este correo.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Notificación de estado enviada a ${email}`);
      return true;
    } catch (error) {
      console.error('Error al enviar notificación de estado:', error);
      return false;
    }
  }

  async sendInventoryAlertEmail(email, adminName, lowStockProducts, expiringProducts) {
    const lowStockHTML = lowStockProducts.map(product => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${product.material_name || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${product.current_quantity}</td>
      </tr>
    `).join('');

    const expiringHTML = expiringProducts.map(product => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${product.material_name || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(product.expiration_date).toLocaleDateString()}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: env.EMAIL_FROM,
      to: email,
      subject: '⚠️ Alerta de Inventario - Sistema SISVIC',
      html: `
        <h2>Alertas de Inventario - SISVIC</h2>
        <p>Hola ${adminName},</p>
        <p>Se han detectado los siguientes problemas en el inventario:</p>

        ${lowStockProducts.length > 0 ? `
          <h3>📦 Productos con Stock Bajo (&lt; 20 unidades)</h3>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px;">Producto</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Cantidad</th>
              </tr>
            </thead>
            <tbody>${lowStockHTML}</tbody>
          </table>
        ` : ''}

        ${expiringProducts.length > 0 ? `
          <h3>⏰ Productos Próximos a Vencer (&lt; 30 días)</h3>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px;">Producto</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Fecha Vencimiento</th>
              </tr>
            </thead>
            <tbody>${expiringHTML}</tbody>
          </table>
        ` : ''}

        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Este es un mensaje automático. Por favor no respondas.
        </p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Alerta de inventario enviada a ${email}`);
      return true;
    } catch (error) {
      console.error('Error al enviar alerta de inventario:', error);
      return false;
    }
  }
}

module.exports = new EmailService();