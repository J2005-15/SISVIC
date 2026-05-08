// Servicio de email (placeholder - integrar con SendGrid, Nodemailer, etc.)
class EmailService {
  async sendWelcomeEmail(email, name) {
    // Implementar envío de email de bienvenida
    console.log(`Enviando email de bienvenida a ${email} para ${name}`);
    // Aquí iría la lógica real con un proveedor de email
    return true;
  }

  async sendPasswordResetEmail(email, resetToken) {
    // Implementar envío de email de reset de contraseña
    console.log(`Enviando email de reset a ${email} con token ${resetToken}`);
    return true;
  }
}

module.exports = new EmailService();