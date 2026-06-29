const express = require('express');
const { getPetsAdmin, createPet, updatePet, deletePet } = require('../controllers/petsController');
const { verifyToken, checkRole } = require('../middlewares/auth');
const { upload } = require('../utils/upload');

const router = express.Router();

// Visible para administrador y operador, igual que el resto del módulo
// de adopciones (Cartelera + Solicitudes).
const ROLES_ADOPCION = ['administrador', 'operador'];

// upload.single('foto') va ANTES del controlador: multer ya subió el archivo
// a Cloudinary (utils/upload.js) y dejó la URL resultante en req.file.path
// antes de que createPet/updatePet se ejecuten. Reemplaza al multer.diskStorage
// local que usaba el POST /api/pets crudo en app.js (se perdía en cada
// redeploy de Render por el filesystem efímero).
router.get('/', verifyToken, checkRole(ROLES_ADOPCION), getPetsAdmin);
router.post('/', verifyToken, checkRole(ROLES_ADOPCION), upload.single('foto'), createPet);
router.put('/:id', verifyToken, checkRole(ROLES_ADOPCION), upload.single('foto'), updatePet);
router.delete('/:id', verifyToken, checkRole(ROLES_ADOPCION), deletePet);

module.exports = router;
