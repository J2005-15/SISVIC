const express = require('express');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validation');
const { getAvailablePets, submitAdoptionApplication, submitDonation } = require('../controllers/publicController');

const router = express.Router();

// Validaciones de entrada para seguridad de la base de datos
const validateAdoption = [
  body('visitor_name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('visitor_phone').trim().notEmpty().withMessage('El teléfono es requerido'),
  body('id_pet').isInt().withMessage('El ID de la mascota es requerido y debe ser numérico'),
  handleValidationErrors
];

const validateDonation = [
  body('visitor_name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('visitor_phone').trim().notEmpty().withMessage('El teléfono es requerido'),
  body('amount').isNumeric().withMessage('El monto debe ser numérico'),
  body('payment_reference').trim().notEmpty().withMessage('La referencia de pago es requerida'),
  body('payment_date').optional().isISO8601().withMessage('Formato de fecha de pago inválido'),
  handleValidationErrors
];

// =============== ENDPOINTS PÚBLICOS =================

// GET /api/public/pets - Listar animales disponibles
router.get('/pets', getAvailablePets);

// POST /api/public/adoption - Recibir solicitud de adopción
router.post('/adoption', validateAdoption, submitAdoptionApplication);

// POST /api/public/donations - Recibir registro de donación
router.post('/donations', validateDonation, submitDonation);

module.exports = router;