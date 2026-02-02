INSERT INTO auditoria_descarga_soportes (
    num_soporte,
    id_caso,
    nombre_archivo,
    cedula_descargo,
    ip_direccion
) VALUES ($1, $2, $3, $4, $5)
RETURNING id, fecha_descarga;
