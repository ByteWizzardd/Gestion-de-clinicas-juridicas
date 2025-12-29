-- Buscar en beneficiarios, solicitantes y usuarios por cédula (búsqueda parcial)
-- Parámetro: $1 = cédula a buscar (puede ser parcial)

SELECT DISTINCT ON (cedula)
    cedula,
    nombres,
    apellidos,
    fecha_nacimiento,
    sexo,
    nombre_completo
FROM (
    -- Beneficiarios
    SELECT 
        b.cedula,
        b.nombres,
        b.apellidos,
        b.fecha_nac AS fecha_nacimiento,
        b.sexo,
        b.nombres || ' ' || b.apellidos AS nombre_completo
    FROM beneficiarios b
    WHERE b.cedula IS NOT NULL AND b.cedula LIKE '%' || $1 || '%'

    UNION ALL

    -- Solicitantes
    SELECT 
        s.cedula,
        s.nombres,
        s.apellidos,
        s.fecha_nacimiento,
        s.sexo,
        s.nombres || ' ' || s.apellidos AS nombre_completo
    FROM solicitantes s
    WHERE s.cedula LIKE '%' || $1 || '%'

    UNION ALL

    -- Usuarios
    SELECT 
        u.cedula,
        u.nombres,
        u.apellidos,
        NULL AS fecha_nacimiento, -- Usuarios no tienen fecha_nac en el esquema actual
        NULL AS sexo, -- Usuarios no tienen sexo en el esquema actual
        u.nombres || ' ' || u.apellidos AS nombre_completo
    FROM usuarios u
    WHERE u.cedula LIKE '%' || $1 || '%'
) AS personas
ORDER BY cedula
LIMIT 10;

