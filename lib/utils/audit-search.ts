/**
 * Extrae el texto buscable visible de un registro de auditoría.
 * Para registros de ACTUALIZACIÓN: incluye campos de identidad/contexto + solo campos que realmente cambiaron.
 * Para registros de CREACIÓN/ELIMINACIÓN: incluye todos los campos relevantes.
 * Esto replica la lógica de lo que se muestra visualmente en las cards expandidas.
 */

type AnyRecord = Record<string, any>;

/**
 * Compara dos valores considerando cadenas vacías como equivalentes a null/undefined.
 * También maneja booleanos comparándolos como strings.
 */
function areValuesEffectivelyEqual(v1: any, v2: any): boolean {
    const normalize = (v: any) => {
        if (v === null || v === undefined || v === '') return null;
        return String(v).trim().toLowerCase();
    };
    return normalize(v1) === normalize(v2);
}

/**
 * Convierte un valor a texto buscable adecuado.
 * Para booleanos, devuelve "sí" o "no".
 */
function valueToSearchText(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return value ? 'sí' : 'no';
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.map(item => {
                if (typeof item === 'object' && item !== null) {
                    // Para arrays de objetos como ejecutores, miembros, etc.
                    return Object.values(item).filter(v => v != null && v !== '').map(String).join(' ');
                }
                return String(item);
            }).join(' ');
        }
        // Para objetos planos, serializar valores
        return Object.values(value).filter(v => v != null && v !== '').map(String).join(' ');
    }
    return String(value);
}

/**
 * Detecta pares de campos anterior/nuevo con variantes de nomenclatura:
 *   - campo_anterior / campo_nuevo
 *   - campo_anteriores / campo_nuevos (plural, ej: artefactos_domesticos_anteriores/nuevos)
 * Retorna un mapa de base -> { anteriorKey, nuevoKey }
 */
function detectFieldPairs(metadata: AnyRecord): Map<string, { anteriorKey: string; nuevoKey: string }> {
    const pairs = new Map<string, { anteriorKey: string; nuevoKey: string }>();
    const keys = Object.keys(metadata);

    for (const key of keys) {
        let base: string | null = null;
        let isAnterior = false;

        // Detectar _anterior / _anteriores
        if (key.endsWith('_anterior')) {
            base = key.replace(/_anterior$/, '');
            isAnterior = true;
        } else if (key.endsWith('_anteriores')) {
            base = key.replace(/_anteriores$/, '');
            isAnterior = true;
        }

        if (base && isAnterior && !pairs.has(base)) {
            // Buscar el par nuevo correspondiente
            const nuevoKey = keys.find(k =>
                k === `${base}_nuevo` || k === `${base}_nuevos`
            );
            if (nuevoKey) {
                pairs.set(base, { anteriorKey: key, nuevoKey });
            }
        }
    }

    return pairs;
}

/**
 * Campos de identidad/contexto que siempre se muestran en las cards 
 * independientemente de si cambiaron o no.
 */
