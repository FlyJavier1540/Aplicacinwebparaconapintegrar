-- 🔍 Consultas SQL Necesarias para Ajustar el Mapeo
-- Por favor ejecuta estas consultas y envíame los resultados

-- ==========================================
-- 1. TIPOS DE ACTIVIDAD
-- ==========================================
SELECT 
  tp_id,
  tp_nombre
FROM public.tipo
ORDER BY tp_id;

-- ==========================================
-- 2. ESTADOS
-- ==========================================
SELECT 
  std_id,
  std_nombre
FROM public.estado
ORDER BY std_id;

-- ==========================================
-- 3. (OPCIONAL) Verificar datos de actividades
-- ==========================================
SELECT 
  a.act_id,
  a.act_codigo,
  a.act_tipo,
  t.tp_nombre AS tipo_nombre,
  a.act_estado,
  e.std_nombre AS estado_nombre,
  a.act_usuario,
  u.usr_nombre,
  u.usr_apellido,
  a.act_fechah_programacion
FROM public.actividad a
LEFT JOIN public.tipo t ON a.act_tipo = t.tp_id
LEFT JOIN public.estado e ON a.act_estado = e.std_id
LEFT JOIN public.usuario u ON a.act_usuario = u.usr_id
WHERE a.act_estado = 8  -- Solo completadas
  AND EXTRACT(YEAR FROM a.act_fechah_programacion) = 2025
ORDER BY a.act_id
LIMIT 10;

-- ==========================================
-- 4. (OPCIONAL) Verificar roles de usuarios
-- ==========================================
SELECT 
  rl_id,
  rl_nombre
FROM public.rol
ORDER BY rl_id;
