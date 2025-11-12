# 🚀 Instrucciones de Despliegue Final - Login de Coordinadores

## ✅ ¿Qué se Solucionó?

Los **Coordinadores no podían hacer login** porque solo existían en PostgreSQL, no en Supabase Auth. 

**Ahora**, cuando creas un Coordinador, automáticamente se crea en **ambos lugares**:
- ✅ PostgreSQL (base de datos)
- ✅ Supabase Auth (sistema de autenticación)

## 📦 Archivos Modificados

### Backend
- **`/supabase/functions/server/index.tsx`**
  - Endpoint `POST /usuarios` ahora crea usuarios en Supabase Auth

### Documentación Creada
- **`/FIX_LOGIN_COORDINADOR.md`** - Detalles técnicos del fix
- **`/DIAGNOSTICO_LOGIN_COORDINADOR.md`** - Análisis del problema original
- **`/INSTRUCCIONES_DESPLIEGUE_FINAL.md`** - Este archivo

## 🚀 Pasos de Despliegue

### Opción 1: Despliegue Manual (RECOMENDADO)

#### 1. Accede a Supabase Dashboard
```
https://supabase.com/dashboard/project/ctgcuhfqmuukezjwewwn
```

#### 2. Ve a Edge Functions
- Click en "Edge Functions" en el menú lateral

#### 3. Encuentra la función
- Busca: `make-server-276018ed`

#### 4. Actualiza el código
- Abre el editor
- Copia **TODO** el contenido de `/supabase/functions/server/index.tsx`
- Pégalo en el editor
- Guarda los cambios

#### 5. Despliega
- Click en "Deploy" o "Redeploy"
- Espera confirmación (1-2 minutos)

#### 6. Verifica
- Estado debe ser "Active" o "Deployed"

### Opción 2: Despliegue con CLI

```bash
# 1. Instalar CLI (si no lo tienes)
npm install -g supabase

# 2. Login
supabase login

# 3. Link al proyecto
supabase link --project-ref ctgcuhfqmuukezjwewwn

# 4. Desplegar
supabase functions deploy make-server-276018ed

# 5. Verificar
supabase functions list
```

## ✅ Verificación Post-Despliegue

### Test 1: Health Check
```bash
curl https://ctgcuhfqmuukezjwewwn.supabase.co/functions/v1/make-server-276018ed/health

# Respuesta esperada:
# {"status":"ok"}
```

### Test 2: Crear Nuevo Coordinador

#### Paso A: Login como Administrador
1. Ve a tu aplicación
2. Login con credenciales de administrador

#### Paso B: Crear Coordinador
1. **Navega a**: Gestión de Personal → Usuarios Coordinadores
2. **Click**: "Crear Nuevo Coordinador"
3. **Completa**:
   ```
   Nombre: Test
   Apellido: Coordinador
   Cédula: 1234567890
   Teléfono: 12345678
   Email: test.coordinador@conap.gob.gt
   Contraseña: TestPass123
   ```
4. **Click**: "Crear Coordinador"
5. **Verifica**: Mensaje de éxito

#### Paso C: Verificar en Supabase Auth
1. **Ve a**: Supabase Dashboard → Authentication → Users
2. **Busca**: `test.coordinador@conap.gob.gt`
3. **Debe aparecer** en la lista de usuarios

#### Paso D: Probar Login del Coordinador
1. **Cierra sesión** del administrador
2. **Intenta login** con:
   ```
   Email: test.coordinador@conap.gob.gt
   Contraseña: TestPass123
   ```
3. **Resultado esperado**: ✅ Login exitoso

### Test 3: Revisar Logs

#### En Supabase Dashboard
1. **Ve a**: Edge Functions → make-server-276018ed → Logs
2. **Busca** estas líneas después de crear un coordinador:
   ```
   📧 Creando usuario Coordinador en Supabase Auth: test.coordinador@conap.gob.gt
   ✅ Usuario Coordinador creado en Supabase Auth: test.coordinador@conap.gob.gt
   ```

Si ves estos logs, todo está funcionando correctamente.

## 🔧 Migración de Usuarios Existentes

Si tienes **coordinadores existentes** que no pueden hacer login:

