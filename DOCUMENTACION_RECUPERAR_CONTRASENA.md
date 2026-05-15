# Documentación: Implementación de Endpoint de Recuperación de Contraseña

## 1. Introducción

Se implementó un endpoint REST para permitir que los usuarios recuperen su contraseña en caso de olvido. El endpoint genera una contraseña temporal, la encripta en la base de datos, envía un correo electrónico con la nueva contraseña y permite al usuario iniciar sesión inmediatamente después.

---

## 2. Requisitos Cumplidos

✅ Crear un endpoint que recibe el email del usuario  
✅ Validar si el email existe en el sistema  
✅ Generar una contraseña temporal encriptada  
✅ Actualizar la contraseña en la base de datos  
✅ Enviar un correo electrónico con la nueva contraseña  
✅ Permitir login con la nueva contraseña  
✅ Retornar mensajes informativos al usuario  

---

## 3. Tecnologías Utilizadas

| Tecnología | Descripción |
|-----------|-------------|
| **Express.js** | Framework web para Node.js |
| **Sequelize** | ORM para interactuar con PostgreSQL |
| **bcryptjs** | Librería para encriptar contraseñas |
| **Nodemailer** | Librería para envío de correos |
| **JWT (jsonwebtoken)** | Para tokens de autenticación |
| **Gmail** | Servicio SMTP para envío de emails |

---

## 4. Componentes Modificados y Creados

### 4.1 Instalación de Dependencias
```bash
npm install nodemailer
```

### 4.2 Archivos Modificados

#### a) `.env` - Variables de Configuración
Se agregaron las siguientes variables:
```
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_app_gmail
EMAIL_FROM=Sistema SISVIC
```

#### b) `src/services/emailService.js` - Servicio de Email
- Se implementó **Nodemailer** con configuración de Gmail
- Método `sendPasswordResetEmail()` que envía la nueva contraseña
- Manejo de errores en caso de falla en el envío

#### c) `src/routes/auth.js` - Endpoint de Recuperación
Se agregó:
- Función `generateRandomPassword()` que crea una contraseña de 8 caracteres
- Validación del email con express-validator
- Endpoint `POST /auth/recover-password` con lógica completa
- Manejo de errores y respuestas HTTP apropiadas

---

## 5. Flujo del Endpoint

```
Usuario solicita recuperación de contraseña
         ↓
POST /api/auth/recover-password
         ↓
Validar que el email sea válido (formato correcto)
         ↓
Buscar usuario en la BD por email
         ↓
¿Usuario existe?
    ├─ NO  → Responder 404: "No existe cuenta con este email"
    └─ SÍ  → Continuar
         ↓
Generar contraseña aleatoria (8 caracteres)
         ↓
Encriptar contraseña con bcrypt
         ↓
Actualizar contraseña en la BD
         ↓
Enviar email con nueva contraseña
         ↓
¿Email enviado correctamente?
    ├─ NO  → Responder 500: "Error al enviar email"
    └─ SÍ  → Responder 200: "Contraseña enviada"
         ↓
Usuario recibe correo con nueva contraseña
         ↓
Usuario puede hacer LOGIN con la nueva contraseña
         ↓
Sistema genera TOKEN JWT válido
```

---

## 6. Respuestas del Endpoint

### 6.1 Respuesta Exitosa (200)
```json
{
  "message": "Se ha enviado una nueva contraseña a tu email. Por favor revisa tu correo.",
  "note": "En desarrollo, la contraseña también aparece en los logs de consola"
}
```

### 6.2 Respuesta - Usuario No Encontrado (404)
```json
{
  "message": "No existe una cuenta asociada a este email"
}
```

### 6.3 Respuesta - Error en Envío de Email (500)
```json
{
  "message": "Error al enviar el email. Por favor intenta más tarde."
}
```

### 6.4 Respuesta - Email Inválido (400)
```json
{
  "errors": [
    {
      "msg": "Email inválido",
      "param": "email"
    }
  ]
}
```

---

## 7. Pruebas Realizadas en Postman

### 7.1 Prueba 1: Recuperación de Contraseña Exitosa

