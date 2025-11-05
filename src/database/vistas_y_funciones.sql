-- =====================================================
-- SISTEMA DE GESTIÓN DE GUARDARECURSOS - CONAP GUATEMALA
-- VISTAS Y FUNCIONES DE BASE DE DATOS
-- =====================================================
-- Este archivo contiene todas las vistas y funciones almacenadas
-- necesarias para el funcionamiento completo del sistema
-- =====================================================

-- =====================================================
-- SECCIÓN 1: VISTAS SQL
-- =====================================================

-- -----------------------------------------------------
-- VISTA 1: Dashboard - Estadísticas Generales
-- -----------------------------------------------------
-- Descripción: Proporciona estadísticas generales para el dashboard
-- Usada por: Dashboard.tsx
-- Retorna: Conteo de áreas, guardarecursos, actividades, etc.
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_dashboard AS
SELECT 
  (SELECT COUNT(*) FROM area_protegida WHERE estado = 1) as total_areas_activas,
  (SELECT COUNT(*) FROM usuario WHERE usuario_rol = 3 AND usuario_estado = 1) as total_guardarecursos_activos,
  (SELECT COUNT(*) FROM actividad WHERE actividad_estado = 2 AND DATE(actividad_fecha) = CURRENT_DATE) as actividades_hoy,
  (SELECT COUNT(*) FROM actividad WHERE actividad_estado = 1 AND actividad_fecha >= CURRENT_DATE) as actividades_programadas,
  (SELECT COUNT(*) FROM incidentes WHERE inc_estado = 1) as incidentes_abiertos,
  (SELECT COUNT(*) FROM hallazgo WHERE hallazgo_estado = 1) as hallazgos_pendientes,
  (SELECT COUNT(*) FROM equipo WHERE equipo_estado = 1) as equipos_disponibles,
  (SELECT COUNT(*) FROM equipo WHERE equipo_estado = 2) as equipos_asignados;


-- -----------------------------------------------------
-- VISTA 2: Guardarecursos - Lista Completa
-- -----------------------------------------------------
-- Descripción: Lista todos los guardarecursos con información detallada
-- Usada por: RegistroGuardarecursos.tsx
-- Retorna: Información completa de guardarecursos incluyendo área asignada
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_guardarecursos AS
SELECT 
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  u.usuario_dpi,
  u.usuario_telefono,
  u.usuario_correo,
  r.rol_nombre,
  a.area_id,
  a.area_nombre,
  a.area_departamento,
  d.depto_nombre,
  e.estado_id,
  e.estado_nombre,
  (SELECT COUNT(*) FROM equipo WHERE equipo_usuario = u.usuario_id) as total_equipos,
  (SELECT COUNT(*) FROM actividad WHERE actividad_usuario = u.usuario_id AND DATE(actividad_fecha) = CURRENT_DATE) as actividades_hoy
FROM usuario u
LEFT JOIN usuario_rol r ON u.usuario_rol = r.rol_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
LEFT JOIN departamento d ON a.area_departamento = d.depto_id
LEFT JOIN estado e ON u.usuario_estado = e.estado_id
WHERE u.usuario_rol = 3  -- Solo guardarecursos
ORDER BY u.usuario_apellido, u.usuario_nombre;


-- -----------------------------------------------------
-- VISTA 3: Áreas Protegidas - Información Completa
-- -----------------------------------------------------
-- Descripción: Lista de todas las áreas protegidas con detalles
-- Usada por: MapaAreasProtegidas.tsx, AsignacionZonas.tsx, Dashboard.tsx
-- Retorna: Información completa de áreas protegidas con estadísticas
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_areas_protegidas AS
SELECT 
  ap.area_id,
  ap.area_nombre,
  ap.area_descripcion,
  ap.area_extension,
  ap.latitud,
  ap.longitud,
  d.depto_id,
  d.depto_nombre,
  e.estado_id,
  e.estado_nombre,
  eco.eco_id,
  eco.eco_nombre,
  (SELECT COUNT(*) FROM usuario WHERE usuario_area = ap.area_id AND usuario_rol = 3 AND usuario_estado = 1) as total_guardarecursos,
  (SELECT COUNT(*) FROM actividad a 
   JOIN usuario u ON a.actividad_usuario = u.usuario_id 
   WHERE u.usuario_area = ap.area_id AND DATE(a.actividad_fecha) = CURRENT_DATE) as actividades_hoy,
  (SELECT COUNT(*) FROM incidentes i 
   JOIN usuario u ON i.inc_usuario = u.usuario_id 
   WHERE u.usuario_area = ap.area_id AND i.inc_estado = 1) as incidentes_abiertos
