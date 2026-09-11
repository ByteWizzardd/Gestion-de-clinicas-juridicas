import type { AuditoriaEvento, AuditOperacion } from '@/types/audit-events';
import type { AuditRecordType } from '@/types/audit';
import { logger } from '@/lib/utils/logger';

/**
 * Traduce un evento crudo de `auditoria_eventos` (entidad/operacion/
 * datos_nuevos/datos_anteriores/metadata) a la forma "plana" que espera
 * `AuditRecordCard.tsx` — escrito originalmente contra columnas de las
 * tablas por-entidad que existían antes del backend unificado.
 *
 * Único punto de mapeo: lo usan tanto `AuditGeneralView.tsx` (el feed
 * general) como `AuditDetailClient.tsx` (las páginas de detalle por
 * módulo: casos, catálogos, beneficiarios, acciones, equipos, reportes,
 * citas, solicitantes, usuarios) — antes cada uno tenía (o le faltaba) su
 * propia copia de esta lógica.
 */
export function mapUnifiedLogToAuditRecord(log: AuditoriaEvento): { record: any, type: AuditRecordType } | null {
    const e = log.entidad;
    const a = log.operacion;
    let type: AuditRecordType | null = null;

    let record: any = { ...(log.metadata || {}) };

    // Merge datos
    if (a === 'insercion' || a === 'generacion_reporte' || a === 'descarga_soporte' || a === 'inicio_sesion' || a === 'cierre_sesion' || a === 'intento_fallido') {
        record = { ...record, ...(log.datos_nuevos || {}) };
    } else if (a === 'eliminacion') {
        record = { ...record, ...(log.datos_anteriores || {}) };
    } else if (a === 'actualizacion') {
        const ant = log.datos_anteriores || {};
        const nue = log.datos_nuevos || {};

        // Merge all keys with _anterior and _nuevo suffixes
        const allKeys = new Set([...Object.keys(ant), ...Object.keys(nue)]);
        allKeys.forEach(k => {
            record[`${k}_anterior`] = (ant as any)[k];
            record[`${k}_nuevo`] = (nue as any)[k];
            // Also put raw keys in case some card parts rely on it
            if ((nue as any)[k] !== undefined) record[k] = (nue as any)[k];
            else record[k] = (ant as any)[k];
        });
    }

    // Mapeo de tipos
    if (e === 'sesion') {
        type = 'sesion';
    }
    else if (e === 'caso') {
        if (a === 'insercion') type = 'caso-creado';
        else if (a === 'actualizacion') type = 'caso-actualizado';
        else if (a === 'eliminacion') type = 'caso-eliminado';
    }
    else if (e === 'usuario') {
        if (a === 'insercion') type = 'usuario-creado';
        else if (a === 'actualizacion') type = 'usuario-actualizado-campos';
        else if (a === 'eliminacion') type = 'usuario-eliminado';
    }
    else if (e === 'estudiante') {
        type = 'estudiante-inscrito';
    }
    else if (e === 'profesor') {
        type = 'profesor-asignado';
    }
    else if (e === 'solicitante') {
        if (a === 'insercion') type = 'solicitante-creado';
        else if (a === 'actualizacion') type = 'solicitante-actualizado';
        else if (a === 'eliminacion') type = 'solicitante-eliminado';
    }
    else if (e === 'beneficiario') {
        if (a === 'insercion') type = 'beneficiario-creado';
        else if (a === 'actualizacion') type = 'beneficiario-actualizado';
        else if (a === 'eliminacion') type = 'beneficiario-eliminado';
    }
    else if (e === 'cita') {
        if (a === 'insercion') type = 'cita-creada';
        else if (a === 'actualizacion') type = 'cita-actualizada';
        else if (a === 'eliminacion') type = 'cita-eliminada';
    }
    else if (e === 'accion_ejecutores') {
        if (a === 'insercion') type = 'accion-creada';
        else if (a === 'actualizacion') type = 'accion-actualizada';
        else if (a === 'eliminacion') type = 'accion-eliminada';
    }
    else if (e === 'accion') {
        // Registro de la propia acción de seguimiento (tabla `acciones`,
        // vía trigger genérico) — distinto de accion_ejecutores. No tiene
        // tarjeta dedicada todavía; usa el fallback genérico de
        // AuditRecordCard en vez de perderse silenciosamente.
        type = 'accion-registro' as AuditRecordType;
    }
    else if (e === 'solicitante_artefactos') {
        // Cambios de artefactos domésticos del solicitante. Sin tarjeta
        // dedicada todavía; usa el fallback genérico.
        type = 'solicitante-artefactos' as AuditRecordType;
    }
    else if (e === 'soporte') {
        if (a === 'insercion') type = 'soporte-creado';
        else if (a === 'eliminacion') type = 'soporte';
        else if (a === 'descarga_soporte') type = 'soporte-descargado';
    }
    else if (e === 'reporte') {
        type = 'reporte-generado';
    }
    else if (e === 'equipo') {
        type = 'equipo-actualizado';
    }
    // Catálogos
    else {
        const technicalToPrefix: Record<string, string> = {
            'estado': 'estado',
            'municipio': 'municipio',
            'parroquia': 'parroquia',
            'nucleo': 'nucleo',
            'materia': 'materia',
            'semestre': 'semestre',
            'categoria': 'categoria',
            'subcategoria': 'subcategoria',
            'ambito_legal': 'ambito-legal',
            'nivel_educativo': 'nivel-educativo',
            'condicion_trabajo': 'condicion-trabajo',
            'condicion_actividad': 'condicion-actividad',
            'tipo_caracteristica': 'tipo-caracteristica',
            'caracteristica': 'caracteristica'
        };

        const feminineEntities = [
            'materia', 'parroquia', 'categoria', 'subcategoria',
            'condicion_trabajo', 'condicion_actividad', 'caracteristica'
        ];

        const prefix = technicalToPrefix[e];
        if (prefix) {
            const isFeminine = feminineEntities.includes(e);
            const suffix = {
                insert: isFeminine ? 'insertada' : 'insertado',
                update: isFeminine ? 'actualizada' : 'actualizado',
                delete: isFeminine ? 'eliminada' : 'eliminado'
            };

            if (a === 'insercion') type = `${prefix}-${suffix.insert}` as AuditRecordType;
            else if (a === 'actualizacion') type = `${prefix}-${suffix.update}` as AuditRecordType;
            else if (a === 'eliminacion') type = `${prefix}-${suffix.delete}` as AuditRecordType;
        }
    }

    if (record) {
        // Id del propio evento (para keys de lista) — nunca colisiona con una
        // columna de negocio real porque las tablas usan id_caso/id_estudiante/
        // etc., no una columna llamada `id` a secas.
        record.id ??= log.id;

        // auditoria_eventos solo tiene una fecha real (fecha_evento); las
        // tarjetas viejas fueron escritas contra columnas por-entidad de
        // las tablas originales (fecha_creacion, fecha_generacion,
        // fecha_registro, fecha_eliminacion, fecha_inicio...) — se
        // rellenan como fallback (solo si no vinieron ya del merge de
        // datos_nuevos/datos_anteriores) para que cada tarjeta encuentre
        // el nombre de campo que espera sin pisar datos reales — ej.
        // semestres.fecha_inicio es una columna de negocio real, no la
        // fecha del evento de auditoría.
        record.fecha = log.fecha_evento;
        record.fecha_actualizacion = log.fecha_evento;
        record.fecha_creacion ??= log.fecha_evento;
        record.fecha_eliminacion ??= log.fecha_evento;
        record.fecha_registro ??= log.fecha_evento;
        record.fecha_generacion ??= log.fecha_evento;
        record.fecha_inicio ??= log.fecha_evento;

        // Inyectar nombres de actor según la operación
        let actorSuffix = '';
        if (a === 'insercion' || a === 'inicio_sesion' || a === 'intento_fallido' || a === 'cierre_sesion') {
            actorSuffix = 'creo';
            if (e === 'soporte') actorSuffix = 'subio';
        } else if (a === 'actualizacion') {
            actorSuffix = 'actualizo';
            if (e === 'equipo') actorSuffix = 'modifico';
        } else if (a === 'eliminacion') {
            actorSuffix = 'elimino';
        } else if (a === 'descarga_soporte') {
            actorSuffix = 'descargo';
        } else if (a === 'generacion_reporte' || a === 'vista_previa_reporte') {
            actorSuffix = 'genero';
        }

        if (actorSuffix) {
            const idField = `id_usuario_${actorSuffix}`;
            const nameField = `nombre_completo_usuario_${actorSuffix}`;

            if (actorSuffix === 'descargo') {
                if (!record.cedula_descargo) record.cedula_descargo = log.id_usuario;
            } else {
                if (!record[idField]) record[idField] = log.id_usuario;
            }

            if (!record[nameField]) record[nameField] = log.nombre_completo_usuario;
        }

        // Para sesiones, inyectar nombre completo, cédula e IP directo
        // (la tarjeta de sesión espera cedula_usuario/ip_direccion, no
        // id_usuario/metadata.ip).
        if (e === 'sesion') {
            if (!record.nombre_completo_usuario_accion) {
                record.nombre_completo_usuario_accion = log.nombre_completo_usuario;
            }
            record.cedula_usuario = log.id_usuario;
            record.ip_direccion = log.metadata?.ip ?? null;
        }

        // Para reportes, la tarjeta compara record.operacion === 'vista_previa'
        // (valor legado); el enum real es 'vista_previa_reporte'.
        if (e === 'reporte') {
            record.operacion = (a as AuditOperacion) === 'vista_previa_reporte' ? 'vista_previa' : 'generacion';
        }

        // Para casos, la tarjeta espera cedula_solicitante/
        // nombre_completo_solicitante (no la columna cruda `cedula`), y
        // en eliminación el id va en `caso_eliminado`, no `id_caso`.
        if (e === 'caso') {
            record.cedula_solicitante = record.cedula;
            record.nombre_completo_solicitante = log.nombre_completo_solicitante || null;
            if (a === 'eliminacion') {
                record.caso_eliminado = record.id_caso;
            }
        }
    }

    if (!type) {
        logger.warn(`Tipo de auditoría desconocido: ${e} - ${a}`);
        return null;
    }

    return { record, type };
}
