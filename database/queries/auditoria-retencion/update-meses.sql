-- Cambia el plazo de retención de una clase.
-- El CHECK auditoria_retencion_meses_check impide bajar de meses_minimo y
-- auditoria_retencion_tope_check impide plazos absurdos; el trigger
-- trg_audit_auditoria_retencion deja el cambio auditado.
-- $1 = clase, $2 = meses, $3 = cédula del coordinador que lo cambia
UPDATE auditoria_retencion
SET meses_retencion    = $2::int,
    id_usuario_modifica = $3::varchar,
    fecha_modificacion  = (now() AT TIME ZONE 'America/Caracas')
WHERE clase = $1::varchar
RETURNING clase, meses_retencion, meses_minimo;
