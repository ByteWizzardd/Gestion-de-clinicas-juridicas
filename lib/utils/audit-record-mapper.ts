import type { AuditoriaEvento, AuditOperacion } from '@/types/audit-events';
import type { AuditRecordType } from '@/types/audit';
import { logger } from '@/lib/utils/logger';

/**
 * Columnas de la PK de cada entidad, en el mismo orden con el que el trigger
 * genérico arma id_entidad (CREATE TRIGGER trg_audit_* ... fn_auditoria_generica
 * ('<entidad>', '<col1>,<col2>...') en schema.sql), o con el que lo arma el
 * INSERT manual correspondiente. En una actualización el diff solo trae las
 * columnas que cambiaron, así que la PK casi nunca viene en datos_* y hay que
 * recuperarla de id_entidad.
 *
 * Las PK de una sola columna no se parten por '-': cédulas ("V-123") y
 * términos ("2026-25") llevan guion.
 */
const PK_COLUMNAS: Record<string, string[]> = {
    caso: ['id_caso'],
    cambio_estatus: ['num_cambio', 'id_caso'],
    cita: ['num_cita', 'id_caso'],
    // num_cita-id_caso-id_usuario: la cédula lleva guion, así que solo se
    // recuperan las dos primeras partes.
    atencion_cita: ['num_cita', 'id_caso'],
    beneficiario: ['num_beneficiario', 'id_caso'],
    soporte: ['num_soporte', 'id_caso'],
    accion: ['num_accion', 'id_caso'],
    accion_ejecutores: ['num_accion', 'id_caso'],
    equipo: ['id_caso'],
    usuario: ['cedula'],
    solicitante: ['cedula'],
    solicitante_perfil: ['cedula'],
    vivienda: ['cedula_solicitante'],
    familia_y_hogar: ['cedula_solicitante'],
    estado: ['id_estado'],
    municipio: ['id_estado', 'num_municipio'],
    parroquia: ['id_estado', 'num_municipio', 'num_parroquia'],
    nucleo: ['id_nucleo'],
    materia: ['id_materia'],
    categoria: ['num_categoria', 'id_materia'],
    subcategoria: ['num_subcategoria', 'num_categoria', 'id_materia'],
    ambito_legal: ['id_materia', 'num_categoria', 'num_subcategoria', 'num_ambito_legal'],
    semestre: ['term'],
    nivel_educativo: ['id_nivel_educativo'],
    condicion_trabajo: ['id_trabajo'],
    condicion_actividad: ['id_actividad'],
    tipo_caracteristica: ['id_tipo'],
    caracteristica: ['id_tipo_caracteristica', 'num_caracteristica'],
};

/**
 * Columna con el id "propio" de cada catálogo (el que se muestra como "ID:"
 * en la tarjeta). En catálogos con clave compuesta es la última parte, no la
 * del padre: el ID de un municipio es num_municipio, no id_estado.
 */
const ID_CATALOGO: Record<string, string> = {
    estado: 'id_estado',
    municipio: 'num_municipio',
    parroquia: 'num_parroquia',
    nucleo: 'id_nucleo',
    materia: 'id_materia',
    categoria: 'num_categoria',
    subcategoria: 'num_subcategoria',
    ambito_legal: 'num_ambito_legal',
    semestre: 'term',
    nivel_educativo: 'id_nivel_educativo',
    condicion_trabajo: 'id_trabajo',
    condicion_actividad: 'id_actividad',
    tipo_caracteristica: 'id_tipo',
    caracteristica: 'num_caracteristica',
};

/** Columna con el nombre visible de cada catálogo. */
const NOMBRE_CATALOGO: Record<string, string> = {
    estado: 'nombre_estado',
    municipio: 'nombre_municipio',
    parroquia: 'nombre_parroquia',
    nucleo: 'nombre_nucleo',
    materia: 'nombre_materia',
    categoria: 'nombre_categoria',
    subcategoria: 'nombre_subcategoria',
    ambito_legal: 'nombre_ambito_legal',
    nivel_educativo: 'descripcion',
    condicion_trabajo: 'nombre_trabajo',
    condicion_actividad: 'nombre_actividad',
    tipo_caracteristica: 'nombre_tipo_caracteristica',
    caracteristica: 'descripcion',
};