FROM area_protegida ap
LEFT JOIN departamento d ON ap.area_departamento = d.depto_id
LEFT JOIN estado e ON ap.estado = e.estado_id
LEFT JOIN ecosistema eco ON ap.area_ecosistema = eco.eco_id
ORDER BY ap.area_nombre;


-- -----------------------------------------------------
-- VISTA 4: Equipos - Control de Inventario
-- -----------------------------------------------------
-- Descripción: Lista de equipos con información del usuario asignado
-- Usada por: ControlEquipos.tsx
-- Retorna: Inventario completo de equipos con asignaciones
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_equipos AS
SELECT 
  eq.equipo_id,
  eq.equipo_nombre,
  eq.equipo_codigo,
  eq.marca,
  eq.modelo,
  eq.equipo_observaciones,
  est.estado_id,
  est.estado_nombre,
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo_usuario,
  a.area_id,
  a.area_nombre
FROM equipo eq
LEFT JOIN estado est ON eq.equipo_estado = est.estado_id
LEFT JOIN usuario u ON eq.equipo_usuario = u.usuario_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
ORDER BY eq.equipo_nombre;


-- -----------------------------------------------------
-- VISTA 5: Actividades - Planificación y Seguimiento
-- -----------------------------------------------------
-- Descripción: Lista de actividades con información completa
-- Usada por: PlanificacionActividades.tsx, RegistroDiario.tsx
-- Retorna: Actividades con detalles de usuario, tipo y estado
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_actividades AS
SELECT 
  act.actividad_id,
  act.actividad_codigo,
  act.actividad_nombre,
  act.actividad_descripcion,
  act.actividad_fecha,
  act.actividad_h_programada,
  act.actividad_h_inicio,
  act.actividad_h_fin,
  act.actividad_ubicacion,
  act.actividad_notas,
  t.tipo_id,
  t.tipo_nombre,
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo_usuario,
  a.area_id,
  a.area_nombre,
  est.estado_id,
  est.estado_nombre,
  (SELECT COUNT(*) FROM hallazgo WHERE hallazgo_actividad = act.actividad_id) as total_hallazgos,
  (SELECT COUNT(*) FROM fotografia WHERE foto_actividad = act.actividad_id) as total_fotografias,
  (SELECT COUNT(*) FROM ruta_geolocalizacion WHERE ruta_actividad = act.actividad_id) as total_puntos_ruta
FROM actividad act
LEFT JOIN tipo t ON act.actividad_tipo = t.tipo_id
LEFT JOIN usuario u ON act.actividad_usuario = u.usuario_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
LEFT JOIN estado est ON act.actividad_estado = est.estado_id
ORDER BY act.actividad_fecha DESC, act.actividad_h_inicio;


-- -----------------------------------------------------
-- VISTA 6: Evidencias Fotográficas
-- -----------------------------------------------------
-- Descripción: Lista de fotografías con contexto
-- Usada por: EvidenciasFotograficas.tsx
-- Retorna: Fotografías con información de actividad/hallazgo asociado
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_fotografias AS
SELECT 
  f.foto_id,
  f.foto_descripcion,
  f.foto_ruta,
  f.foto_fecha,
  f.latitud,
  f.longitud,
  act.actividad_id,
  act.actividad_nombre,
  act.actividad_codigo,
  h.hallazgos_id,
  h.hallazgo_titulo,
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo_usuario,
  a.area_id,
  a.area_nombre
FROM fotografia f
LEFT JOIN actividad act ON f.foto_actividad = act.actividad_id
LEFT JOIN hallazgo h ON f.foto_hallazgo = h.hallazgos_id
LEFT JOIN usuario u ON act.actividad_usuario = u.usuario_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
ORDER BY f.foto_fecha DESC;


