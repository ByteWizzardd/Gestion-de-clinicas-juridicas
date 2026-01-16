-- Obtener el conteo total de actualizaciones de casos (incluyendo cambios de estatus)
SELECT 
    (SELECT COUNT(*) FROM public.auditoria_actualizacion_casos) +
    (SELECT COUNT(*) FROM public.cambio_estatus WHERE num_cambio > 1) 
AS total;

