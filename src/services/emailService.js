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
}

module.exports = new EmailService();