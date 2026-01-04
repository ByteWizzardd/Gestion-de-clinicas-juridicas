-- Verificar si el trigger existe y está activo
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'solicitantes'
  AND trigger_name = 'trigger_auditoria_actualizacion_solicitante';

-- Verificar si la función del trigger existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'trigger_auditoria_actualizacion_solicitante';
