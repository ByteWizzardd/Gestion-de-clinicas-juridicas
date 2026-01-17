import { pool } from '../pool';

// Tipo para miembro de equipo en auditoría
export interface MiembroEquipoAudit {
    tipo: 'estudiante' | 'profesor';
    cedula: string;
    nombres: string | null;
    apellidos: string | null;
    nombre_completo: string | null;
    term: string | null;
}

// Tipo para registro de auditoría de actualización de equipo
export interface AuditoriaActualizacionEquipoRecord {
    id: number;
    id_caso: number;
    id_usuario_modifico: string;
    fecha: string;
    nombres_usuario_modifico: string | null;
    apellidos_usuario_modifico: string | null;
    nombre_completo_usuario_modifico: string | null;
    tramite_caso: string | null;
    nombre_nucleo: string | null;
    nombre_completo_solicitante: string | null;
    miembros_anteriores: MiembroEquipoAudit[];
    miembros_nuevos: MiembroEquipoAudit[];
}

// Query base sin cláusula WHERE ni ORDER BY
const baseQuery = `
SELECT 
    ae.id,
    ae.id_caso,
    ae.id_usuario_modifico,
    ae.fecha_actualizacion AS fecha,
    u.nombres AS nombres_usuario_modifico,
    u.apellidos AS apellidos_usuario_modifico,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_modifico,
    c.tramite AS tramite_caso,
    n.nombre_nucleo,
    CONCAT(s.nombres, ' ', s.apellidos) AS nombre_completo_solicitante,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'tipo', ant.tipo,
            'cedula', ant.cedula,
            'nombres', ant.nombres,
            'apellidos', ant.apellidos,
            'nombre_completo', CONCAT(ant.nombres, ' ', ant.apellidos),
            'term', ant.term
        )), '[]'::json)
        FROM auditoria_actualizacion_equipo_anterior ant
        WHERE ant.id_auditoria_actualizacion = ae.id
    ) AS miembros_anteriores,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'tipo', nue.tipo,
            'cedula', nue.cedula,
            'nombres', nue.nombres,
            'apellidos', nue.apellidos,
            'nombre_completo', CONCAT(nue.nombres, ' ', nue.apellidos),
            'term', nue.term
        )), '[]'::json)
        FROM auditoria_actualizacion_equipo_nuevo nue
        WHERE nue.id_auditoria_actualizacion = ae.id
    ) AS miembros_nuevos
FROM auditoria_actualizacion_equipo ae
LEFT JOIN usuarios u ON ae.id_usuario_modifico = u.cedula
LEFT JOIN casos c ON ae.id_caso = c.id_caso
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN solicitantes s ON c.cedula = s.cedula
`;

// Función helper para procesar resultados
const processRows = (rows: any[]): AuditoriaActualizacionEquipoRecord[] => {
    return rows.map((row) => ({
        ...row,
        miembros_anteriores: typeof row.miembros_anteriores === 'string'
            ? JSON.parse(row.miembros_anteriores)
            : row.miembros_anteriores || [],
        miembros_nuevos: typeof row.miembros_nuevos === 'string'
            ? JSON.parse(row.miembros_nuevos)
            : row.miembros_nuevos || [],
    }));
};

/**
 * Obtiene todos los registros de auditoría de actualización de equipo
 */
export async function getAll(): Promise<AuditoriaActualizacionEquipoRecord[]> {
    const query = `${baseQuery} ORDER BY ae.fecha_actualizacion DESC`;
    const result = await pool.query(query);
    return processRows(result.rows);
}

/**
 * Obtiene solo los registros de CREACIÓN de equipo (cuando no había miembros anteriores)
 */
export async function getAllCreated(): Promise<AuditoriaActualizacionEquipoRecord[]> {
    const query = `
        ${baseQuery}
        WHERE NOT EXISTS (
            SELECT 1 FROM auditoria_actualizacion_equipo_anterior ant 
            WHERE ant.id_auditoria_actualizacion = ae.id
        )
        ORDER BY ae.fecha_actualizacion DESC
    `;
    const result = await pool.query(query);
    return processRows(result.rows);
}

/**
 * Obtiene solo los registros de ACTUALIZACIÓN de equipo (cuando sí había miembros anteriores)
 */
export async function getAllUpdated(): Promise<AuditoriaActualizacionEquipoRecord[]> {
    const query = `
        ${baseQuery}
        WHERE EXISTS (
            SELECT 1 FROM auditoria_actualizacion_equipo_anterior ant 
            WHERE ant.id_auditoria_actualizacion = ae.id
        )
        ORDER BY ae.fecha_actualizacion DESC
    `;
    const result = await pool.query(query);
    return processRows(result.rows);
}

/**
 * Obtiene el conteo de registros de auditoría de actualización de equipo
 */
export async function getCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM auditoria_actualizacion_equipo');
    return parseInt(result.rows[0].count, 10);
}

/**
 * Obtiene registros de auditoría de actualización de equipo por caso
 */
export async function getByCaso(idCaso: number): Promise<AuditoriaActualizacionEquipoRecord[]> {
    const query = `${baseQuery} WHERE ae.id_caso = $1 ORDER BY ae.fecha_actualizacion DESC`;
    const result = await pool.query(query, [idCaso]);
    return processRows(result.rows);
}
