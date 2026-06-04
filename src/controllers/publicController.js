const { Pets, Donations } = require('../models');
const { sequelize }       = require('../config/database');
const emailService        = require('../services/emailService');

const ADMIN_EMAIL = 'julieth20051506@gmail.com'; // ← cambia esto a tu correo real

// GET /pets - Obtener solo los animales disponibles
const getAvailablePets = async (req, res, next) => {
  try {
    const pets = await Pets.findAll({
      where: { status: 'available' },
      order: [['created_at', 'DESC']]
    });
    res.json({ pets });
  } catch (error) {
    next(error);
  }
};

// POST /adoption - Registrar nueva solicitud de adopción
const submitAdoptionApplication = async (req, res, next) => {
  try {
    const { visitor_name, visitor_email, visitor_phone, id_pet } = req.body;

    const [resultado] = await sequelize.query(
      `INSERT INTO "Adoption"
         (id_pet, visitor_name, visitor_email, visitor_phone, "Adoption_status", created_at, updated_at)
       VALUES
         (:id_pet, :visitor_name, :visitor_email, :visitor_phone, 'pending', NOW(), NOW())
       RETURNING *`,
      { replacements: { id_pet, visitor_name, visitor_email, visitor_phone } }
    );

    // Notifica al administrador (sin await para no retrasar la respuesta al usuario)
    emailService.sendAdminAlert(
      ADMIN_EMAIL,
      'adopcion',
      `<strong>Solicitante:</strong> ${visitor_name}<br>
       <strong>Teléfono:</strong> ${visitor_phone}<br>
       <strong>Correo:</strong> ${visitor_email}<br>
       <strong>ID Mascota:</strong> ${id_pet}`
    );

    res.status(201).json({
      message: 'Solicitud de adopción enviada exitosamente',
      application: resultado[0]
    });
  } catch (error) {
    console.error('Error en submitAdoptionApplication:', error.message);
    res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
};

// POST /donations - Registrar donación o transferencia
const submitDonation = async (req, res, next) => {
  try {
    const { visitor_name, visitor_email, visitor_phone, amount, payment_method, destination_bank, payment_reference, payment_date } = req.body;

    const donation = await Donations.create({
      visitor_name,
      visitor_email,
      visitor_phone,
      amount: parseFloat(amount),
      payment_method,
      destination_bank,
      payment_reference,
      payment_date: payment_date || new Date(),
      status: 'Por Verificar'
    });

    // Notifica al administrador (sin await para no retrasar la respuesta al usuario)
    emailService.sendAdminAlert(
      ADMIN_EMAIL,
      'donacion',
      `<strong>Donante:</strong> ${visitor_name}<br>
       <strong>Email:</strong> ${visitor_email}<br>
       <strong>Teléfono:</strong> ${visitor_phone}<br>
       <strong>Monto:</strong> Bs. ${amount}<br>
       <strong>Método:</strong> ${payment_method}<br>
       <strong>Banco:</strong> ${destination_bank}<br>
       <strong>Referencia:</strong> ${payment_reference}`
    );

    res.status(201).json({
      message: 'Donación registrada exitosamente. Pendiente de verificación por un administrador.',
      donation
    });
  } catch (error) {
    // Manejar el caso de que la referencia de pago ya exista (unique constraint en tu modelo)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Esta referencia de pago ya ha sido registrada previamente' });
    }
    console.error('Error en submitDonation:', error.message);
    next(error);
  }
};

module.exports = {
  getAvailablePets,
  submitAdoptionApplication,
  submitDonation
};