/**
 * Las tarjetas muestran la hora literal del string (hora de Caracas, como la
 * guardan las columnas TIMESTAMP sin zona). Una columna TIMESTAMPTZ
 * (soportes.fecha_consignacion) llega en el JSON con zona explícita
 * ("...T20:33:00+00:00"): se pasa a hora de pared de Caracas.
 */
const CON_ZONA = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}(:?\d{2})?)$/;
const horaCaracas = (valor: string): string => {
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(fecha).map(x => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
};

const nombreCompleto = (nombres?: string | null, apellidos?: string | null) =>
    `${nombres ?? ''} ${apellidos ?? ''}`.trim() || null;

/** Persona dentro de una lista guardada en el evento (ejecutores, miembros del equipo). */
type PersonaEvento = {
    cedula?: string;
    nombres?: string | null;
    apellidos?: string | null;
    nombre?: string;
    nombre_completo?: string;
    [clave: string]: unknown;
};

/** Lista guardada bajo `clave` en datos_anteriores/datos_nuevos, si existe. */
const listaDe = <T>(datos: Record<string, unknown> | null, clave: string): T[] | undefined => {
    const valor = datos?.[clave];
    return Array.isArray(valor) ? (valor as T[]) : undefined;
};

/**
 * Traduce un evento crudo de `auditoria_eventos` (entidad/operacion/
 * datos_nuevos/datos_anteriores/metadata) a la forma "plana" que espera
 * `AuditRecordCard.tsx` — escrito originalmente contra columnas de las
 * tablas por-entidad que existían antes del backend unificado.
 *
 * Hay dos formas de datos que conviven en la tabla y ambas se cubren aquí:
 * - Eventos migrados (metadata.migrado_de): id_entidad vacío, los ids y a
 *   veces nombres ya resueltos vienen en metadata o en datos_*.
 * - Eventos actuales del trigger genérico: to_jsonb(fila) completo en
 *   inserción/eliminación; solo las columnas que cambiaron en actualización.
 *
 * Único punto de mapeo: lo usan `AuditGeneralView.tsx` (el feed general),
 * `AuditDetailClient.tsx` (las páginas de detalle por módulo) y
 * `audit-search.ts` (el filtro de búsqueda por contenido visible).
 */
export function mapUnifiedLogToAuditRecord(log: AuditoriaEvento): { record: any, type: AuditRecordType } | null {
    const e = log.entidad;
    const a = log.operacion;
    let type: AuditRecordType | null = null;

    let record: any = { ...(log.metadata || {}) };

    // Merge datos
    if (a === 'insercion' || a === 'generacion_reporte' || a === 'vista_previa_reporte' || a === 'descarga_soporte' || a === 'inicio_sesion' || a === 'cierre_sesion' || a === 'intento_fallido') {
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
            // Also put raw keys in case some card parts rely on it. Un null del
            // diff no pisa un valor que ya venía (p. ej. los ids que los eventos
            // migrados guardan en metadata con datos_anteriores en null).
            const valor = (nue as any)[k] !== undefined ? (nue as any)[k] : (ant as any)[k];
            if (valor != null || record[k] === undefined) record[k] = valor;
        });
    }

    for (const [k, v] of Object.entries(record)) {
        if (k.startsWith('fecha') && typeof v === 'string' && CON_ZONA.test(v)) record[k] = horaCaracas(v);
    }

    // Nombres resueltos en SQL con las mismas claves que usa la tarjeta
    // (ubicación de un núcleo, materia/categoría de una subcategoría...).
    for (const [k, v] of Object.entries(log.nombres_resueltos || {})) {
        record[k] ??= v;
    }

    // Partes de la PK que no vienen en el diff (ver PK_COLUMNAS).
    const pk = PK_COLUMNAS[e];
    if (pk && log.id_entidad != null) {
        const partes = pk.length === 1 ? [String(log.id_entidad)] : String(log.id_entidad).split('-');
        pk.forEach((col, i) => {
            const valor = partes[i];
            if (valor === undefined || valor === '') return;
            record[col] ??= /^(id_|num_)/.test(col) ? Number(valor) : valor;
        });
    }

    // Inscripciones: id_entidad es "term-cedula" y ambos llevan guion
    // ("2026-25-V-123"), así que no entran en PK_COLUMNAS.
    if ((e === 'estudiante' || e === 'profesor') && log.id_entidad != null) {
        const inscripcion = /^([^-]+-[^-]+)-(.+)$/.exec(String(log.id_entidad));
        if (inscripcion) {
            record.term ??= inscripcion[1];
            record[e === 'estudiante' ? 'cedula_estudiante' : 'cedula_profesor'] ??= inscripcion[2];
        }
    }

    // Personas referenciadas por cédula (resueltas en SQL).
    const persona = (cedula: unknown) =>
        cedula != null ? log.usuarios_ref?.[String(cedula)] ?? null : null;

    // Quien registró la fila (citas, beneficiarios...): varias tarjetas lo
    // muestran con nombre_completo_usuario_registro.
    if (record.id_usuario_registro != null) {
        const r0 = persona(record.id_usuario_registro);
        record.nombre_completo_usuario_registro ??= nombreCompleto(r0?.nombres, r0?.apellidos);
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
    else if (e === 'cambio_estatus') {
        // Fila nueva de cambio_estatus: la tarjeta de caso actualizado tiene un
        // modo propio para esto (tipo_cambio = 'cambio_estatus'). El estatus
        // anterior se resuelve en SQL (nombres_resueltos.estatus_anterior).
        type = 'caso-actualizado';
        record.tipo_cambio = 'cambio_estatus';
        record.estatus_nuevo ??= record.nuevo_estatus;
    }
    else if (e === 'usuario') {
        if (a === 'insercion') type = 'usuario-creado';
        else if (a === 'actualizacion') type = 'usuario-actualizado-campos';
        else if (a === 'eliminacion') type = 'usuario-eliminado';

        // Fila de estudiantes/profesores escrita en la misma transacción.
        const insc = log.inscripcion_extra;
        if (insc && a === 'insercion') {
            for (const k of ['term', 'tipo_estudiante', 'tipo_profesor', 'nrc']) {
                record[k] ??= insc.nuevos?.[k];
            }
        } else if (insc && a === 'actualizacion') {
            for (const k of ['term', 'tipo_estudiante', 'tipo_profesor', 'nrc', 'habilitado']) {
                if (insc.nuevos && k in insc.nuevos) {
                    record[`${k}_anterior`] ??= insc.anteriores?.[k];
                    record[`${k}_nuevo`] ??= insc.nuevos[k];
                }
            }
            record.es_inscripcion = true;
        }

        if (a === 'actualizacion') {
            // La tarjeta identifica al usuario con ci_usuario (así venía en los
            // eventos migrados, en metadata); en los del trigger es la PK.
            record.ci_usuario ??= record.cedula;
            const u = persona(record.ci_usuario);
            record.nombre_completo_usuario ??= nombreCompleto(u?.nombres, u?.apellidos)
                ?? nombreCompleto(record.nombres_nuevo ?? record.nombres_anterior, record.apellidos_nuevo ?? record.apellidos_anterior);
        } else if (a === 'eliminacion') {
            // Convención propia de la tarjeta: usuario_eliminado + *_usuario_eliminado
            // para el afectado, eliminado_por + *_eliminado_por para el actor.
            record.usuario_eliminado ??= record.cedula;
            record.nombres_usuario_eliminado ??= record.nombres ?? record.nombres_historico;
            record.apellidos_usuario_eliminado ??= record.apellidos ?? record.apellidos_historico;
            record.eliminado_por ??= log.id_usuario;
            record.nombre_completo_eliminado_por ??= log.nombre_completo_usuario;
        }
    }
    else if (e === 'estudiante' || e === 'profesor') {
        // Inscripción en un semestre: el evento trae la cédula; nombre, correo,
        // usuario y tipo vienen de la tabla usuarios. Las ediciones sueltas
        // (sin evento de usuario gemelo) se muestran como actualización del
        // usuario, con el cambio de tipo/NRC/habilitado de la inscripción.
        type = a === 'actualizacion'
            ? 'usuario-actualizado-campos'
            : (e === 'estudiante' ? 'estudiante-inscrito' : 'profesor-asignado');
        record.cedula ??= e === 'estudiante' ? record.cedula_estudiante : record.cedula_profesor;
        if (a === 'actualizacion') {
            record.ci_usuario ??= record.cedula;
            record.es_inscripcion = true;
        }
        const u = persona(record.cedula);
        if (u && a === 'actualizacion') {
            record.nombre_completo_usuario ??= nombreCompleto(u.nombres, u.apellidos);
        } else if (u) {
            record.nombres ??= u.nombres;
            record.apellidos ??= u.apellidos;
            record.correo_electronico ??= u.correo_electronico;
            record.nombre_usuario ??= u.nombre_usuario;
            record.tipo_usuario ??= u.tipo_usuario;
            record.telefono_celular ??= u.telefono_celular;
        }
    }
    else if (e === 'solicitante' || e === 'solicitante_perfil' || e === 'vivienda' || e === 'familia_y_hogar' || e === 'solicitante_artefactos') {
        // 'solicitante_perfil' es el evento completo de una edición (lo inserta
        // solicitantes.service.ts). 'vivienda'/'familia_y_hogar' solo llegan
        // aquí cuando no tienen un evento de solicitante gemelo (ver
        // get-unified-logs.sql); se muestran como actualización del solicitante.
        if (e === 'solicitante' && a === 'insercion') type = 'solicitante-creado';
        else if (e === 'solicitante' && a === 'eliminacion') type = 'solicitante-eliminado';
        else type = 'solicitante-actualizado';

        if (a === 'insercion' && e !== 'solicitante') {
            // Satélite suelto recién creado: sin "antes", todo es "nuevo".
            for (const [k, v] of Object.entries(log.datos_nuevos || {})) {
                record[`${k}_anterior`] ??= null;
                record[`${k}_nuevo`] ??= v;
            }
        } else if (a === 'eliminacion' && e !== 'solicitante') {
            for (const [k, v] of Object.entries(log.datos_anteriores || {})) {
                record[`${k}_anterior`] ??= v;
                record[`${k}_nuevo`] ??= null;
            }
        }

        if (e === 'solicitante_artefactos') {
            // Eventos migrados: lista de { artefacto, estado: nuevo|eliminado|sin_cambio }.
            const lista = listaDe<{ artefacto: string; estado: string }>(log.datos_nuevos, 'artefactos') ?? [];
            record.artefactos_domesticos_anteriores = lista.filter(x => x.estado !== 'nuevo').map(x => x.artefacto).join(', ');
            record.artefactos_domesticos_nuevos = lista.filter(x => x.estado !== 'eliminado').map(x => x.artefacto).join(', ');
        } else if (e === 'solicitante_perfil') {
            record.artefactos_domesticos_anteriores ??= record.artefactos_domesticos_anterior;
            record.artefactos_domesticos_nuevos ??= record.artefactos_domesticos_nuevo;
        }

        if (a === 'insercion' && e === 'solicitante') {
            // Nombres de las FKs propias (resueltos en SQL como *_nuevo).
            record.nombre_estado ??= log.solicitante_estado_nuevo;
            record.nombre_municipio ??= log.solicitante_municipio_nuevo;
            record.nombre_parroquia ??= log.solicitante_parroquia_nuevo;
            record.nivel_educativo ??= log.nivel_educativo_nuevo;
            record.condicion_trabajo ??= log.condicion_trabajo_nuevo;
            record.condicion_actividad ??= log.condicion_actividad_nuevo;
        } else if (a === 'eliminacion' && e === 'solicitante') {
            // Datos de vivienda y familia/hogar borrados en la misma transacción.
            for (const [k, v] of Object.entries(log.solicitante_extra || {})) {
                record[k] ??= v;
            }
            // La tarjeta de eliminación usa su propia convención.
            record.nombres_solicitante_eliminado ??= record.nombres;
            record.apellidos_solicitante_eliminado ??= record.apellidos;
            record.solicitante_eliminado ??= record.cedula;
            record.eliminado_por ??= log.id_usuario;
            record.estado ??= log.solicitante_estado_anterior;
            record.municipio ??= log.solicitante_municipio_anterior;
            record.parroquia ??= log.solicitante_parroquia_anterior;
            record.nivel_educativo ??= log.nivel_educativo_anterior;
            record.condicion_trabajo ??= log.condicion_trabajo_anterior;
        } else {
            // Actualización: la cédula (PK) no viene en el diff.
            record.cedula_solicitante ??= record.cedula ?? record.cedula_solicitante_nuevo;
            // Nombre completo en un solo campo: el diff solo trae nombres/
            // apellidos si cambiaron; si no, se usa el vigente resuelto en SQL.
            record.nombres_solicitante ??= log.nombre_completo_solicitante
                ?? nombreCompleto(record.nombres_nuevo ?? record.nombres, record.apellidos_nuevo ?? record.apellidos);
            // Nombres resueltos de las 6 FKs propias (nivel educativo,
            // condición de trabajo/actividad, estado/municipio/parroquia).
            if (log.nivel_educativo_anterior != null) record.nivel_educativo_anterior = log.nivel_educativo_anterior;
            if (log.nivel_educativo_nuevo != null) record.nivel_educativo_nuevo = log.nivel_educativo_nuevo;
            if (log.condicion_trabajo_anterior != null) record.condicion_trabajo_anterior = log.condicion_trabajo_anterior;
            if (log.condicion_trabajo_nuevo != null) record.condicion_trabajo_nuevo = log.condicion_trabajo_nuevo;
            if (log.condicion_actividad_anterior != null) record.condicion_actividad_anterior = log.condicion_actividad_anterior;
            if (log.condicion_actividad_nuevo != null) record.condicion_actividad_nuevo = log.condicion_actividad_nuevo;
            if (log.solicitante_estado_anterior != null) record.estado_anterior = log.solicitante_estado_anterior;
            if (log.solicitante_estado_nuevo != null) record.estado_nuevo = log.solicitante_estado_nuevo;
            if (log.solicitante_municipio_anterior != null) record.municipio_anterior = log.solicitante_municipio_anterior;
            if (log.solicitante_municipio_nuevo != null) record.municipio_nuevo = log.solicitante_municipio_nuevo;
            if (log.solicitante_parroquia_anterior != null) record.parroquia_anterior = log.solicitante_parroquia_anterior;
            if (log.solicitante_parroquia_nuevo != null) record.parroquia_nuevo = log.solicitante_parroquia_nuevo;
        }
    }
    else if (e === 'beneficiario') {
        if (a === 'insercion') type = 'beneficiario-creado';
        else if (a === 'actualizacion') type = 'beneficiario-actualizado';
        else if (a === 'eliminacion') type = 'beneficiario-eliminado';

        // La columna real es fecha_nac; la tarjeta usa fecha_nacimiento.
        record.fecha_nacimiento ??= record.fecha_nac;
        record.fecha_nacimiento_anterior ??= record.fecha_nac_anterior;
        record.fecha_nacimiento_nuevo ??= record.fecha_nac_nuevo;
        // Actor de la inscripción: la tarjeta lo busca en id_usuario_registro
        // (columna de la fila); los eventos migrados no la traen.
        if (a === 'insercion') record.id_usuario_registro ??= log.id_usuario;
    }
    else if (e === 'cita' || e === 'atencion_cita') {
        // 'atencion_cita' (tabla atienden) solo llega suelta cuando cambiaron
        // únicamente las personas que atienden: se muestra como cita actualizada.
        if (e === 'atencion_cita') type = 'cita-actualizada';
        else if (a === 'insercion') type = 'cita-creada';
        else if (a === 'actualizacion') type = 'cita-actualizada';
        else if (a === 'eliminacion') type = 'cita-eliminada';

        const at = log.atenciones_evento;
        if (at) {
            const comoAtendieron = (lista: Array<{ cedula: string; nombre: string }>) =>
                lista.map(p => ({ id_usuario: p.cedula, nombre_completo: p.nombre }));
            if (type === 'cita-creada') {
                record.usuarios_atendieron ??= comoAtendieron(at.nuevos);
            } else if (type === 'cita-eliminada') {
                record.usuarios_atendieron ??= comoAtendieron(at.anteriores);
            } else {
                // La tarjeta compara las cédulas ordenadas como texto y lista
                // los nombres de antes y después.
                record.atenciones_anterior ??= at.anteriores.map(p => p.cedula).sort().join(',');
                record.atenciones_nuevo ??= at.nuevos.map(p => p.cedula).sort().join(',');
                record.usuarios_atenciones_anterior ??= at.anteriores;
                record.usuarios_atenciones_nuevo ??= at.nuevos;
                record.usuarios_atendieron ??= comoAtendieron(at.nuevos);
            }
        }
    }
    else if (e === 'accion' || e === 'accion_ejecutores') {
        // 'accion' (trigger genérico sobre `acciones`) trae detalle/comentario;
        // sus ejecutores llegan fusionados desde el SQL en log.ejecutores_evento.
        // 'accion_ejecutores' solo llega suelto cuando cambiaron únicamente los
        // ejecutores (ver get-unified-logs.sql).
        if (a === 'insercion') type = 'accion-creada';
        else if (a === 'actualizacion') type = 'accion-actualizada';
        else if (a === 'eliminacion') type = 'accion-eliminada';

        const conNombre = (lista: PersonaEvento[] | null | undefined) => Array.isArray(lista)
            ? lista.map(ej => ({
                ...ej,
                nombre: ej.nombre ?? (nombreCompleto(ej.nombres, ej.apellidos) || ej.cedula),
            }))
            : undefined;

        const ejecutoresAnteriores = e === 'accion'
            ? log.ejecutores_evento?.anteriores as PersonaEvento[] | null | undefined
            : listaDe<PersonaEvento>(log.datos_anteriores, 'ejecutores');
        const ejecutoresNuevos = e === 'accion'
            ? log.ejecutores_evento?.nuevos as PersonaEvento[] | null | undefined
            : listaDe<PersonaEvento>(log.datos_nuevos, 'ejecutores');

        if (a === 'actualizacion') {
            record.ejecutores_anterior = conNombre(ejecutoresAnteriores);
            record.ejecutores_nuevo = conNombre(ejecutoresNuevos);
        } else if (a === 'insercion') {
            record.ejecutores = conNombre(ejecutoresNuevos) ?? null;
        } else if (a === 'eliminacion') {
            record.ejecutores = conNombre(ejecutoresAnteriores) ?? conNombre(record.ejecutores) ?? null;
        }

        // Motivo de eliminación: puede venir en la metadata del propio evento,
        // en la del evento gemelo de ejecutores, o (datos migrados) en el diff.
        record.motivo ??= log.metadata?.motivo ?? log.ejecutores_evento?.metadata?.motivo;

        // La tarjeta de eliminación usa su propia convención para el actor
        // (eliminado_por / nombre_completo_eliminado_por).
        if (a === 'eliminacion') {
            record.eliminado_por ??= log.id_usuario;
            record.nombre_completo_eliminado_por ??= log.nombre_completo_usuario;
        }
    }
    else if (e === 'soporte') {
        if (a === 'insercion') type = 'soporte-creado';
        else if (a === 'eliminacion') type = 'soporte';
        else if (a === 'descarga_soporte') type = 'soporte-descargado';

        const u = persona(record.id_usuario_subio);
        record.nombre_completo_usuario_subio ??= nombreCompleto(u?.nombres, u?.apellidos);
        if (a === 'descarga_soporte') {
            record.fecha_descarga ??= log.fecha_evento;
            record.ip_direccion ??= log.metadata?.ip ?? null;
        }
    }
    else if (e === 'reporte') {
        type = 'reporte-generado';
        // insert.sql mezcla los filtros sueltos dentro de datos_nuevos junto a
        // tipo_reporte/formato/cedula_solicitante; la tarjeta los espera
        // agrupados en filtros_aplicados.
        if (!record.filtros_aplicados) {
            const { tipo_reporte, formato, cedula_solicitante, ...filtros } = (log.datos_nuevos || {}) as Record<string, unknown>;
            if (Object.keys(filtros).length > 0) record.filtros_aplicados = filtros;
        }
    }
    else if (e === 'equipo') {
        type = 'equipo-actualizado';
        // El evento guarda { miembros: [...] } en datos_anteriores/datos_nuevos;
        // el merge genérico lo deja como miembros_anterior/miembros_nuevo, pero
        // la tarjeta espera miembros_anteriores/miembros_nuevos, con
        // nombre_completo en vez de nombres/apellidos por separado.
        const conNombreCompleto = (lista: PersonaEvento[] | undefined) => (lista ?? []).map(m => ({
            ...m,
            nombre_completo: m.nombre_completo ?? (nombreCompleto(m.nombres, m.apellidos) || m.cedula),
        }));
        record.miembros_anteriores = conNombreCompleto(listaDe<PersonaEvento>(log.datos_anteriores, 'miembros'));
        record.miembros_nuevos = conNombreCompleto(listaDe<PersonaEvento>(log.datos_nuevos, 'miembros'));
    }
    else if (e === 'caso_semestre') {
        if (a === 'insercion') type = 'caso-semestre-agregado';
        else if (a === 'eliminacion') type = 'caso-semestre-eliminado';
        if (log.id_entidad != null) {
            // "id_caso-term", y el term también lleva guion ("2026-25").
            const [idCaso, ...termParts] = String(log.id_entidad).split('-');
            record.id_caso ??= Number(idCaso);
            record.term ??= termParts.join('-');
        }
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

            // ID propio del catálogo; con ?? y no con || porque hay ids 0
            // reales ("No trabaja", "Buscando trabajo").
            record.id_catalogo = record[ID_CATALOGO[e]] ?? null;

            // Si el nombre no cambió (habilitar/deshabilitar, mover de padre), el
            // diff no lo trae: la tarjeta lo titula con <nombre>_nuevo. Se usa el
            // nombre que tenía en ese momento (resuelto en SQL), igual antes y
            // después para que no aparezca como cambio.
            const columnaNombre = NOMBRE_CATALOGO[e];
            if (a === 'actualizacion' && columnaNombre && log.nombres_resueltos?.nombre_catalogo != null) {
                record[`${columnaNombre}_nuevo`] ??= log.nombres_resueltos.nombre_catalogo;
                record[`${columnaNombre}_anterior`] ??= log.nombres_resueltos.nombre_catalogo;
                record[columnaNombre] ??= log.nombres_resueltos.nombre_catalogo;
            }
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
        // Se muestran como actualización de su entidad principal aunque la
        // fila se haya insertado/borrado (ver entidad_vista en filtro-eventos.sql).
        if (['cambio_estatus', 'atencion_cita', 'vivienda', 'familia_y_hogar'].includes(e)) {
            actorSuffix = 'actualizo';
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

        // Alias genéricos del nombre del actor: varias tarjetas de este
        // archivo se escribieron cada una con su propia convención
        // (usuario_nombre_completo, nombre_completo_usuario_accion, en vez
        // de nombre_completo_usuario_<sufijo>) — sin esto, esas tarjetas
        // mostraban la cédula del actor en vez de su nombre.
        record.usuario_nombre_completo ??= log.nombre_completo_usuario;
        record.nombre_completo_usuario_accion ??= log.nombre_completo_usuario;

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
            // Los eventos migrados traen cedula_solicitante y caso_eliminado
            // en vez de cedula/id_caso.
            record.cedula_solicitante = record.cedula ?? record.cedula_solicitante;
            record.id_caso ??= record.caso_eliminado;
            record.nombre_completo_solicitante = log.nombre_completo_solicitante || null;
            if (a === 'eliminacion') {
                record.caso_eliminado ??= record.id_caso;
                record.eliminado_por ??= log.id_usuario;
            }
            // Nombres resueltos de núcleo/materia/categoría/subcategoría/
            // ámbito legal/solicitante para el diff de 'caso-actualizado'
            // (si no, la tarjeta cae a mostrar el id crudo o "N/A").
            if (a === 'actualizacion') {
                if (log.nombre_nucleo_anterior != null) record.nombre_nucleo_anterior = log.nombre_nucleo_anterior;
                if (log.nombre_nucleo_nuevo != null) record.nombre_nucleo_nuevo = log.nombre_nucleo_nuevo;
                if (log.nombre_materia_anterior != null) record.nombre_materia_anterior = log.nombre_materia_anterior;
                if (log.nombre_materia_nuevo != null) record.nombre_materia_nuevo = log.nombre_materia_nuevo;
                if (log.nombre_categoria_anterior != null) record.nombre_categoria_anterior = log.nombre_categoria_anterior;
                if (log.nombre_categoria_nuevo != null) record.nombre_categoria_nuevo = log.nombre_categoria_nuevo;
                if (log.nombre_subcategoria_anterior != null) record.nombre_subcategoria_anterior = log.nombre_subcategoria_anterior;
                if (log.nombre_subcategoria_nuevo != null) record.nombre_subcategoria_nuevo = log.nombre_subcategoria_nuevo;
                if (log.nombre_ambito_legal_anterior != null) record.nombre_ambito_legal_anterior = log.nombre_ambito_legal_anterior;
                if (log.nombre_ambito_legal_nuevo != null) record.nombre_ambito_legal_nuevo = log.nombre_ambito_legal_nuevo;

                // El diff de "Solicitante" (r.cedula_solicitante_anterior/
                // _nuevo + nombre_solicitante_anterior/_nuevo) es distinto del
                // cedula_solicitante singular de arriba: solo aplica cuando
                // cambió la cédula del caso en sí.
                if (record.cedula_anterior !== undefined || record.cedula_nuevo !== undefined) {
                    record.cedula_solicitante_anterior = record.cedula_anterior;
                    record.cedula_solicitante_nuevo = record.cedula_nuevo;
                }
                if (record.cedula_solicitante_anterior !== undefined || record.cedula_solicitante_nuevo !== undefined) {
                    record.nombre_solicitante_anterior ??= log.nombre_solicitante_anterior || null;
                    record.nombre_solicitante_nuevo ??= log.nombre_solicitante_nuevo || null;
                }
            }
        }

        // Nombre del catálogo "padre" (un solo valor, no _anterior/_nuevo)
        // para las tarjetas de categoría/subcategoría/ámbito legal/
        // característica/municipio/parroquia — sin esto la tarjeta omite el
        // paréntesis con el contexto (ej. "(Materia Civil)") en silencio.
        if (e === 'categoria' && log.nombre_materia != null) {
            record.nombre_materia = log.nombre_materia;
        } else if (e === 'subcategoria' && log.nombre_categoria != null) {
            record.nombre_categoria = log.nombre_categoria;
        } else if (e === 'ambito_legal' && log.nombre_subcategoria != null) {
            record.nombre_subcategoria = log.nombre_subcategoria;
        } else if (e === 'caracteristica' && log.nombre_tipo_caracteristica != null) {
            record.nombre_tipo_caracteristica = log.nombre_tipo_caracteristica;
        } else if (e === 'municipio' && log.nombre_estado != null) {
            record.nombre_estado = log.nombre_estado;
        } else if (e === 'parroquia') {
            if (log.nombre_municipio != null) record.nombre_municipio = log.nombre_municipio;
            if (log.nombre_estado_parroquia != null) record.nombre_estado = log.nombre_estado_parroquia;
        }
    }

    if (!type) {
        logger.warn(`Tipo de auditoría desconocido: ${e} - ${a}`);
        return null;
    }

    return { record, type };
}
