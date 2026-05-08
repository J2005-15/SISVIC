# SISVIC Backend

Backend para el sistema SISVIC construido con Express.js y Sequelize.

## Características

- Express.js con async/awaitñ
- Alternancia entre bases de datos locales y remotas (PostgreSQL)
- Autenticación JWT
- Validación de datos con express-validator
- Manejo centralizado de errores
- CORS configurado
- Logging con Morgan
- Variables de entorno con Dotenv
## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Copia el archivo `.env.example` a `.env` y configura las variables:
   ```bash
   cp .env.example .env
   ```

4. Configura tu base de datos en el archivo `.env`

## Configuración de Base de Datos

El proyecto soporta dos modos de base de datos:

- **Local**: Configura `DB_ENV=local` y las variables `DB_HOST_LOCAL`, etc.
- **Remota**: Configura `DB_ENV=remote` y usa `DB_URI_REMOTE` para Neon.

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión y recibir token JWT
- `POST /api/auth/register` - Registrar usuario nuevo (requiere auth admin)
- `GET /api/roles` - Obtener lista de roles disponibles

### Sectores
- `GET /api/sectors` - Obtener todos los sectores
- `GET /api/sectors/:id` - Obtener sector por ID
- `POST /api/sectors` - Crear sector (requiere auth admin)
- `PUT /api/sectors/:id` - Actualizar sector (requiere auth admin)
- `DELETE /api/sectors/:id` - Eliminar sector (requiere auth admin)

### Propietarios
- `GET /api/owners` - Obtener todos los propietarios
- `GET /api/owners/:id` - Obtener propietario por ID
- `POST /api/owners` - Crear propietario (requiere auth admin)
- `PUT /api/owners/:id` - Actualizar propietario (requiere auth admin)
- `DELETE /api/owners/:id` - Eliminar propietario (requiere auth admin)

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (requiere auth)
- `GET /api/users/:id` - Obtener usuario por ID (requiere auth)
- `POST /api/users` - Crear usuario (requiere auth admin)
- `PUT /api/users/:id` - Actualizar usuario (requiere auth admin)
- `DELETE /api/users/:id` - Eliminar usuario (requiere auth admin)

### Censo de Animales
- `GET /api/animal-census` - Obtener todos los censos
- `GET /api/animal-census/:id` - Obtener censo por ID
- `POST /api/animal-census` - Crear censo (requiere auth)
- `PUT /api/animal-census/:id` - Actualizar censo (requiere auth)
- `DELETE /api/animal-census/:id` - Eliminar censo (requiere auth admin)

### Registros Médicos
- `GET /api/medical-records` - Obtener todos los registros (requiere auth)
- `GET /api/medical-records/:id` - Obtener registro por ID (requiere auth)
- `POST /api/medical-records` - Crear registro (requiere auth)
- `PUT /api/medical-records/:id` - Actualizar registro (requiere auth)
- `DELETE /api/medical-records/:id` - Eliminar registro (requiere auth admin)

### Días Médicos
- `GET /api/medical-days` - Obtener todos los días médicos (requiere auth)
- `GET /api/medical-days/:id` - Obtener día médico por ID (requiere auth)
- `POST /api/medical-days` - Crear día médico (requiere auth admin)
- `PUT /api/medical-days/:id` - Actualizar día médico (requiere auth admin)
- `DELETE /api/medical-days/:id` - Eliminar día médico (requiere auth admin)

### Asistencia de Jornada
- `GET /api/day-attendance` - Obtener todas las asistencias (requiere auth)
- `GET /api/day-attendance/:id` - Obtener asistencia por ID (requiere auth)
- `POST /api/day-attendance` - Crear asistencia (requiere auth admin)
- `PUT /api/day-attendance/:id` - Actualizar asistencia (requiere auth admin)
- `DELETE /api/day-attendance/:id` - Eliminar asistencia (requiere auth admin)

### Denuncias
- `GET /api/complaints` - Obtener todas las denuncias (requiere auth)
- `GET /api/complaints/:id` - Obtener denuncia por ID (requiere auth)
- `POST /api/complaints` - Crear denuncia (requiere auth admin)
- `PUT /api/complaints/:id` - Actualizar denuncia (requiere auth admin)
- `DELETE /api/complaints/:id` - Eliminar denuncia (requiere auth admin)

### Personal y Voluntarios
- `GET /api/staff-volunteers` - Obtener todo el staff (requiere auth)
- `GET /api/staff-volunteers/:id` - Obtener staff por ID (requiere auth)
- `POST /api/staff-volunteers` - Crear miembro del staff (requiere auth admin)
- `PUT /api/staff-volunteers/:id` - Actualizar miembro del staff (requiere auth admin)
- `DELETE /api/staff-volunteers/:id` - Eliminar miembro del staff (requiere auth admin)

### Uso de Suministros
- `GET /api/used-supplies` - Obtener consumos de suministros (requiere auth)
- `GET /api/used-supplies/:id` - Obtener consumo por ID (requiere auth)
- `POST /api/used-supplies` - Registrar uso de suministro (requiere auth admin)
- `PUT /api/used-supplies/:id` - Actualizar uso de suministro (requiere auth admin)
- `DELETE /api/used-supplies/:id` - Eliminar uso de suministro (requiere auth admin)

### Stock de Suministros
- `GET /api/supply-stock` - Obtener todo el stock (requiere auth)
- `GET /api/supply-stock/:id` - Obtener suministro por ID (requiere auth)
- `POST /api/supply-stock` - Crear suministro (requiere auth admin)
- `PUT /api/supply-stock/:id` - Actualizar suministro (requiere auth admin)
- `DELETE /api/supply-stock/:id` - Eliminar suministro (requiere auth admin)

## Estructura del Proyecto

```
src/
├── config/
│   ├── database.js       # Configuración de BD
│   └── env.js            # Validación de variables de entorno
├── controllers/          # Lógica de negocio
├── middlewares/          # Middlewares personalizados
├── models/               # Modelos de Sequelize
├── routes/               # Definición de rutas
├── services/             # Servicios externos
├── utils/                # Utilidades
├── app.js                # Configuración de Express
└── server.js             # Punto de entrada
```

## Dependencias Principales

- express
- sequelize
- pg
- jsonwebtoken
- bcryptjs
- express-validator
- cors
- morgan
- dotenv
- helmet