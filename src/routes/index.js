const express = require('express');
const authRoutes = require('./auth');
const sectorsRoutes = require('./sectors');
const ownersRoutes = require('./owners');
const usersRoutes = require('./users');
const rolesRoutes = require('./roles');
const animalCensusRoutes = require('./animalCensus');
const medicalRecordsRoutes = require('./medicalRecords');
const supplyStockRoutes = require('./supplyStock');
const complaintsRoutes = require('./complaints');
const dayAttendanceRoutes = require('./dayAttendance');
const medicalDayRoutes = require('./medicalDay');
const staffRoutes = require('./staff');
const volunteersRoutes = require('./volunteers');
const usedSuppliesRoutes = require('./usedSupplies');
const bitacoraRoutes = require('./bitacora');
const petsRoutes = require('./pets');
const adoptionRoutes = require('./adoption');
const donationsRoutes = require('./donations');
const publicRoutes = require('./public'); // Importar rutas públicas

const router = express.Router();

// Montar rutas
router.use('/public', publicRoutes); // Rutas públicas accesibles sin login (/api/public/...)

router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);
router.use('/sectors', sectorsRoutes);
router.use('/owners', ownersRoutes);
router.use('/users', usersRoutes);
router.use('/animal-census', animalCensusRoutes);
router.use('/medical-days', medicalDayRoutes);
router.use('/medical-records', medicalRecordsRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/day-attendance', dayAttendanceRoutes);
router.use('/staff', staffRoutes);
router.use('/volunteers', volunteersRoutes);
router.use('/supply-stock', supplyStockRoutes);
router.use('/used-supplies', usedSuppliesRoutes);
router.use('/bitacora', bitacoraRoutes);
router.use('/pets', petsRoutes);
router.use('/adoption-requests', adoptionRoutes);
router.use('/donations', donationsRoutes);
router.use('/', require('./profile'));
module.exports = router;