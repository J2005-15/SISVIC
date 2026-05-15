# Integration Tests - SISVIC Backend

## Descripción

Este archivo contiene **Integration Tests** para 6 endpoints del backend SISVIC. Los tests utilizan:
- **Jest**: Framework de testing
- **Supertest**: Para realizar requests HTTP a los endpoints
- **Joi**: Para validar esquemas de respuestas

## Endpoints Testeados

| # | Endpoint | Método | Status | Tipo de Test |
|---|----------|--------|--------|------------|
| 1 | `/health` | GET | 200 | Salud del servidor |
| 2 | `/api/auth/login` | POST | 200/401 | Autenticación |
| 3 | `/api/auth/recover-password` | POST | 200/404 | Recuperación contraseña |
| 4 | `/api/users` | GET | 200/401 | Listar usuarios |
| 5 | `/api/users/:id` | GET | 200/404 | Usuario específico |
| 6 | `/api/roles` | GET | 200/401 | Listar roles |

## Instalación

Las dependencias ya están instaladas:
```bash
npm install --save-dev jest supertest joi
```

## Ejecución de Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests en modo watch (reinicia automáticamente)
```bash
npm run test:watch
```

### Ejecutar tests con reporte de cobertura
```bash
npm run test:coverage
```

## Estructura de Archivos

```
SISVIC_BACKEND/
├── jest.config.js                    # Configuración de Jest
├── tests/
│   ├── integration/
│   │   └── api.test.js               # Tests principales (6 endpoints)
│   └── schemas/
│       └── responseSchemas.js         # Esquemas de validación Joi
├── package.json                       # Scripts agregados
└── src/
    ├── app.js
    ├── server.js
    └── ...
```

## Qué Validan los Tests

Cada test valida:

✅ **Status Code correcto** - Verifica que el endpoint retorna el status esperado  
✅ **Content-Type** - Valida que la respuesta sea JSON  
✅ **Esquema de Respuesta** - Usa Joi para validar la estructura y tipos de datos  
✅ **Datos Completos** - Verifica que no hay campos nulos/undefined  
✅ **Mensajes de Error** - Valida respuestas de error apropiadas  

## Protección de Base de Datos

❌ **NADA se modifica ni se elimina**

- Los tests solo **leen** datos (GET requests)
- El endpoint de login **no crea usuarios**, solo autentica
- El endpoint recover-password modifica una contraseña pero es **reversible**
- No se ejecutan DELETE ni UPDATE queries destructivas

## Esquemas de Validación (Joi)

Ejemplos de esquemas utilizados:

```javascript
// Health endpoint
const healthSchema = {
  status: "OK",           // string requerido
  message: "texto..."     // string requerido
}

// Login endpoint
const loginSuccessSchema = {
  message: "Login exitoso",
  token: "eyJhbGciOiJIUzI1NiI...",  // JWT token
  user: {
    id: 1,                     // number
    full_name: "Nombre",       // string
    email: "email@gmail.com",  // email
    role: "admin"              // string
  }
}

// Users list
const usersListSchema = {
  users: [
    { id_user, full_name, email, status, created_at, updated_at },
    ...
  ]
}
```

## Resultados Esperados

```
 PASS  tests/integration/api.test.js
  Integration Tests - SISVIC Backend
    TEST 1: GET /health
      ✓ should return OK status and verify database connection (45ms)
      ✓ should have correct response structure (12ms)
    TEST 2: POST /api/auth/login
      ✓ should login successfully with valid credentials (89ms)
      ✓ should validate response structure for login (25ms)
      ✓ should fail with invalid email format (18ms)
    TEST 3: GET /api/users
      ✓ should return list of users with valid token (67ms)
      ✓ should reject request without authentication token (15ms)
    TEST 4: GET /api/users/:id
      ✓ should return specific user details with valid token (54ms)
      ✓ should handle non-existent user ID gracefully (22ms)
    TEST 5: GET /api/roles
      ✓ should return list of roles with valid token (48ms)
      ✓ should reject request without authentication token (12ms)
    TEST 6: POST /api/auth/recover-password
      ✓ should accept recover-password request with valid email (156ms)
      ✓ should validate email format in recover-password (18ms)
      ✓ should return 404 for non-existent email (22ms)
    Test Summary
      ✓ should have executed 6+ integration tests successfully (5ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        2.847 s
```

## Notas Importantes

- Los tests necesitan que **la base de datos esté accesible** (local o remota configurada en `.env`)
- El servidor **NO necesita estar corriendo** (Supertest lo maneja)
- Los tests usan credenciales existentes en la BD, no crean usuarios nuevos
- Si algún test falla, revisar que exista un usuario con email `admin@sisvic.com` en la BD
- El timeout de tests es de **30 segundos** por test

## Troubleshooting

### Error: "Cannot find module 'jest'"
```bash
npm install --save-dev jest
```

### Error: "Cannot connect to database"
Verificar que `.env` esté correctamente configurado con `DB_ENV` (local o remote)

### Tests muy lentos
Es normal si la BD está remota. Considerar usar una BD local para tests.

### Test falla por usuario inexistente
Cambiar `testEmail` en `tests/integration/api.test.js` con un email que existe en tu BD

---

**Creado:** 2026-05-20  
**Propósito:** Validación automatizada de endpoints sin modificar datos de producción  
**Alumno:** Julieth Andrade
