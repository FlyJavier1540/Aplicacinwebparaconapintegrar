-- ============================================
-- 🔧 SCRIPT DE CORRECCIÓN DE RLS
-- CONAP - Sistema de Gestión de Guardarecursos
-- Noviembre 2024 - Versión 1.0
-- ============================================
--
-- ⚠️ IMPORTANTE: Este script soluciona el problema de
-- métricas que muestran 0 aunque hay datos en la BD.
--
-- ============================================
-- 
-- Este script resuelve el problema de Row Level Security (RLS)
-- que impide que las métricas y el dashboard muestren datos reales.
--
-- INSTRUCCIONES:
-- 1. Abre Supabase Dashboard → SQL Editor
-- 2. Copia y pega este script completo
-- 3. Presiona RUN o Ctrl+Enter
-- 4. Espera a que termine la ejecución
-- 5. Refresca tu aplicación web
-- ============================================

-- PASO 1: Deshabilitar RLS en las tablas principales
-- ============================================

ALTER TABLE actividad DISABLE ROW LEVEL SECURITY;
ALTER TABLE hallazgo DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE area DISABLE ROW LEVEL SECURITY;
ALTER TABLE estado DISABLE ROW LEVEL SECURITY;
ALTER TABLE rol DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_actividad DISABLE ROW LEVEL SECURITY;
ALTER TABLE departamento DISABLE ROW LEVEL SECURITY;
ALTER TABLE ecosistema DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 2: Verificar que RLS está deshabilitado
-- ============================================

SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS Deshabilitado'
    ELSE '❌ RLS Habilitado (PROBLEMA)'
  END as estado
FROM pg_tables 
WHERE tablename IN (
  'actividad', 
  'hallazgo', 
  'usuario', 
  'area',
  'estado',
  'rol',
  'tipo_actividad',
  'departamento',
  'ecosistema'
)
ORDER BY tablename;

-- ============================================
-- PASO 3: Verificar datos existentes
-- ============================================

-- Contar guardarecursos activos
SELECT 
  'Guardarecursos Activos' as tabla,
  COUNT(*) as cantidad
FROM usuario u
JOIN rol r ON u.usr_rol = r.rl_id
JOIN estado e ON u.usr_estado = e.std_id
WHERE r.rl_nombre = 'Guardarecurso'
  AND e.std_nombre = 'Activo'

UNION ALL

-- Contar actividades totales
SELECT 
  'Actividades Totales' as tabla,
  COUNT(*) as cantidad
FROM actividad

UNION ALL

-- Contar actividades completadas
SELECT 
  'Actividades Completadas' as tabla,
  COUNT(*) as cantidad
FROM actividad a
JOIN estado e ON a.act_estado = e.std_id
WHERE e.std_nombre = 'Completada'

UNION ALL

-- Contar patrullajes
SELECT 
  'Patrullajes Totales' as tabla,
  COUNT(*) as cantidad
FROM actividad a
JOIN tipo_actividad t ON a.act_tipo_actividad = t.tpact_id
WHERE t.tpact_nombre = 'Patrullaje'

UNION ALL

-- Contar hallazgos
SELECT 
  'Hallazgos Totales' as tabla,
  COUNT(*) as cantidad
FROM hallazgo

UNION ALL

-- Contar áreas protegidas activas
SELECT 
  'Áreas Protegidas Activas' as tabla,
  COUNT(*) as cantidad
FROM area a
JOIN estado e ON a.ar_estado = e.std_id
WHERE e.std_nombre = 'Activo';

-- ============================================
-- PASO 4: Verificar datos por guardarecurso
-- ============================================

SELECT 
  u.usr_id as id,
  u.usr_nombre || ' ' || u.usr_apellido as guardarecurso,
  a_area.ar_nombre as area_asignada,
  (
    SELECT COUNT(*) 
    FROM actividad a 
    WHERE a.act_usuario = u.usr_id
  ) as total_actividades,
  (
    SELECT COUNT(*) 
    FROM actividad a 
    JOIN estado e ON a.act_estado = e.std_id
    WHERE a.act_usuario = u.usr_id 
      AND e.std_nombre = 'Completada'
  ) as actividades_completadas,
  (
    SELECT COUNT(*) 
    FROM actividad a 
    JOIN tipo_actividad t ON a.act_tipo_actividad = t.tpact_id
    WHERE a.act_usuario = u.usr_id 
      AND t.tpact_nombre = 'Patrullaje'
  ) as total_patrullajes,
  (
    SELECT COUNT(*) 
    FROM actividad a 
    JOIN tipo_actividad t ON a.act_tipo_actividad = t.tpact_id
    JOIN estado e ON a.act_estado = e.std_id
    WHERE a.act_usuario = u.usr_id 
      AND t.tpact_nombre = 'Patrullaje'
      AND e.std_nombre = 'Completada'
  ) as patrullajes_completados,
  (
    SELECT COUNT(*) 
    FROM hallazgo h 
    WHERE h.hlz_usuario = u.usr_id
  ) as total_hallazgos
FROM usuario u
JOIN rol r ON u.usr_rol = r.rl_id
JOIN estado e ON u.usr_estado = e.std_id
LEFT JOIN area a_area ON u.usr_area = a_area.ar_id
WHERE r.rl_nombre = 'Guardarecurso'
  AND e.std_nombre = 'Activo'
ORDER BY u.usr_nombre, u.usr_apellido;

-- ============================================
-- ✅ COMPLETADO
-- ============================================
--
-- Si todos los comandos se ejecutaron correctamente:
-- 1. Deberías ver "✅ RLS Deshabilitado" en todas las tablas
-- 2. Deberías ver las cantidades reales de datos
-- 3. Deberías ver el desglose por guardarecurso
--
-- Ahora refresca tu aplicación web y verifica:
-- ✓ Dashboard muestra las cantidades correctas
-- ✓ Seguimiento de Cumplimiento muestra las métricas reales
-- ✓ Los logs del servidor muestran datos correctos
--
-- Si aún tienes problemas, revisa:
-- - /FIX_RLS_ACTIVIDAD.md
-- - /METRICAS_SEGUIMIENTO_DETALLE.md
-- ============================================