const IDENTITY_FIELDS = [
    // Usuario
    'nombre_completo_usuario', 'nombres_usuario', 'apellidos_usuario', 'ci_usuario',
    // Solicitante
    'nombres_solicitante', 'apellidos_solicitante', 'cedula_solicitante',
    'nombre_completo_solicitante',
    // Beneficiario
    'nombres', 'apellidos', 'cedula',
    'cedula_anterior', 'cedula_nuevo',  // for beneficiario updates cedula is also identity
    // Caso
    'id_caso',
    // Soporte
    'nombre_archivo', 'tipo_mime', 'descripcion',
    // Acción
    'detalle_accion', 'comentario',
    // Cita
    'num_cita', 'fecha_encuentro',
    // Equipo
    'miembros_anteriores', 'miembros_nuevos',
    // Sesión
    'nombre_completo_usuario_accion', 'nombre_usuario', 'cedula_usuario', 'ip_direccion',
    // Reporte
    'tipo_reporte', 'formato', 'nombre_completo_solicitante', 'cedula_solicitante',
    // Actor (el que hizo la acción)
    'nombre_completo_usuario_creo', 'nombre_completo_usuario_actualizo',
    'nombre_completo_usuario_elimino', 'nombre_completo_usuario_subio',
    'nombre_completo_usuario_modifico', 'nombre_completo_usuario_genero',
    'nombre_completo_usuario_descargo',
    // Las cédulas/nombres de los solicitantes eliminados
    'solicitante_eliminado', 'nombres_solicitante_eliminado', 'apellidos_solicitante_eliminado',
    'nombre_completo_solicitante_eliminado',
    // Usuario eliminado
    'usuario_eliminado',
    // Catálogos (nombre/descripción siempre visible)
    'nombre_estado', 'nombre_municipio', 'nombre_parroquia', 'nombre_nucleo',
    'nombre_materia', 'nombre_categoria', 'nombre_subcategoria',
    'nombre_ambito_legal', 'nombre_tipo_caracteristica', 'descripcion',
    'nombre_trabajo', 'nombre_actividad', 'term',
    // Motivo
    'motivo',
    // Cambio estatus
    'anterior_estatus', 'nuevo_estatus',
];

/**
 * Campos técnicos/internos que NUNCA se muestran al usuario.
 */
const EXCLUDE_PATTERNS = [
    /^id_auditoria/,
    /^foto_perfil/,
    /^num_cambio$/,
];

/**
 * Extrae el texto buscable visible de un registro de auditoría.
 */
