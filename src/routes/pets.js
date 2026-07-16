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
//
// El wrapper captura errores de Cloudinary (credenciales no configuradas,
// archivo inválido, timeout de red) para que el controlador siempre corra:
// si la subida falla, req.file queda como null y la mascota se crea sin foto
// en lugar de devolver un 500 que bloquea el flujo del operador.
const withUpload = (fn) => (req, res, next) =>
  fn(req, res, (err) => {
    if (err) {
      console.error('Error en subida de imagen:', err.message);
      req.file = null;
    }
    next();
  });

router.get('/', verifyToken, checkRole(ROLES_ADOPCION), getPetsAdmin);
router.post('/', verifyToken, checkRole(ROLES_ADOPCION), withUpload(upload.single('foto')), createPet);
router.put('/:id', verifyToken, checkRole(ROLES_ADOPCION), withUpload(upload.single('foto')), updatePet);
router.delete('/:id', verifyToken, checkRole(ROLES_ADOPCION), deletePet);

module.exports = router;