-- -----------------------------------------------------
-- VISTA 7: Rutas de Geolocalización
-- -----------------------------------------------------
-- Descripción: Puntos de rutas con información de actividad
-- Usada por: GeolocalizacionRutas.tsx
-- Retorna: Puntos GPS de rutas registradas durante actividades
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_rutas_geolocalizacion AS
SELECT 
  rg.ruta_id,
  rg.ruta_actividad,
  act.actividad_nombre,
  act.actividad_codigo,
  act.actividad_fecha,
  ub.ubicacion_id,
  ub.ubicacion_latitud,
  ub.ubicacion_longitud,
  ub.ubicacion_fecha,
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo_usuario,
  a.area_id,
  a.area_nombre
FROM ruta_geolocalizacion rg
LEFT JOIN ubicacion ub ON rg.ruta_ubicacion = ub.ubicacion_id
LEFT JOIN actividad act ON rg.ruta_actividad = act.actividad_id
LEFT JOIN usuario u ON act.actividad_usuario = u.usuario_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
ORDER BY act.actividad_fecha DESC, ub.ubicacion_fecha;


-- -----------------------------------------------------
-- VISTA 8: Hallazgos - Reporte y Seguimiento
-- -----------------------------------------------------
-- Descripción: Lista de hallazgos con información completa
-- Usada por: ReporteHallazgos.tsx
-- Retorna: Hallazgos con detalles de actividad y seguimiento
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_hallazgos AS
SELECT 
  h.hallazgos_id,
  h.hallazgo_titulo,
  h.hallazgo_descripcion,
  h.latitud,
  h.longitud,
  cat.categoria_id,
  cat.categoria_nombre,
  est.estado_id,
  est.estado_nombre,
  act.actividad_id,
  act.actividad_nombre,
  act.actividad_codigo,
  act.actividad_fecha,
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo_usuario,
  a.area_id,
  a.area_nombre,
  (SELECT COUNT(*) FROM fotografia WHERE foto_hallazgo = h.hallazgos_id) as total_fotografias,
  (SELECT COUNT(*) FROM seguimiento WHERE seg_hallazgo = h.hallazgos_id) as total_seguimientos
FROM hallazgo h
LEFT JOIN categoria cat ON h.hallazgo_categoria = cat.categoria_id
LEFT JOIN estado est ON h.hallazgo_estado = est.estado_id
LEFT JOIN actividad act ON h.hallazgo_actividad = act.actividad_id
LEFT JOIN usuario u ON act.actividad_usuario = u.usuario_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
ORDER BY act.actividad_fecha DESC;


-- -----------------------------------------------------
-- VISTA 9: Incidentes con Visitantes
-- -----------------------------------------------------
-- Descripción: Lista de incidentes reportados
-- Usada por: RegistroIncidentes.tsx
-- Retorna: Incidentes con información completa
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_incidentes AS
SELECT 
  inc.inc_id,
  inc.inc_nombre,
  inc.inc_descripcion,
  inc.inc_involucrados,
  inc.observaciones,
  inc.latitud,
  inc.longitud,
  t.tipo_id,
  t.tipo_nombre,
  cat.categoria_id,
  cat.categoria_nombre,
  est.estado_id,
  est.estado_nombre,
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo_usuario,
  a.area_id,
  a.area_nombre,
  (SELECT COUNT(*) FROM seguimiento WHERE seg_incidente = inc.inc_id) as total_seguimientos
FROM incidentes inc
LEFT JOIN tipo t ON inc.inc_tipo = t.tipo_id
LEFT JOIN categoria cat ON inc.inc_categoria = cat.categoria_id
LEFT JOIN estado est ON inc.inc_estado = est.estado_id
LEFT JOIN usuario u ON inc.inc_usuario = u.usuario_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
ORDER BY inc.inc_id DESC;


-- -----------------------------------------------------
-- VISTA 10: Seguimiento de Cumplimiento
-- -----------------------------------------------------
-- Descripción: Seguimientos de incidentes y hallazgos
-- Usada por: SeguimientoCumplimiento.tsx
-- Retorna: Seguimientos con información de incidentes/hallazgos
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_seguimiento AS
SELECT 
  s.seg_id,
  s.seg_nombre,
  s.seg_descripcion,
  s.seg_fecha,
  inc.inc_id,
  inc.inc_nombre,
  inc.inc_estado as inc_estado_id,
  est_inc.estado_nombre as inc_estado_nombre,
  h.hallazgos_id,
  h.hallazgo_titulo,
  h.hallazgo_estado as hallazgo_estado_id,
  est_hall.estado_nombre as hallazgo_estado_nombre,
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo_usuario,
  a.area_id,
  a.area_nombre
