const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const { env } = require('../config/env');

// Credenciales leídas exclusivamente de variables de entorno — nunca
// hardcodeadas. Deben existir en el .env: CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Almacenamiento en la nube: multer sube directo a Cloudinary, nunca toca
// disco local ni la base de datos — Neon solo guarda la URL resultante.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sisvic/animales',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

// Middleware listo para usar en cualquier ruta: upload.single('photo')
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo por foto
});

module.exports = { cloudinary, upload };
