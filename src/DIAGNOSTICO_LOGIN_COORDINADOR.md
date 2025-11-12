# 🔍 Diagnóstico: Login de Coordinador No Funciona

## 📊 Flujo Actual de Autenticación

Actualmente, tu sistema tiene **UN SOLO FLUJO** de autenticación:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Usuario ingresa email y contraseña en Login.tsx             │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. authService.authenticate(email, password)                    │
│     - Línea 280: supabase.auth.signInWithPassword()             │
└───────────────────────┬─────────────────────────────────────────┘
                        ↓
        ┌───────────────┴────────────────┐
        │                                 │
        ↓                                 ↓
   ✅ FUNCIONA                      ❌ FALLA
   Administrador                    Coordinador/Guardarecurso
   (Existe en                       (NO existe en
   Supabase Auth)                   Supabase Auth)
        │                                 │
        ↓                                 ↓
   Login exitoso                    Error: "Invalid login credentials"
```

## ❌ El Problema

**Los Coordinadores y Guardarecursos NO están en Supabase Auth**, solo están en PostgreSQL.

### ¿Dónde está cada tipo de usuario?

| Tipo de Usuario | Supabase Auth | PostgreSQL | Contraseña |
|----------------|---------------|------------|------------|
| **Administrador** | ✅ SÍ | ✅ SÍ | En Supabase Auth |
| **Coordinador** | ❌ NO | ✅ SÍ | En PostgreSQL (hash SHA-256) |
| **Guardarecurso** | ❌ NO | ✅ SÍ | En PostgreSQL (hash SHA-256) |

### ¿Qué pasa cuando un Coordinador intenta hacer login?

1. **Frontend** llama `authService.authenticate('coordinador@conap.gob.gt', 'password123')`

2. **authService.ts línea 280** intenta:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'coordinador@conap.gob.gt',
     password: 'password123'
   });
   ```

3. **Supabase Auth responde**:
   ```json
   {
     "error": {
       "message": "Invalid login credentials"
     }
   }
   ```
   
   ¿Por qué? Porque el coordinador **NO EXISTE en Supabase Auth**

4. **authService.ts línea 285-296** retorna:
   ```typescript
   return {
     success: false,
     error: 'Credenciales inválidas. Por favor verifica tu correo y contraseña.'
   }
   ```

5. **Login.tsx** muestra el error al usuario

## 🎯 ¿Qué Debería Pasar?

Para que un Coordinador pueda hacer login, necesitas:

### Opción 1: Verificar en PostgreSQL Directamente

```
1. Usuario ingresa email y contraseña
   ↓
2. Frontend llama authService.authenticate()
   ↓
3. Intentar Supabase Auth (para Administradores)
   ├─ Si funciona → Continuar con flujo actual
   └─ Si falla → Intentar autenticación PostgreSQL
       ↓
4. Backend busca usuario en PostgreSQL
   ↓
5. Compara hash SHA-256 de la contraseña
   ↓
6. Si coincide → Genera token JWT y retorna
```

### Opción 2: Crear usuarios en Supabase Auth

```
Para cada Coordinador/Guardarecurso:
1. Crear usuario en Supabase Auth
2. Usar la misma contraseña que tienen en PostgreSQL
3. El login funcionará automáticamente
```

## 🔍 Verificación en la Base de Datos

Para entender mejor el problema, verifica:

### 1. ¿Qué usuarios existen en PostgreSQL?

```sql
SELECT 
  usr_id,
  usr_nombre,
  usr_apellido,
  usr_correo,
  rol.rl_nombre as rol,
  estado.std_nombre as estado,
  CASE 
    WHEN usr_contrasena IS NOT NULL THEN 'Tiene contraseña en PostgreSQL'
    ELSE 'NO tiene contraseña en PostgreSQL'
  END as estado_password
FROM usuario
LEFT JOIN rol ON usuario.usr_rol = rol.rl_id
LEFT JOIN estado ON usuario.usr_estado = estado.std_id
ORDER BY rol.rl_nombre, usr_nombre;
```