FROM seguimiento s
LEFT JOIN incidentes inc ON s.seg_incidente = inc.inc_id
LEFT JOIN estado est_inc ON inc.inc_estado = est_inc.estado_id
LEFT JOIN hallazgo h ON s.seg_hallazgo = h.hallazgos_id
LEFT JOIN estado est_hall ON h.hallazgo_estado = est_hall.estado_id
LEFT JOIN usuario u ON s.seg_usuario = u.usuario_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
ORDER BY s.seg_fecha DESC;


-- -----------------------------------------------------
-- VISTA 11: Reportes Periódicos
-- -----------------------------------------------------
-- Descripción: Agregación de datos para reportes periódicos
-- Usada por: ReportesPeriodicos.tsx
-- Retorna: Estadísticas agrupadas por período y área
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_reportes_periodicos AS
SELECT 
  a.area_id,
  a.area_nombre,
  DATE_TRUNC('month', act.actividad_fecha) as periodo_mes,
  COUNT(DISTINCT act.actividad_id) as total_actividades,
  COUNT(DISTINCT CASE WHEN act.actividad_estado = 3 THEN act.actividad_id END) as actividades_completadas,
  COUNT(DISTINCT h.hallazgos_id) as total_hallazgos,
  COUNT(DISTINCT inc.inc_id) as total_incidentes,
  COUNT(DISTINCT f.foto_id) as total_fotografias,
  SUM(CASE WHEN act.actividad_h_fin IS NOT NULL AND act.actividad_h_inicio IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (act.actividad_h_fin - act.actividad_h_inicio))/3600 
      ELSE 0 END) as total_horas_campo
FROM area_protegida a
LEFT JOIN usuario u ON u.usuario_area = a.area_id
LEFT JOIN actividad act ON act.actividad_usuario = u.usuario_id
LEFT JOIN hallazgo h ON h.hallazgo_actividad = act.actividad_id
LEFT JOIN incidentes inc ON inc.inc_usuario = u.usuario_id
LEFT JOIN fotografia f ON f.foto_actividad = act.actividad_id
GROUP BY a.area_id, a.area_nombre, DATE_TRUNC('month', act.actividad_fecha)
ORDER BY periodo_mes DESC, a.area_nombre;


-- -----------------------------------------------------
-- VISTA 12: Usuarios y Roles - Gestión de Usuarios
-- -----------------------------------------------------
-- Descripción: Lista completa de usuarios del sistema
-- Usada por: GestionUsuarios.tsx
-- Retorna: Todos los usuarios con información de rol y área
-- -----------------------------------------------------
CREATE OR REPLACE VIEW vista_usuarios AS
SELECT 
  u.usuario_id,
  u.usuario_nombre,
  u.usuario_apellido,
  CONCAT(u.usuario_nombre, ' ', u.usuario_apellido) as nombre_completo,
  u.usuario_dpi,
  u.usuario_telefono,
  u.usuario_correo,
  r.rol_id,
  r.rol_nombre,
  a.area_id,
  a.area_nombre,
  d.depto_nombre,
  est.estado_id,
  est.estado_nombre,
  (SELECT COUNT(*) FROM equipo WHERE equipo_usuario = u.usuario_id) as total_equipos_asignados,
  (SELECT COUNT(*) FROM actividad WHERE actividad_usuario = u.usuario_id) as total_actividades_realizadas
FROM usuario u
LEFT JOIN usuario_rol r ON u.usuario_rol = r.rol_id
LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
LEFT JOIN departamento d ON a.area_departamento = d.depto_id
LEFT JOIN estado est ON u.usuario_estado = est.estado_id
ORDER BY r.rol_nombre, u.usuario_apellido, u.usuario_nombre;


-- =====================================================
-- SECCIÓN 2: FUNCIONES DE NEGOCIO
-- =====================================================