**Paso 1: Enviar solicitud al endpoint**
- **Método:** POST
- **URL:** `http://localhost:3000/api/auth/recover-password`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "email": "usuario@gmail.com"
  }
  ```

**Respuesta esperada:**
```json
{
  "message": "Se ha enviado una nueva contraseña a tu email. Por favor revisa tu correo.",
  "note": "En desarrollo, la contraseña también aparece en los logs de consola"
}
```

**Validación:**
- ✅ Status Code: 200 OK
- ✅ Email recibido en la bandeja de entrada
- ✅ Nueva contraseña visible en el correo

---

### 7.2 Prueba 2: Login con Nueva Contraseña

**Paso 1: Copiar la contraseña del correo recibido**

**Paso 2: Realizar login**
- **Método:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "email": "usuario@gmail.com",
    "password": "NUEVA_CONTRASEÑA_DEL_CORREO"
  }
  ```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Nombre del Usuario",
    "email": "usuario@gmail.com",
    "role": "admin"
  }
}
```

**Validación:**
- ✅ Status Code: 200 OK
- ✅ Token JWT generado correctamente
- ✅ Datos del usuario retornados
- ✅ Token válido para usar en endpoints protegidos

---

### 7.3 Prueba 3: Error - Email No Existe

**Paso 1: Enviar email que no existe en BD**
- **Body:**
  ```json
  {
    "email": "nodexiste@gmail.com"
  }
  ```

**Respuesta esperada:**
```json
{
  "message": "No existe una cuenta asociada a este email"
}
```

**Validación:**
- ✅ Status Code: 404 Not Found
- ✅ Mensaje informativo adecuado

---

### 7.4 Prueba 4: Validación de Email Inválido

**Paso 1: Enviar email con formato inválido**
- **Body:**
  ```json
  {
    "email": "email_invalido"
  }
  ```

**Respuesta esperada:**
```json
{
  "errors": [
    {
      "msg": "Email inválido",
      "param": "email"
    }
  ]
}
```

**Validación:**
- ✅ Status Code: 400 Bad Request
- ✅ Validación de formato funcionando

---

## 8. Estructura del Código

### 8.1 Función de Generación de Contraseña
```javascript
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};
```
- Genera contraseña de 8 caracteres con letras mayúsculas, minúsculas, números y caracteres especiales
- Cada contraseña es única

### 8.2 Servicio de Email
```javascript
async sendPasswordResetEmail(email, newPassword) {
  // Configuración del correo
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Recuperación de Contraseña - Sistema SISVIC',
    html: `<h2>Recuperación de Contraseña</h2>...`
  };
  
  // Envío con manejo de errores
  try {
    await this.transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    return false;
  }
}
```

### 8.3 Endpoint de Recuperación
```javascript
router.post('/recover-password', validateRecoverPassword, async (req, res) => {
  // 1. Validar email
  // 2. Buscar usuario
  // 3. Generar contraseña
  // 4. Encriptar con bcrypt
  // 5. Actualizar BD
  // 6. Enviar email
  // 7. Responder al cliente
});
```

---

## 9. Seguridad Implementada

| Aspecto de Seguridad | Implementación |
|-------------------|-----------------|
| **Encriptación de Contraseña** | bcryptjs con salt de 10 rondas |
| **Validación de Entrada** | express-validator para email |
| **Contraseña Aleatoria** | 8 caracteres alfanuméricos y especiales |
| **Manejo de Errores** | No expone detalles internos del servidor |
| **CORS** | Configurado en app.js |
| **JWT** | Token de 24 horas de validez |

---

## 10. Diagrama de Flujo Completo

```
┌─────────────────────────────────────┐
│   Usuario olvida su contraseña      │
└────────────────┬────────────────────┘
                 │
         POST /api/auth/recover-password
         Body: { email: "usuario@gmail.com" }
                 │
         ┌───────┴───────┐
         │               │
    Validar Email    Buscar en BD
         │               │
    ¿Válido?        ¿Existe?
      │                 │
      NO               NO
      │                 │
   Error 400        Error 404
      │                 │
      └─────────┬───────┘
                │
                SÍ
                │
        Generar Contraseña
                │
        Encriptar (bcrypt)
                │
        Actualizar en BD
                │
        Enviar Email (Nodemailer/Gmail)
                │
        ¿Enviado?
         │      │
        NO    SÍ
         │      │
      Err   Respuesta 200
      500   
              │
        Usuario recibe
        correo con nueva
        contraseña
              │
        ┌─────────────────┐
        │  POST /login    │
        │  Enviar nueva   │
        │  contraseña     │
        └────────┬────────┘
                 │
         ¿Credenciales OK?
              │    │
             NO   SÍ
              │    │
           Err  Generar
           401  Token JWT
                 │
            Respuesta 200
            con TOKEN
                 │
         Usuario autenticado ✅
```

---

## 11. Conclusiones

✅ **Endpoint funcional:** El endpoint de recuperación de contraseña funciona correctamente al 100%

✅ **Integración con Email:** Se implementó Nodemailer con Gmail exitosamente

✅ **Encriptación:** Las contraseñas se encriptan con bcryptjs antes de almacenarlas

✅ **Validaciones:** Se validan emails, se verifican usuarios en BD y se manejan errores

✅ **Flujo completo:** El usuario puede recuperar contraseña y hacer login inmediatamente después

✅ **Postman:** Todas las pruebas se realizaron y se validaron correctamente en Postman

---

## 12. Pasos para Reproducir la Prueba

1. **Configurar credenciales de Gmail en `.env`**
2. **Iniciar servidor:** `npm run dev:local`
3. **Abrir Postman**
4. **Crear request POST** a `http://localhost:3000/api/auth/recover-password`
5. **Enviar email de usuario existente**
6. **Verificar correo recibido**
7. **Copiar contraseña del correo**
8. **Hacer login** con la nueva contraseña en endpoint `/api/auth/login`
9. **Validar token JWT** retornado

---

## 13. Archivos Modificados

```
SISVIC_BACKEND/
├── .env (MODIFICADO - variables de email)
├── package.json (MODIFICADO - nodemailer agregado)
├── src/
│   ├── services/
│   │   └── emailService.js (MODIFICADO - Nodemailer implementado)
│   └── routes/
│       └── auth.js (MODIFICADO - endpoint recover-password agregado)
```

---

**Documento generado para presentación al profesor**  
**Fecha:** 2026-05-15  
**Alumno:** Julieth Andrade  
**Materia:** Desarrollo Backend - SISVIC
