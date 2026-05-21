const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const bcrypt  = require('bcrypt');
const emailService = require('./services/emailService');
const { sequelize } = require('./config/database');

const crypto      = require('crypto');

const ADMIN_EMAIL    = 'julieth20051506@siscvi.com';
const DASHBOARD_URL  = 'http://localhost:5173'; // puerto del dashboard

// Agrega la columna reset_token la primera vez que arranca el servidor
sequelize.query(`ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64)`)
  .catch(err => console.error('reset_token column:', err.message));

// ── Carpeta de uploads (se crea sola si no existe) ────────────────────────────
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Importar Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Importar middlewares
const errorHandler = require('./middlewares/errorHandler');

// Crear instancia de Express
const app = express();

// Middlewares de seguridad y logging
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : '*',
  credentials: true
}));
app.use(morgan('combined'));

// Middlewares para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Sirve las imágenes subidas como archivos estáticos.
// El header Cross-Origin-Resource-Policy permite que el frontend
// (puerto 5173) cargue imágenes servidas desde este servidor (puerto 3000).
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadDir));

// Ruta para acceder a la documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api', require('./routes/index'));

// Ruta de salud
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', message: 'Servidor y base de datos funcionando' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Error en la base de datos' });
  }
});

app.post('/api/Adoption-Tramite', async (req, res) => {
    const { visitor_id_card, visitor_name, visitor_phone, visitor_email, id_pet, procedure_status } = req.body;
    
    try {
        const query = `
            INSERT INTO "Adoption-Tramite" (visitor_id_card, visitor_name, visitor_phone, visitor_email, id_pet, procedure_status)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        // Ejecutamos la consulta
        const result = await pool.query(query, [visitor_id_card, visitor_name, visitor_phone, visitor_email, id_pet, procedure_status]);
        
        res.status(201).json({ success: true, message: 'Trámite registrado exitosamente', data: result.rows[0] });
    } catch (error) {
        console.error('Error al guardar el trámite:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// ── POST /api/forgot-password — Genera token y envía enlace de recuperación ──
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'El email es requerido.' });
  try {
    const [usuarios] = await sequelize.query(
      `SELECT id_user FROM "Users" WHERE email = :email AND status = 'activo' LIMIT 1`,
      { replacements: { email } }
    );
    if (usuarios.length === 0) {
      return res.status(404).json({ success: false, message: 'No existe una cuenta activa con ese correo.' });
    }
    // Token aleatorio de 64 caracteres hexadecimales
    const token = crypto.randomBytes(32).toString('hex');
    await sequelize.query(
      `UPDATE "Users" SET reset_token = :token WHERE email = :email`,
      { replacements: { token, email } }
    );
    const resetUrl = `${DASHBOARD_URL}/reset-password?token=${token}`;
    await emailService.sendPasswordResetLink(email, resetUrl);
    res.status(200).json({ success: true, message: 'Enlace de recuperación enviado a tu correo.' });
  } catch (error) {
    console.error('Error en forgot-password:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ── POST /api/reset-password — Valida el token y actualiza la contraseña ─────
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token y contraseña son requeridos.' });
  }
  try {
    const [usuarios] = await sequelize.query(
      `SELECT id_user FROM "Users" WHERE reset_token = :token LIMIT 1`,
      { replacements: { token } }
    );
    if (usuarios.length === 0) {
      return res.status(400).json({ success: false, message: 'El enlace es inválido o ya fue utilizado.' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    // Actualiza contraseña y borra el token (un solo uso)
    await sequelize.query(
      `UPDATE "Users" SET password = :hash, reset_token = NULL WHERE reset_token = :token`,
      { replacements: { hash, token } }
    );
    res.status(200).json({ success: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error('Error en reset-password:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ── POST /api/recover-password — Genera clave temporal, la cifra y la envía ──
app.post('/api/recover-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'El email es requerido.' });
  }
  try {
    // 1. Verifica que el correo exista en la BD
    const [usuarios] = await sequelize.query(
      `SELECT id_user, full_name FROM "Users" WHERE email = :email AND status = 'activo' LIMIT 1`,
      { replacements: { email } }
    );
    if (usuarios.length === 0) {
      return res.status(404).json({ success: false, message: 'No existe una cuenta activa con ese correo.' });
    }

    // 2. Genera contraseña temporal (4 letras + 4 números)
    const claveTemp = Math.random().toString(36).slice(-4).toUpperCase() +
                      Math.floor(1000 + Math.random() * 9000);

    // 3. Cifra con bcrypt (10 rondas) y guarda el hash en la BD
    const claveHash = await bcrypt.hash(claveTemp, 10);
    await sequelize.query(
      `UPDATE "Users" SET password = :clave WHERE email = :email`,
      { replacements: { clave: claveHash, email } }
    );

    // 4. Envía el correo con la contraseña en texto plano (el usuario la verá)
    await emailService.sendPasswordResetEmail(email, claveTemp);

    res.status(200).json({ success: true, message: 'Se ha enviado una contraseña temporal a tu correo electrónico.' });
  } catch (error) {
    console.error('Error en recuperación de clave:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ── POST /api/pets — Publica un animal en la cartelera pública ───────────────
app.post('/api/pets', upload.single('foto'), async (req, res) => {
  const { nombre, especie, raza, sexo, edad, color, energia, estado, historia } = req.body;
  const image_url = req.file
    ? `http://localhost:3000/uploads/${req.file.filename}`
    : null;
  try {
    const descripcion = `${historia} | Sexo: ${sexo} | Color: ${color} | Comportamiento: ${energia} | Estado: ${estado}`;
    const [resultado] = await sequelize.query(
      `INSERT INTO "Pets" (name, species, breed, age, description, image_url, status, created_at, updated_at)
       VALUES (:name, :species, :breed, :age, :description, :image_url, 'available', NOW(), NOW())
       RETURNING *`,
      {
        replacements: {
          name:        nombre,
          species:     especie,
          breed:       raza   || null,
          age:         edad,
          description: descripcion,
          image_url,
        }
      }
    );
    res.status(201).json({ success: true, message: 'Animal publicado en cartelera', data: resultado[0] });
  } catch (error) {
    console.error('Error al publicar animal:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ── GET /api/donations — Lista todas las donaciones ──────────────────────────
app.get('/api/donations', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT id_donation, visitor_name, visitor_phone, amount,
              payment_reference, payment_date, status, created_at
       FROM "Donations"
       ORDER BY created_at DESC`
    );
    res.status(200).json({ donations: rows });
  } catch (error) {
    console.error('Error al obtener donaciones:', error.message);
    res.status(500).json({ message: 'Error al obtener donaciones' });
  }
});

// ── PATCH /api/donations/:id — Actualiza el estado de una donación ────────────
app.patch('/api/donations/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await sequelize.query(
      `UPDATE "Donations" SET status = :status, updated_at = NOW() WHERE id_donation = :id`,
      { replacements: { status, id: req.params.id } }
    );
    res.status(200).json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error al actualizar donación:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/complaints-list — Lista denuncias para el dashboard ──────────────
app.get('/api/complaints-list', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT id_complaint, description, priority, status
       FROM "Complaints"
       ORDER BY id_complaint DESC`
    );
    res.status(200).json({ complaints: rows });
  } catch (error) {
    console.error('Error al obtener denuncias:', error.message);
    res.status(500).json({ message: 'Error al obtener denuncias' });
  }
});

// ── PATCH /api/complaints-status/:id — Actualiza el estado de una denuncia ────
app.patch('/api/complaints-status/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await sequelize.query(
      `UPDATE "Complaints" SET status = :status WHERE id_complaint = :id`,
      { replacements: { status, id: req.params.id } }
    );
    res.status(200).json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error al actualizar denuncia:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── PATCH /api/pets/:id — Edita los datos de un animal en cartelera ───────────
app.patch('/api/pets/:id', async (req, res) => {
  const { nombre, especie, raza, edad } = req.body;
  try {
    await sequelize.query(
      `UPDATE "Pets"
       SET name = :name, species = :species, breed = :breed, age = :age, updated_at = NOW()
       WHERE id_pet = :id`,
      { replacements: { name: nombre, species: especie, breed: raza || null, age: edad, id: req.params.id } }
    );
    res.status(200).json({ message: 'Animal actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar animal:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/pets/:id — Elimina un animal de la cartelera ──────────────────
app.delete('/api/pets/:id', async (req, res) => {
  try {
    await sequelize.query(
      `DELETE FROM "Pets" WHERE id_pet = :id`,
      { replacements: { id: req.params.id } }
    );
    res.status(200).json({ message: 'Animal eliminado de la cartelera' });
  } catch (error) {
    console.error('Error al eliminar animal:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/sectors — Lista sectores para el select del formulario ──────────
app.get('/api/sectors', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT id_sector, community_name FROM "Sectors" ORDER BY community_name ASC`
    );
    res.status(200).json({ sectors: rows });
  } catch (error) {
    console.error('Error al obtener sectores:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/owners — Lista propietarios con nombre de sector ─────────────────
app.get('/api/owners', async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT o.id_owner, o.id_card, o.full_name, o.phone_number, o.address,
              o.id_sector, s.community_name
       FROM "Owners" o
       LEFT JOIN "Sectors" s ON s.id_sector = o.id_sector
       ORDER BY o.full_name ASC`
    );
    res.status(200).json({ owners: rows });
  } catch (error) {
    console.error('Error al obtener propietarios:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── POST /api/owners — Registra un propietario manualmente ───────────────────
app.post('/api/owners', async (req, res) => {
  const { full_name, id_card, phone_number, address, id_sector } = req.body;
  try {
    const [resultado] = await sequelize.query(
      `INSERT INTO "Owners" (full_name, id_card, phone_number, address, id_sector)
       VALUES (:full_name, :id_card, :phone_number, :address, :id_sector)
       RETURNING *`,
      { replacements: { full_name, id_card, phone_number, address, id_sector } }
    );
    res.status(201).json({ message: 'Propietario registrado', data: resultado[0] });
  } catch (error) {
    if (error.message.includes('unique') || error.message.includes('duplicate')) {
      return res.status(409).json({ message: 'Ya existe un propietario con esa cédula.' });
    }
    console.error('Error al registrar propietario:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── DELETE /api/owners/:id — Elimina un propietario ──────────────────────────
app.delete('/api/owners/:id', async (req, res) => {
  try {
    await sequelize.query(
      `DELETE FROM "Owners" WHERE id_owner = :id`,
      { replacements: { id: req.params.id } }
    );
    res.status(200).json({ message: 'Propietario eliminado' });
  } catch (error) {
    console.error('Error al eliminar propietario:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── PATCH /api/adoption-approve/:id — Aprueba una adopción y registra propietario ──
app.patch('/api/adoption-approve/:id', async (req, res) => {
  const { estado, full_name, id_card, phone_number, address } = req.body;
  try {
    // 1. Actualiza el estado de la adopción
    await sequelize.query(
      `UPDATE "Adoption" SET "Adoption_status" = :status, updated_at = NOW() WHERE "id_Adoption" = :id`,
      { replacements: { status: estado, id: req.params.id } }
    );

    if (estado === 'Aprobada') {
      // 2. Obtiene el id_pet de esta adopción
      const [rows] = await sequelize.query(
        `SELECT id_pet FROM "Adoption" WHERE "id_Adoption" = :id`,
        { replacements: { id: req.params.id } }
      );
      const id_pet = rows[0]?.id_pet;

      if (id_pet) {
        // 3. Marca la mascota como adoptada
        await sequelize.query(
          `UPDATE "Pets" SET status = 'adopted', updated_at = NOW() WHERE id_pet = :id_pet`,
          { replacements: { id_pet } }
        );
      }

      // 4. Obtiene el primer sector disponible para satisfacer el FK
      const [sectors] = await sequelize.query(`SELECT id_sector FROM "Sectors" LIMIT 1`);
      const id_sector = sectors[0]?.id_sector;

      if (id_sector) {
        // 5. Registra al adoptante como propietario (ignora si la cédula ya existe)
        await sequelize.query(
          `INSERT INTO "Owners" (full_name, id_card, phone_number, address, id_sector)
           VALUES (:full_name, :id_card, :phone_number, :address, :id_sector)
           ON CONFLICT (id_card) DO NOTHING`,
          { replacements: { full_name, id_card, phone_number, address: address || 'No especificada', id_sector } }
        );
      }
    }

    res.status(200).json({ message: 'Trámite procesado correctamente' });
  } catch (error) {
    console.error('Error al procesar trámite:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/adoption-requests — Lista solicitudes para el dashboard ─────────
app.get('/api/adoption-requests', async (req, res) => {
  try {
    const [solicitudes] = await sequelize.query(
      `SELECT
         a."id_Adoption",
         a.visitor_name,
         a.visitor_phone,
         a.visitor_email,
         a."Adoption_status",
         a.created_at,
         p.name AS pet_name
       FROM "Adoption" a
       LEFT JOIN "Pets" p ON p.id_pet = a.id_pet
       ORDER BY a.created_at DESC`
    );
    res.status(200).json({ solicitudes });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error.message);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
});

// ── POST /api/login — Verifica credenciales del administrador ─────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos.' });
  }
  try {
    // Paso 1: buscar el usuario por correo solamente
    const [usuarios] = await sequelize.query(
      `SELECT id_user, full_name, email, password FROM "Users"
       WHERE email = :email AND status = 'activo'
       LIMIT 1`,
      { replacements: { email } }
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const usuario = usuarios[0];

    // Paso 2: verificar contraseña (soporta bcrypt y texto plano para compatibilidad)
    let passwordValida = false;
    const hashGuardado = usuario.password ?? '';
    if (hashGuardado.startsWith('$2b$') || hashGuardado.startsWith('$2a$')) {
      passwordValida = await bcrypt.compare(password, hashGuardado);
    } else {
      passwordValida = (hashGuardado === password);
    }

    if (!passwordValida) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    res.status(200).json({
      success: true,
      user: { id_user: usuario.id_user, full_name: usuario.full_name, email: usuario.email }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

module.exports = app;