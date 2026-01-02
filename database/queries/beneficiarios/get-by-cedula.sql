-- Obtener persona completa por cédula (búsqueda exacta en beneficiarios, solicitantes y usuarios)
-- Parámetro: $1 = cédula exacta
SELECT DISTINCT ON (cedula)
    cedula,
    nombres,
    apellidos,
    fecha_nacimiento,
    sexo,
    nombre_completo,
    correo_electronico,
    telefono_celular
FROM (
    -- Beneficiarios
    SELECT 
        b.cedula,
        b.nombres,
        b.apellidos,
        b.fecha_nac AS fecha_nacimiento,
        b.sexo,
        b.nombres || ' ' || b.apellidos AS nombre_completo,
        NULL AS correo_electronico,
        NULL AS telefono_celular
    FROM beneficiarios b
    WHERE b.cedula = $1

    UNION ALL

    -- Solicitantes
    SELECT 
        s.cedula,
        s.nombres,
        s.apellidos,
        s.fecha_nacimiento,
        s.sexo,
        s.nombres || ' ' || s.apellidos AS nombre_completo,
        s.correo_electronico,
        s.telefono_celular
    FROM solicitantes s
    WHERE s.cedula = $1

    UNION ALL

    -- Usuarios
    SELECT 
        u.cedula,
        u.nombres,
        u.apellidos,
        NULL AS fecha_nacimiento,
        NULL AS sexo,
        u.nombres || ' ' || u.apellidos AS nombre_completo,
        u.correo_electronico,
        u.telefono_celular
    FROM usuarios u
    WHERE u.cedula = $1
) AS personas
LIMIT 1;