export function extractVisibleSearchText(log: {
    entidad: string;
    accion: string;
    fecha: string;
    usuario_id: string;
    usuario_nombre: string;
    detalles: string;
    metadata: string;
}): string {
    // Campos básicos siempre visibles (summary de la card)
    const parts: string[] = [
        log.entidad,
        log.accion,
        log.usuario_nombre,
        log.usuario_id,
        log.detalles,
    ];

    // Parsear metadata
    let metadata: AnyRecord = {};
    try {
        metadata = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : (log.metadata || {});
    } catch {
        return parts.filter(Boolean).join(' ').toLowerCase();
    }

    const isUpdate = log.accion.toLowerCase().includes('actualización') ||
        log.accion.toLowerCase().includes('modificación');

    // 1. Siempre incluir campos de identidad/contexto
    for (const field of IDENTITY_FIELDS) {
        const val = metadata[field];
        if (val != null && val !== '') {
            parts.push(valueToSearchText(val));
        }
    }

    if (isUpdate) {
        // 2. Para actualizaciones: detectar pares y solo incluir campos que cambiaron
        const fieldPairs = detectFieldPairs(metadata);

        for (const [_base, { anteriorKey, nuevoKey }] of fieldPairs) {
            const valorAnterior = metadata[anteriorKey];
            const valorNuevo = metadata[nuevoKey];

            // Solo incluir si los valores son DIFERENTES (campo que cambió)
            if (!areValuesEffectivelyEqual(valorAnterior, valorNuevo)) {
                // Para campos de listas separadas por coma (ej: artefactos_domesticos),
                // solo incluir los items agregados y eliminados, NO los sin cambio
                const antStr = String(valorAnterior ?? '');
                const nueStr = String(valorNuevo ?? '');
                if (antStr.includes(',') || nueStr.includes(',')) {
                    // Tratar como lista separada por coma
                    const antItems = antStr.split(',').map(s => s.trim()).filter(Boolean);
                    const nueItems = nueStr.split(',').map(s => s.trim()).filter(Boolean);
                    const setAnt = new Set(antItems);
                    const setNue = new Set(nueItems);
                    const eliminados = antItems.filter(a => !setNue.has(a));
                    const agregados = nueItems.filter(a => !setAnt.has(a));
                    parts.push(...eliminados, ...agregados);
                } else {
                    parts.push(valueToSearchText(valorAnterior));
                    parts.push(valueToSearchText(valorNuevo));
                }
            }
        }

        // 3. Para campos especiales que se comparan via un ID pero muestran texto resuelto
        // Ej: id_nivel_educativo_anterior != id_nivel_educativo_nuevo → mostrar nivel_educativo_anterior/nuevo
        const resolvedFieldMappings = [
            { idBase: 'id_nivel_educativo', textBase: 'nivel_educativo' },
            { idBase: 'id_trabajo', textBase: 'condicion_trabajo' },
            { idBase: 'id_actividad', textBase: 'condicion_actividad' },
            { idBase: 'id_estado', textBase: 'estado' },
            { idBase: 'num_municipio', textBase: 'municipio' },
            { idBase: 'num_parroquia', textBase: 'parroquia' },
        ];

        for (const { idBase, textBase } of resolvedFieldMappings) {
            const idAnt = metadata[`${idBase}_anterior`];
            const idNue = metadata[`${idBase}_nuevo`];
            if (!areValuesEffectivelyEqual(idAnt, idNue)) {
                const textAnt = metadata[`${textBase}_anterior`];
                const textNue = metadata[`${textBase}_nuevo`];
                if (textAnt) parts.push(valueToSearchText(textAnt));
                if (textNue) parts.push(valueToSearchText(textNue));
            }
        }

        // 4. Para actualizaciones de equipo: incluir miembros
        if (metadata.miembros_anteriores || metadata.miembros_nuevos) {
            const parseMiembros = (v: any) => {
                if (!v) return [];
                if (typeof v === 'string') try { return JSON.parse(v); } catch { return []; }
                return Array.isArray(v) ? v : [];
            };
            const anteriorArr = parseMiembros(metadata.miembros_anteriores);
            const nuevoArr = parseMiembros(metadata.miembros_nuevos);
            for (const m of [...anteriorArr, ...nuevoArr]) {
                if (m?.nombre) parts.push(m.nombre);
                if (m?.cedula) parts.push(m.cedula);
                if (m?.rol) parts.push(m.rol);
            }
        }

        // 5. Para actualizaciones de ejecutores en acciones
        const parseEjecutores = (v: any) => {
            if (!v) return [];
            if (typeof v === 'string') try { return JSON.parse(v); } catch { return []; }
            return Array.isArray(v) ? v : [];
        };
        if (metadata.ejecutores_anterior || metadata.ejecutores_nuevo) {
            const ejAnt = parseEjecutores(metadata.ejecutores_anterior);
            const ejNue = parseEjecutores(metadata.ejecutores_nuevo);
            for (const e of [...ejAnt, ...ejNue]) {
                if (e?.nombre) parts.push(e.nombre);
            }
        }

        // 6. Para campos de catálogos actualizados (nombre_xxx_anterior/nuevo)
        // Ya cubiertos por detectFieldPairs

    } else {
        // Para creación/eliminación: incluir todos los valores relevantes
        for (const [key, value] of Object.entries(metadata)) {
            if (value == null || value === '') continue;
            if (EXCLUDE_PATTERNS.some(p => p.test(key))) continue;

            parts.push(valueToSearchText(value));
        }
    }

    return parts.filter(Boolean).join(' ').toLowerCase();
}

/**
 * Normaliza el texto para búsquedas (minúsculas y sin acentos).
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filtra logs de auditoría basándose en el texto visible de las cards.
 * Solo retorna logs donde el término de búsqueda aparece en datos realmente visibles.
 */
export function filterLogsByVisibleContent(
    logs: Array<{
        entidad: string;
        accion: string;
        fecha: string;
        usuario_id: string;
        usuario_nombre: string;
        detalles: string;
        metadata: string;
    }>,
    searchTerm: string
): typeof logs {
    if (!searchTerm || searchTerm.trim() === '') return logs;

    const normalizedTerm = normalizeText(searchTerm.trim());

    return logs.filter(log => {
        const visibleText = extractVisibleSearchText(log);
        const normalizedVisibleText = normalizeText(visibleText);
        return normalizedVisibleText.includes(normalizedTerm);
    });
}