### Opción A: Crear Manualmente en Supabase Auth (Rápido)

Para cada coordinador que no puede hacer login:

1. **Ve a**: Supabase Dashboard → Authentication → Users
2. **Click**: "Add User"
3. **Completa**:
   ```
   Email: [email del coordinador en PostgreSQL]
   Password: [una nueva contraseña]
   ✅ Auto Confirm User
   ```
4. **Comunica** la nueva contraseña al coordinador

### Opción B: Re-crear desde el Frontend (Limpio)

1. **Anota** los datos del coordinador existente
2. **Elimina** el coordinador desde el frontend
3. **Crea nuevamente** desde el frontend
4. Ahora se creará en ambos lugares automáticamente

## 🐛 Troubleshooting

### Problema 1: Coordinador nuevo no aparece en Supabase Auth

**Síntomas**: Usuario se crea pero no aparece en Authentication → Users

**Solución**:
1. Revisa los logs de Edge Functions
2. Busca errores que mencionen "Supabase Auth"
3. Posibles causas:
   - Email ya existe en Auth
   - Formato de email inválido
   - Cuota de usuarios excedida (plan gratuito tiene límite)

**Fix Temporal**: Crear manualmente en Supabase Auth (ver Opción A arriba)

### Problema 2: Login falla con "Credenciales inválidas"

**Posibles causas**:
1. **Usuario no existe en Supabase Auth**
   - Verifica en Dashboard → Authentication → Users
   - Si no está, créalo manualmente

2. **Contraseña incorrecta**
   - Resetea la contraseña en Supabase Auth
   - Comunica nueva contraseña al usuario

3. **Usuario en estado "Suspendido" o "Desactivado" en PostgreSQL**
   - Verifica en tabla `usuario`:
     ```sql
     SELECT usr_correo, estado.std_nombre 
     FROM usuario 
     LEFT JOIN estado ON usuario.usr_estado = estado.std_id 
     WHERE usr_correo = 'email@conap.gob.gt';
     ```
   - Estado debe ser "Activo"

### Problema 3: Error al crear usuario

**Error**: "Ya existe un usuario con este correo electrónico"

**Causa**: Email duplicado en PostgreSQL o Supabase Auth

**Solución**:
1. Verifica si ya existe en PostgreSQL:
   ```sql
   SELECT * FROM usuario WHERE usr_correo = 'email@conap.gob.gt';
   ```
2. Verifica si ya existe en Supabase Auth:
   - Dashboard → Authentication → Users

3. Si existe en Auth pero no en PostgreSQL:
   - Elimina de Auth o usa otro email

4. Si existe en PostgreSQL pero no en Auth:
   - El nuevo código lo creará en Auth automáticamente

## 📊 Checklist Final

Antes de dar por completado el despliegue:

- [ ] Edge Function desplegada en Supabase
- [ ] Health check responde OK
- [ ] Puedes crear nuevos Coordinadores
- [ ] Nuevos Coordinadores aparecen en Supabase Auth
- [ ] Nuevos Coordinadores pueden hacer login
- [ ] Logs muestran creación exitosa en Auth
- [ ] Guardarecursos siguen funcionando
- [ ] Administradores siguen funcionando
- [ ] Migraste o comunicaste sobre usuarios existentes

## 📝 Notas Importantes

1. **Usuarios existentes** NO se migran automáticamente
   - Debes crearlos manualmente en Auth o re-crearlos

2. **Guardarecursos** ya funcionaban desde antes
   - Este fix solo agregó la misma funcionalidad a Coordinadores

3. **Administradores** siguen igual
   - Siempre han estado en Supabase Auth

4. **Contraseñas**:
   - PostgreSQL: Hash SHA-256
   - Supabase Auth: Hash bcrypt
   - Esto es normal, usa la misma contraseña en texto plano al crear

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu sistema estará **100% funcional** con:

✅ Administradores pueden hacer login  
✅ Coordinadores pueden hacer login  
✅ Guardarecursos pueden hacer login  
✅ Todos los usuarios se crean automáticamente en Supabase Auth  

---

**Última actualización**: Noviembre 2025  
**Versión**: v2.1 - Login Coordinadores Funcional  
**Estado**: ✅ Listo para producción
