-- =====================================================
-- VISTAS SQL PARA EL DASHBOARD - CONAP
-- =====================================================
-- Archivo minimalista con SOLO las vistas necesarias
-- para que funcione el Dashboard de la aplicación
-- =====================================================

-- =====================================================
-- VISTA 1: Estadísticas del Dashboard
-- =====================================================
-- Proporciona los 4 números que se muestran en las tarjetas:
-- - Áreas Protegidas (4)
-- - Guardarecursos (14)
-- - Actividades (31)
-- - Actividades Hoy (2)
-- =====================================================

CREATE OR REPLACE VIEW vista_dashboard AS
SELECT 
  -- Total de áreas protegidas activas
  (SELECT COUNT(*) 
   FROM area 
   WHERE ar_estado = (SELECT std_id FROM estado WHERE std_nombre = 'Activo')
  ) AS total_areas_activas,
  
  -- Total de guardarecursos activos
  (SELECT COUNT(*) 
   FROM usuario 
   WHERE usr_rol = (SELECT rl_id FROM rol WHERE rl_nombre = 'Guardarecurso')
     AND usr_estado = (SELECT std_id FROM estado WHERE std_nombre = 'Activo')
  ) AS total_guardarecursos_activos,
  
  -- Total de todas las actividades
  (SELECT COUNT(*) 
   FROM actividad
  ) AS total_actividades,
  
  -- Actividades para HOY
  (SELECT COUNT(*) 
   FROM actividad 
   WHERE DATE(act_fechah_programcion) = CURRENT_DATE
  ) AS actividades_hoy;


-- =====================================================
-- VISTA 2: Áreas Protegidas para el Mapa
-- =====================================================
-- Proporciona la lista de áreas protegidas ACTIVAS para el mapa
-- Solo incluye datos básicos: ubicación, nombre y datos del detalle
-- Filtra por estado 'Activo' directamente en la vista
-- =====================================================

CREATE OR REPLACE VIEW vista_areas_mapa_dashboard AS
SELECT 
  -- Datos básicos del área (para el mapa)
  a.ar_id AS area_id,
  a.ar_nombre AS area_nombre,
  a.ar_latitud AS latitud,
  a.ar_longitud AS longitud,
  
  -- Datos para el modal de detalle
  a.ar_descripcion AS area_descripcion,
  a.ar_extension AS area_extension,
  d.dpt_nombre AS depto_nombre,
  eco.ecs_nombre AS eco_nombre
     
FROM area a
LEFT JOIN departamento d ON a.ar_depto = d.dpt_id
LEFT JOIN estado e ON a.ar_estado = e.std_id
LEFT JOIN ecosistema eco ON a.ar_eco = eco.ecs_id
WHERE e.std_nombre = 'Activo'
ORDER BY a.ar_nombre;


-- =====================================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- =====================================================
-- Estos índices aceleran las consultas de las vistas

CREATE INDEX IF NOT EXISTS idx_area_estado ON area(ar_estado);
CREATE INDEX IF NOT EXISTS idx_usuario_rol_estado ON usuario(usr_rol, usr_estado);
CREATE INDEX IF NOT EXISTS idx_usuario_area ON usuario(usr_area);
CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON actividad(act_fechah_programcion);
CREATE INDEX IF NOT EXISTS idx_actividad_usuario ON actividad(act_usuario);


-- =====================================================
-- QUERIES DE PRUEBA
-- =====================================================
-- Descomenta estas líneas para probar que todo funciona

-- Probar estadísticas del dashboard
-- SELECT * FROM vista_dashboard;

-- Probar áreas para el mapa (ya vienen solo las activas)
-- SELECT * FROM vista_areas_mapa_dashboard;
