-- Actualizar datos de un beneficiario
-- Parámetros:
-- $1: id_caso
-- $2: num_beneficiario
-- $3: cedula (opcional)
-- $4: nombres
-- $5: apellidos
-- $6: fecha_nac
-- $7: sexo
-- $8: tipo_beneficiario
-- $9: parentesco

UPDATE beneficiarios
SET 
    cedula = $3,
    nombres = $4,
    apellidos = $5,
    fecha_nac = $6,
    sexo = $7,
    tipo_beneficiario = $8,
    parentesco = $9
WHERE id_caso = $1 AND num_beneficiario = $2
RETURNING *;