Resultado esperado:
```
┌────────┬─────────┬───────────┬──────────────────────┬─────────────┬─────────┬──────────────────────────────┐
│ usr_id │ nombre  │ apellido  │ correo               │ rol         │ estado  │ estado_password              │
├────────┼─────────┼───────────┼──────────────────────┼─────────────┼─────────┼──────────────────────────────┤
│ 1      │ Juan    │ Admin     │ admin@conap.gob.gt   │ Admin...    │ Activo  │ Tiene contraseña PostgreSQL  │
│ 2      │ María   │ Coord     │ coord@conap.gob.gt   │ Coord...    │ Activo  │ Tiene contraseña PostgreSQL  │
│ 3      │ Pedro   │ Guard     │ guarda@conap.gob.gt  │ Guard...    │ Activo  │ Tiene contraseña PostgreSQL  │
└────────┴─────────┴───────────┴──────────────────────┴─────────────┴─────────┴──────────────────────────────┘
```

### 2. ¿Qué usuarios existen en Supabase Auth?

En Supabase Dashboard → Authentication → Users

Resultado esperado:
```
┌──────────────────────────────────┬──────────────────────┐
│ Email                            │ Created              │
├──────────────────────────────────┼──────────────────────┤
│ admin@conap.gob.gt               │ 2024-11-10           │
└──────────────────────────────────┴──────────────────────┘
```

**NOTA**: Si solo ves `admin@conap.gob.gt` en Supabase Auth, entonces los Coordinadores y Guardarecursos **NO PUEDEN** hacer login con el código actual.

## 💡 Soluciones Posibles

### Solución 1: Sistema Híbrido (Recomendado - Ya implementado antes)

Modificar `authService.authenticate()` para intentar dos métodos:

```typescript
export async function authenticate(email: string, password: string): Promise<AuthResult> {
  // MÉTODO 1: Intentar Supabase Auth (Administradores)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (!error && data?.session) {
    // Es un Administrador, continuar flujo actual
    return { success: true, user: ..., token: ... };
  }
  
  // MÉTODO 2: Intentar PostgreSQL (Coordinadores/Guardarecursos)
  const pgLoginResponse = await fetch('https://.../auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (pgLoginResponse.ok) {
    const result = await pgLoginResponse.json();
    return { success: true, user: result.usuario, token: result.token };
  }
  
  // Ambos métodos fallaron
  return { success: false, error: 'Credenciales inválidas' };
}
```

### Solución 2: Crear usuarios en Supabase Auth

Para cada Coordinador/Guardarecurso en PostgreSQL:

1. **Ir a Supabase Dashboard** → Authentication → Users
2. **Agregar usuario manualmente**:
   - Email: `coordinador@conap.gob.gt`
   - Password: La misma que tiene en PostgreSQL
   - Confirmar email automáticamente

3. **Repetir** para cada usuario

**Ventaja**: El código actual funcionará sin cambios  
**Desventaja**: Tienes que mantener usuarios en dos lugares

### Solución 3: Usar solo PostgreSQL

Modificar todo el sistema para usar solo PostgreSQL (más complejo).

## 📝 Recomendación

Basado en tu comentario "no hagas una autenticación diferente", creo que quieres **Solución 2**: crear los usuarios en Supabase Auth.

### Pasos para implementar Solución 2:

1. **Obtén la contraseña del coordinador** (o resetéala a una nueva)

2. **Crea el usuario en Supabase Auth**:
   - Dashboard → Authentication → Users → Add User
   - Email: email del coordinador
   - Password: contraseña conocida
   - ✅ Auto Confirm User

3. **Actualiza la contraseña en PostgreSQL** para que coincida:
   ```sql
   -- Calcula el hash SHA-256 de la contraseña
   -- Ejemplo: si la contraseña es "password123"
   UPDATE usuario 
   SET usr_contrasena = 'hash_sha256_aqui'
   WHERE usr_correo = 'coordinador@conap.gob.gt';
   ```

4. **Prueba el login** con el coordinador

## ❓ Preguntas para Aclarar

1. **¿Tienes coordinadores/guardarecursos en Supabase Auth?**
   - Si NO → Necesitas crearlos (Solución 2) o implementar autenticación híbrida (Solución 1)
   - Si SÍ → El problema es otro (tal vez contraseña incorrecta)

2. **¿Quieres que los usuarios estén en Supabase Auth o solo en PostgreSQL?**
   - Supabase Auth → Usar Solución 2
   - Solo PostgreSQL → Necesitas Solución 1 (autenticación híbrida)

3. **¿Puedes verificar la tabla `usuario` en PostgreSQL?**
   - ¿Existe el coordinador?
   - ¿Tiene contraseña (campo `usr_contrasena`)?
   - ¿Está en estado "Activo"?

---

**Siguiente paso**: Dime cuál es tu situación actual y qué solución prefieres implementar.