-- -----------------------------------------------------
-- FUNCIÓN 1: Login y Autenticación
-- -----------------------------------------------------
-- Descripción: Valida credenciales y retorna información del usuario
-- Usada por: Login.tsx
-- Parámetros: p_correo (email), p_contrasenia (password)
-- Retorna: JSON con datos del usuario si credenciales son válidas
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_login(
  p_correo VARCHAR,
  p_contrasenia VARCHAR
)
RETURNS TABLE (
  usuario_id INT,
  nombre VARCHAR,
  apellido VARCHAR,
  correo VARCHAR,
  rol_id INT,
  rol_nombre VARCHAR,
  area_id INT,
  area_nombre VARCHAR,
  estado_id INT,
  estado_nombre VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.usuario_id,
    u.usuario_nombre,
    u.usuario_apellido,
    u.usuario_correo,
    r.rol_id,
    r.rol_nombre,
    a.area_id,
    a.area_nombre,
    e.estado_id,
    e.estado_nombre
  FROM usuario u
  LEFT JOIN usuario_rol r ON u.usuario_rol = r.rol_id
  LEFT JOIN area_protegida a ON u.usuario_area = a.area_id
  LEFT JOIN estado e ON u.usuario_estado = e.estado_id
  WHERE u.usuario_correo = p_correo 
    AND u.usuario_contrasenia = p_contrasenia
    AND u.usuario_estado = 1;  -- Solo usuarios activos
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 2: Cambiar Contraseña
-- -----------------------------------------------------
-- Descripción: Cambia la contraseña de un usuario
-- Usada por: CambiarContrasena.tsx, CambiarContrasenaAdmin.tsx
-- Parámetros: p_usuario_id, p_contrasenia_actual, p_contrasenia_nueva
-- Retorna: BOOLEAN (true si se cambió exitosamente)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_cambiar_contrasena(
  p_usuario_id INT,
  p_contrasenia_actual VARCHAR,
  p_contrasenia_nueva VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_contrasenia_actual VARCHAR;
BEGIN
  -- Verificar contraseña actual
  SELECT usuario_contrasenia INTO v_contrasenia_actual
  FROM usuario
  WHERE usuario_id = p_usuario_id;
  
  IF v_contrasenia_actual = p_contrasenia_actual THEN
    -- Actualizar contraseña
    UPDATE usuario
    SET usuario_contrasenia = p_contrasenia_nueva
    WHERE usuario_id = p_usuario_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 3: Crear Guardarecurso
-- -----------------------------------------------------
-- Descripción: Crea un nuevo usuario con rol de guardarecurso
-- Usada por: RegistroGuardarecursos.tsx
-- Parámetros: Datos completos del guardarecurso
-- Retorna: ID del nuevo usuario creado
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_guardarecurso(
  p_nombre VARCHAR,
  p_apellido VARCHAR,
  p_dpi VARCHAR,
  p_telefono VARCHAR,
  p_correo VARCHAR,
  p_contrasenia VARCHAR,
  p_area_id INT
)
RETURNS INT AS $$
DECLARE
  v_nuevo_id INT;
BEGIN
  INSERT INTO usuario (
    usuario_nombre,
    usuario_apellido,
    usuario_dpi,
    usuario_telefono,
    usuario_correo,
    usuario_contrasenia,
    usuario_rol,
    usuario_area,
    usuario_estado
  ) VALUES (
    p_nombre,
    p_apellido,
    p_dpi,
    p_telefono,
    p_correo,
    p_contrasenia,
    3,  -- Rol Guardarecurso
    p_area_id,
    1   -- Estado Activo
  ) RETURNING usuario_id INTO v_nuevo_id;
  
  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 4: Actualizar Guardarecurso
-- -----------------------------------------------------
-- Descripción: Actualiza datos de un guardarecurso existente
-- Usada por: RegistroGuardarecursos.tsx
-- Parámetros: ID y datos a actualizar
-- Retorna: BOOLEAN (true si se actualizó exitosamente)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_guardarecurso(
  p_usuario_id INT,
  p_nombre VARCHAR,
  p_apellido VARCHAR,
  p_dpi VARCHAR,
  p_telefono VARCHAR,
  p_correo VARCHAR,
  p_area_id INT,
  p_estado INT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE usuario
  SET 
    usuario_nombre = p_nombre,
    usuario_apellido = p_apellido,
    usuario_dpi = p_dpi,
    usuario_telefono = p_telefono,
    usuario_correo = p_correo,
    usuario_area = p_area_id,
    usuario_estado = p_estado
  WHERE usuario_id = p_usuario_id
    AND usuario_rol = 3;  -- Solo guardarecursos
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 5: Asignar Zona a Guardarecurso
-- -----------------------------------------------------
-- Descripción: Asigna o reasigna área protegida a guardarecurso
-- Usada por: AsignacionZonas.tsx
-- Parámetros: p_usuario_id, p_area_id
-- Retorna: BOOLEAN (true si se asignó exitosamente)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_asignar_zona(
  p_usuario_id INT,
  p_area_id INT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE usuario
  SET usuario_area = p_area_id
  WHERE usuario_id = p_usuario_id
    AND usuario_rol = 3;  -- Solo guardarecursos
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 6: Crear Equipo
-- -----------------------------------------------------
-- Descripción: Registra un nuevo equipo en el inventario
-- Usada por: ControlEquipos.tsx
-- Parámetros: Datos del equipo
-- Retorna: ID del nuevo equipo creado
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_equipo(
  p_nombre VARCHAR,
  p_codigo VARCHAR,
  p_marca VARCHAR,
  p_modelo VARCHAR,
  p_observaciones VARCHAR,
  p_usuario_id INT
)
RETURNS INT AS $$
DECLARE
  v_nuevo_id INT;
BEGIN
  INSERT INTO equipo (
    equipo_nombre,
    equipo_codigo,
    equipo_estado,
    marca,
    modelo,
    equipo_usuario,
    equipo_observaciones
  ) VALUES (
    p_nombre,
    p_codigo,
    CASE WHEN p_usuario_id IS NULL THEN 1 ELSE 2 END,  -- 1=Disponible, 2=Asignado
    p_marca,
    p_modelo,
    p_usuario_id,
    p_observaciones
  ) RETURNING equipo_id INTO v_nuevo_id;
  
  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 7: Asignar Equipo a Usuario
-- -----------------------------------------------------
-- Descripción: Asigna un equipo a un guardarecurso
-- Usada por: ControlEquipos.tsx
-- Parámetros: p_equipo_id, p_usuario_id
-- Retorna: BOOLEAN (true si se asignó exitosamente)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_asignar_equipo(
  p_equipo_id INT,
  p_usuario_id INT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE equipo
  SET 
    equipo_usuario = p_usuario_id,
    equipo_estado = 2  -- Estado: Asignado
  WHERE equipo_id = p_equipo_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 8: Crear Actividad
-- -----------------------------------------------------
-- Descripción: Registra una nueva actividad programada
-- Usada por: PlanificacionActividades.tsx
-- Parámetros: Datos de la actividad
-- Retorna: ID de la nueva actividad creada
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_actividad(
  p_codigo VARCHAR,
  p_nombre VARCHAR,
  p_tipo_id INT,
  p_usuario_id INT,
  p_descripcion VARCHAR,
  p_fecha TIMESTAMP,
  p_hora_programada TIME,
  p_ubicacion VARCHAR
)
RETURNS BIGINT AS $$
DECLARE
  v_nuevo_id BIGINT;
BEGIN
  INSERT INTO actividad (
    actividad_id,
    actividad_codigo,
    actividad_nombre,
    actividad_tipo,
    actividad_usuario,
    actividad_descripcion,
    actividad_estado,
    actividad_fecha,
    actividad_h_programada,
    actividad_ubicacion,
    actividad_h_inicio,
    actividad_h_fin,
    actividad_notas
  ) VALUES (
    EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,  -- Timestamp en milisegundos como ID
    p_codigo,
    p_nombre,
    p_tipo_id,
    p_usuario_id,
    p_descripcion,
    1,  -- Estado: Programada
    p_fecha,
    p_hora_programada,
    p_ubicacion,
    '00:00:00',  -- Se actualizará al iniciar
    '00:00:00',  -- Se actualizará al finalizar
    ''
  ) RETURNING actividad_id INTO v_nuevo_id;
  
  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 9: Actualizar Estado de Actividad
-- -----------------------------------------------------
-- Descripción: Cambia el estado de una actividad y registra horas
-- Usada por: RegistroDiario.tsx
-- Parámetros: p_actividad_id, p_estado, p_hora_inicio, p_hora_fin, p_notas
-- Retorna: BOOLEAN (true si se actualizó exitosamente)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_estado_actividad(
  p_actividad_id BIGINT,
  p_estado INT,
  p_hora_inicio TIME DEFAULT NULL,
  p_hora_fin TIME DEFAULT NULL,
  p_notas VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE actividad
  SET 
    actividad_estado = p_estado,
    actividad_h_inicio = COALESCE(p_hora_inicio, actividad_h_inicio),
    actividad_h_fin = COALESCE(p_hora_fin, actividad_h_fin),
    actividad_notas = COALESCE(p_notas, actividad_notas)
  WHERE actividad_id = p_actividad_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 10: Registrar Hallazgo
-- -----------------------------------------------------
-- Descripción: Registra un hallazgo durante una actividad
-- Usada por: ReporteHallazgos.tsx, RegistroDiario.tsx
-- Parámetros: Datos del hallazgo
-- Retorna: ID del nuevo hallazgo creado
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_registrar_hallazgo(
  p_titulo VARCHAR,
  p_categoria_id INT,
  p_descripcion VARCHAR,
  p_latitud DOUBLE PRECISION,
  p_longitud DOUBLE PRECISION,
  p_actividad_id BIGINT
)
RETURNS INT AS $$
DECLARE
  v_nuevo_id INT;
BEGIN
  INSERT INTO hallazgo (
    hallazgo_titulo,
    hallazgo_categoria,
    hallazgo_descripcion,
    latitud,
    longitud,
    hallazgo_estado,
    hallazgo_actividad
  ) VALUES (
    p_titulo,
    p_categoria_id,
    p_descripcion,
    p_latitud,
    p_longitud,
    1,  -- Estado: Pendiente
    p_actividad_id
  ) RETURNING hallazgos_id INTO v_nuevo_id;
  
  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 11: Crear Incidente
-- -----------------------------------------------------
-- Descripción: Registra un incidente con visitantes
-- Usada por: RegistroIncidentes.tsx
-- Parámetros: Datos del incidente
-- Retorna: ID del nuevo incidente creado
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_incidente(
  p_nombre VARCHAR,
  p_tipo_id INT,
  p_descripcion VARCHAR,
  p_categoria_id INT,
  p_usuario_id INT,
  p_latitud DOUBLE PRECISION,
  p_longitud DOUBLE PRECISION,
  p_involucrados VARCHAR,
  p_observaciones VARCHAR
)
RETURNS BIGINT AS $$
DECLARE
  v_nuevo_id BIGINT;
BEGIN
  INSERT INTO incidentes (
    inc_id,
    inc_nombre,
    inc_tipo,
    inc_descripcion,
    inc_categoria,
    inc_usuario,
    latitud,
    longitud,
    inc_involucrados,
    observaciones,
    inc_estado
  ) VALUES (
    EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,  -- Timestamp en milisegundos como ID
    p_nombre,
    p_tipo_id,
    p_descripcion,
    p_categoria_id,
    p_usuario_id,
    p_latitud,
    p_longitud,
    p_involucrados,
    p_observaciones,
    1  -- Estado: Abierto
  ) RETURNING inc_id INTO v_nuevo_id;
  
  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 12: Crear Seguimiento
-- -----------------------------------------------------
-- Descripción: Registra seguimiento de incidente o hallazgo
-- Usada por: SeguimientoCumplimiento.tsx
-- Parámetros: Datos del seguimiento
-- Retorna: ID del nuevo seguimiento creado
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_seguimiento(
  p_nombre VARCHAR,
  p_incidente_id BIGINT DEFAULT NULL,
  p_hallazgo_id INT DEFAULT NULL,
  p_descripcion VARCHAR,
  p_usuario_id INT
)
RETURNS BIGINT AS $$
DECLARE
  v_nuevo_id BIGINT;
BEGIN
  INSERT INTO seguimiento (
    seg_id,
    seg_nombre,
    seg_incidente,
    seg_hallazgo,
    seg_descripcion,
    seg_fecha,
    seg_usuario
  ) VALUES (
    EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,  -- Timestamp en milisegundos como ID
    p_nombre,
    p_incidente_id,
    p_hallazgo_id,
    p_descripcion,
    NOW(),
    p_usuario_id
  ) RETURNING seg_id INTO v_nuevo_id;
  
  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 13: Guardar Punto de Ruta
-- -----------------------------------------------------
-- Descripción: Registra un punto GPS durante una actividad
-- Usada por: GeolocalizacionRutas.tsx, RegistroDiario.tsx
-- Parámetros: p_actividad_id, p_latitud, p_longitud
-- Retorna: ID del nuevo punto de ruta creado
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_guardar_punto_ruta(
  p_actividad_id BIGINT,
  p_latitud DOUBLE PRECISION,
  p_longitud DOUBLE PRECISION
)
RETURNS BIGINT AS $$
DECLARE
  v_ubicacion_id BIGINT;
  v_ruta_id BIGINT;
BEGIN
  -- Primero crear el punto de ubicación
  INSERT INTO ubicacion (
    ubicacion_latitud,
    ubicacion_longitud,
    ubicacion_fecha
  ) VALUES (
    p_latitud,
    p_longitud,
    NOW()
  ) RETURNING ubicacion_id INTO v_ubicacion_id;
  
  -- Luego asociarlo a la actividad
  INSERT INTO ruta_geolocalizacion (
    ruta_actividad,
    ruta_ubicacion
  ) VALUES (
    p_actividad_id,
    v_ubicacion_id
  ) RETURNING ruta_id INTO v_ruta_id;
  
  RETURN v_ruta_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 14: Guardar Fotografía
-- -----------------------------------------------------
-- Descripción: Registra una fotografía de actividad o hallazgo
-- Usada por: EvidenciasFotograficas.tsx
-- Parámetros: Datos de la fotografía
-- Retorna: ID de la nueva fotografía creada
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_guardar_fotografia(
  p_descripcion VARCHAR,
  p_latitud DOUBLE PRECISION,
  p_longitud DOUBLE PRECISION,
  p_ruta VARCHAR,
  p_actividad_id BIGINT DEFAULT NULL,
  p_hallazgo_id INT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_nuevo_id INT;
BEGIN
  INSERT INTO fotografia (
    foto_descripcion,
    latitud,
    longitud,
    foto_fecha,
    foto_ruta,
    foto_actividad,
    foto_hallazgo
  ) VALUES (
    p_descripcion,
    p_latitud,
    p_longitud,
    NOW(),
    p_ruta,
    p_actividad_id,
    p_hallazgo_id
  ) RETURNING foto_id INTO v_nuevo_id;
  
  RETURN v_nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 15: Actualizar Estado de Incidente
-- -----------------------------------------------------
-- Descripción: Cambia el estado de un incidente
-- Usada por: RegistroIncidentes.tsx, SeguimientoCumplimiento.tsx
-- Parámetros: p_incidente_id, p_estado_id
-- Retorna: BOOLEAN (true si se actualizó exitosamente)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_estado_incidente(
  p_incidente_id BIGINT,
  p_estado_id INT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE incidentes
  SET inc_estado = p_estado_id
  WHERE inc_id = p_incidente_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------
-- FUNCIÓN 16: Actualizar Estado de Hallazgo
-- -----------------------------------------------------
-- Descripción: Cambia el estado de un hallazgo
-- Usada por: ReporteHallazgos.tsx, SeguimientoCumplimiento.tsx
-- Parámetros: p_hallazgo_id, p_estado_id
-- Retorna: BOOLEAN (true si se actualizó exitosamente)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_estado_hallazgo(
  p_hallazgo_id INT,
  p_estado_id INT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE hallazgo
  SET hallazgo_estado = p_estado_id
  WHERE hallazgos_id = p_hallazgo_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuario_correo ON usuario(usuario_correo);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON usuario(usuario_rol);
CREATE INDEX IF NOT EXISTS idx_usuario_area ON usuario(usuario_area);
CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON actividad(actividad_fecha);
CREATE INDEX IF NOT EXISTS idx_actividad_usuario ON actividad(actividad_usuario);
CREATE INDEX IF NOT EXISTS idx_actividad_estado ON actividad(actividad_estado);
CREATE INDEX IF NOT EXISTS idx_incidentes_usuario ON incidentes(inc_usuario);
CREATE INDEX IF NOT EXISTS idx_incidentes_estado ON incidentes(inc_estado);
CREATE INDEX IF NOT EXISTS idx_hallazgo_actividad ON hallazgo(hallazgo_actividad);
CREATE INDEX IF NOT EXISTS idx_hallazgo_estado ON hallazgo(hallazgo_estado);
CREATE INDEX IF NOT EXISTS idx_equipo_usuario ON equipo(equipo_usuario);
CREATE INDEX IF NOT EXISTS idx_seguimiento_incidente ON seguimiento(seg_incidente);
CREATE INDEX IF NOT EXISTS idx_seguimiento_hallazgo ON seguimiento(seg_hallazgo);

-- =====================================================
-- FIN DEL ARCHIVO
-- =====================================================
