# DEBUG: ERROR 403 FORBIDDEN - MIDDLEWARE CORREGIDO

## DIAGNÓSTICO DEL PROBLEMA

### ✅ Confirmado: Frontend funciona perfectamente
- POST `/api/owners` se envía correctamente
- Header `Authorization: Bearer <token>` presente
- JWT decodificado contiene: `{ "id": 1, "email": "admin@siscvi.com", "role": "administrador" }`

### ❌ Problema: Middleware extrayendo/validando mal el token

---

## ROOT CAUSE ANALYSIS

### Error 1: Extracción del Token (auth.js middleware)
**ANTES (Incorrecto):**
```javascript
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];
```

**Problemas:**
- No verificaba formato "Bearer "
- Si authHeader es undefined, `split(' ')[1]` fallaba silenciosamente
- No manejaba variaciones de capitalización

**DESPUÉS (Correcto):**
```javascript
const authHeader = req.headers.authorization || req.headers.Authorization;

if (!authHeader?.startsWith('Bearer ')) {
  return res.status(401).json({
    message: 'Token no proporcionado o formato inválido'
  });
}

const token = authHeader.split(' ')[1];  // Ahora garantizado válido
```

---

### Error 2: Validación de Roles (middleware incorrecto)
**ANTES (Incorrecto):**
```javascript
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.id_role)) {  // ❌ id_role no existe en JWT
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
};
```

**Problemas:**
1. JWT tiene `role: "administrador"` (string), no `id_role: 1` (número)
2. Middleware buscaba `id_role` que no está en el JWT
3. Siempre fallaba → 403 FORBIDDEN

**DESPUÉS (Correcto):**
```javascript
const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    const userRole = req.user?.role;  // ✅ Lee la propiedad correcta
    
    if (!userRole || !rolesPermitidos.includes(userRole)) {
      return res.status(403).json({
        message: `Acceso denegado. Tu rol '${userRole}' no tiene permisos`
      });
    }
    next();
  };
};
```

---

## FLUJO CORRECTO DE AUTORIZACIÓN

### 1. Frontend envía POST
```
POST /api/owners
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Body: { full_name: "Juan", phone_number: "0424...", ... }
```

### 2. Backend recibe y extrae el token
```javascript
authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // ✅ Solo JWT
```

### 3. Verifica JWT y decodifica
```javascript
jwt.verify(token, JWT_SECRET)
// ✅ Retorna:
// {
//   id: 1,
//   email: "admin@siscvi.com",
//   id_role: 1,
//   role: "administrador"  // ✅ Normalizado (sin typo)
// }
req.user = { id, email, id_role, role }
```

### 4. Valida roles
```javascript
const userRole = req.user.role  // "administrador"
const rolesPermitidos = ['administrador', 'veterinario']
rolesPermitidos.includes(userRole)  // ✅ TRUE
next()  // ✅ Continúa
```

### 5. Controlador crea el propietario
```javascript
await Owners.create({ full_name, phone_number, ... })
res.status(201).json({ success: true, owner: { ... } })  // ✅ 201 CREATED
```

---

## MAPEO DE ROLES

El sistema acepta tres roles (strings):

| Rol | ID | Permisos |
|-----|----|----|
| `"administrador"` | 1 | POST, PUT, DELETE propietarios |
| `"veterinario"` | 2 | POST, PUT propietarios |
| `"operador"` | 3 | Solo GET propietarios (lectura) |

**Rutas POST, PUT, DELETE:** `checkRole(['administrador', 'veterinario'])`  
**Rutas DELETE:** `checkRole(['administrador'])`  
**Rutas GET:** Públicas (sin autenticación)

---

## NORMALIZACIÓN DEL TYPO

Si la BD tiene `role_name = "adminiatrador"` (con typo):

```javascript
// En auth.js login:
const normalizeRoleName = (roleName) => {
  const normalized = roleName.toLowerCase().trim();
  if (normalized === 'adminiatrador') return 'administrador';
  return normalized;
};

const rolNormalizado = normalizeRoleName(user.Role.role_name);
// "adminiatrador" → "administrador"

// JWT contiene: { role: "administrador" }  ✅ Sin typo
```

**Resultado:** Aunque la BD tenga el typo, el JWT siempre lo normaliza.

---

## TESTING DEL FLUJO

### 1. Verificar extracción del token
```bash
# En el navegador, abre DevTools → Network
# Haz POST a /api/owners

# Verifica el request:
Authorization: Bearer <token>  ✅

# En backend console debe mostrar:
Token extraído correctamente: eyJ...
```

### 2. Verificar decodificación del JWT
```bash
# En backend, añade este log en verifyToken:
console.log('JWT decodificado:', decodedUser);
// Debe mostrar:
// { id: 1, email: "admin@siscvi.com", id_role: 1, role: "administrador" }
```

### 3. Verificar validación de roles
```bash
# En backend, añade este log en checkRole:
console.log('User role:', userRole);
console.log('Roles permitidos:', rolesPermitidos);
console.log('¿Tiene permiso?', rolesPermitidos.includes(userRole));
// Debe mostrar:
// User role: administrador
// Roles permitidos: [ 'administrador', 'veterinario' ]
// ¿Tiene permiso? true
```

---

## CAMBIOS REALIZADOS

### 1. src/middlewares/auth.js
✅ `verifyToken`: Extrae Bearer token correctamente  
✅ `checkRole`: Valida `req.user.role` (string), no `id_role`  
✅ Mensajes de error claros y descriptivos

### 2. src/routes/owners.js
✅ Usa `verifyToken` y `checkRole` con roles como strings  
✅ POST: `checkRole(['administrador', 'veterinario'])`  
✅ DELETE: `checkRole(['administrador'])`  

### 3. src/routes/auth.js (login)
✅ JWT contiene `role` normalizado (sin typo)  
✅ Si DB tiene "adminiatrador", JWT lo convierte a "administrador"

---

## RESULTADO ESPERADO

```
❌ ANTES:
POST /api/owners → 403 Forbidden
(Middleware no podía validar roles)

✅ DESPUÉS:
POST /api/owners → 201 Created
{
  "success": true,
  "message": "Propietario creado exitosamente",
  "owner": { id_owner: 1, full_name: "Juan", ... }
}
```

---

## COMPATIBILIDAD

Los middlewares exportan aliases para compatibilidad:
```javascript
module.exports = {
  verifyToken,
  checkRole,
  
  // Aliases (para código anterior)
  authenticateToken: verifyToken,
  authorizeRoles: (rolesArray) => checkRole(rolesArray)
};
```

**Importe usando nombres nuevos (recomendado):**
```javascript
const { verifyToken, checkRole } = require('../middlewares/auth');
router.post('/', verifyToken, checkRole(['administrador']), createOwner);
```

---

**Fecha:** 2026-06-18  
**Status:** ✅ **MIDDLEWARE CORREGIDO - ERROR 403 ELIMINADO**
