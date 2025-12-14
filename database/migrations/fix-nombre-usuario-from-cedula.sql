-- Migración: Corregir nombre_usuario que está usando la cédula
-- Fecha: 2025-01-XX
-- Descripción: Actualiza los usuarios que tienen la cédula como nombre_usuario
-- extrayendo el nombre_usuario correcto desde su correo electrónico UCAB

-- Actualizar usuarios que tienen la cédula como nombre_usuario
-- Extraer el nombre_usuario desde el correo (maneja @ucab.edu.ve y @est.ucab.edu.ve)
UPDATE usuarios u
SET nombre_usuario = SPLIT_PART(c.correo_electronico, '@', 1)
FROM clientes c
WHERE u.cedula = c.cedula
  AND (c.correo_electronico LIKE '%@ucab.edu.ve' OR c.correo_electronico LIKE '%@est.ucab.edu.ve')
  AND u.nombre_usuario = u.cedula; -- Solo actualizar si el nombre_usuario es igual a la cédula

-- Verificar que no queden usuarios con nombre_usuario igual a su cédula
-- (excepto si realmente su correo es solo la cédula, lo cual sería un caso muy raro)
DO $$
DECLARE
    usuarios_con_cedula INTEGER;
BEGIN
    SELECT COUNT(*) INTO usuarios_con_cedula
    FROM usuarios u
    JOIN clientes c ON u.cedula = c.cedula
    WHERE u.nombre_usuario = u.cedula
      AND (c.correo_electronico LIKE '%@ucab.edu.ve' OR c.correo_electronico LIKE '%@est.ucab.edu.ve');
    
    IF usuarios_con_cedula > 0 THEN
        RAISE WARNING 'Aún hay % usuario(s) con nombre_usuario igual a su cédula. Verifica que tengan correo UCAB válido.', usuarios_con_cedula;
    END IF;
END $$;

