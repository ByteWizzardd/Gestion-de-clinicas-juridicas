-- Insertar un nuevo beneficiario asociado a un caso
-- Parámetros:
-- $1: id_caso
-- $2: cedula (opcional)
-- $3: nombres
-- $4: apellidos
-- $5: fecha_nac
-- $6: sexo
-- $7: tipo_beneficiario
-- $8: parentesco
-- $9: id_usuario_registro

INSERT INTO beneficiarios (
    num_beneficiario,
    id_caso,
    cedula,
    nombres,
    apellidos,
    fecha_nac,
    sexo,
    tipo_beneficiario,
    parentesco,
    id_usuario_registro
)
VALUES (
    COALESCE((SELECT MAX(num_beneficiario) FROM beneficiarios WHERE id_caso = $1), 0) + 1,
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    $9
)
RETURNING *;

