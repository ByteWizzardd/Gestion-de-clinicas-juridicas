/**
 * Traducción de errores a mensajes naturales para el usuario.
 *
 * Los errores de PostgreSQL, de red o de JavaScript nunca deben llegar tal cual
 * a la interfaz (exponen nombres de tablas, constraints, datos y no le dicen
 * nada útil al usuario). Este módulo:
 *   1. Traduce los errores conocidos de la BD (FK, unique, not-null, check…)
 *      a frases en español que explican qué pasó.
 *   2. Deja pasar los mensajes que ya son para el usuario ("Cédula requerida").
 *   3. Sustituye cualquier otro mensaje técnico por un mensaje genérico.
 *
 * No tiene dependencias: se usa en server actions y, como red de seguridad,
 * dentro del ToastProvider en el cliente.
 */

export const DEFAULT_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Intenta de nuevo y, si el problema continúa, contacta al administrador.';

const CONNECTION_MESSAGE =
  'No se pudo conectar con la base de datos. Intenta de nuevo en unos momentos.';

// ---------------------------------------------------------------------------
// Vocabulario de la BD
// ---------------------------------------------------------------------------

interface Entidad {
  /** Sustantivo en singular con artículo definido: "el solicitante". */
  el: string;
  /** Sustantivo en singular con artículo indefinido: "un solicitante". */
  un: string;
  /** Lo que "tiene" un registro padre cuando esta tabla lo referencia. */
  asociados: string;
  femenino?: boolean;
  /** El registro se puede deshabilitar en vez de eliminar. */
  deshabilitable?: boolean;
}

const ENTIDADES: Record<string, Entidad> = {
  estados: { el: 'el estado', un: 'un estado', asociados: 'estados asociados', deshabilitable: true },
  niveles_educativos: { el: 'el nivel educativo', un: 'un nivel educativo', asociados: 'niveles educativos asociados', deshabilitable: true },
  condicion_trabajo: { el: 'la condición de trabajo', un: 'una condición de trabajo', asociados: 'condiciones de trabajo asociadas', femenino: true, deshabilitable: true },
  condicion_actividad: { el: 'la condición de actividad', un: 'una condición de actividad', asociados: 'condiciones de actividad asociadas', femenino: true, deshabilitable: true },
  tipo_caracteristicas: { el: 'el tipo de característica', un: 'un tipo de característica', asociados: 'tipos de característica asociados', deshabilitable: true },
  materias: { el: 'la materia', un: 'una materia', asociados: 'materias asociadas', femenino: true, deshabilitable: true },
  semestres: { el: 'el semestre', un: 'un semestre', asociados: 'semestres asociados', deshabilitable: true },
  usuarios: { el: 'el usuario', un: 'un usuario', asociados: 'usuarios asociados', deshabilitable: true },
  municipios: { el: 'el municipio', un: 'un municipio', asociados: 'municipios asociados', deshabilitable: true },
  parroquias: { el: 'la parroquia', un: 'una parroquia', asociados: 'parroquias asociadas', femenino: true, deshabilitable: true },
  nucleos: { el: 'el núcleo', un: 'un núcleo', asociados: 'núcleos asociados', deshabilitable: true },
  solicitantes: { el: 'el solicitante', un: 'un solicitante', asociados: 'solicitantes asociados' },
  viviendas: { el: 'la vivienda', un: 'una vivienda', asociados: 'datos de vivienda registrados', femenino: true },
  familias_y_hogares: { el: 'el hogar', un: 'un hogar', asociados: 'datos del hogar registrados' },
  caracteristicas: { el: 'la característica', un: 'una característica', asociados: 'características asociadas', femenino: true, deshabilitable: true },
  asignadas_a: { el: 'la característica asignada', un: 'una característica asignada', asociados: 'viviendas que la usan', femenino: true },
  categorias: { el: 'la categoría', un: 'una categoría', asociados: 'categorías asociadas', femenino: true, deshabilitable: true },
  subcategorias: { el: 'la subcategoría', un: 'una subcategoría', asociados: 'subcategorías asociadas', femenino: true, deshabilitable: true },
  ambitos_legales: { el: 'el ámbito legal', un: 'un ámbito legal', asociados: 'ámbitos legales asociados', deshabilitable: true },
  coordinadores: { el: 'el coordinador', un: 'un coordinador', asociados: 'períodos registrados como coordinador' },
  estudiantes: { el: 'el estudiante', un: 'un estudiante', asociados: 'inscripciones como estudiante' },
  profesores: { el: 'el profesor', un: 'un profesor', asociados: 'períodos registrados como profesor' },
  casos: { el: 'el caso', un: 'un caso', asociados: 'casos asociados' },
  citas: { el: 'la cita', un: 'una cita', asociados: 'citas registradas', femenino: true },
  atienden: { el: 'la atención de la cita', un: 'una atención de cita', asociados: 'citas atendidas', femenino: true },
  acciones: { el: 'la acción', un: 'una acción', asociados: 'acciones registradas', femenino: true },
  ejecutan: { el: 'la ejecución de la acción', un: 'una ejecución de acción', asociados: 'acciones ejecutadas', femenino: true },
  cambio_estatus: { el: 'el cambio de estatus', un: 'un cambio de estatus', asociados: 'cambios de estatus registrados' },
  soportes: { el: 'el documento', un: 'un documento', asociados: 'documentos de soporte' },
  beneficiarios: { el: 'el beneficiario', un: 'un beneficiario', asociados: 'beneficiarios registrados' },
  supervisa: { el: 'la supervisión', un: 'una supervisión', asociados: 'casos que supervisa', femenino: true },
  se_le_asigna: { el: 'la asignación', un: 'una asignación', asociados: 'casos asignados', femenino: true },
  ocurren_en: { el: 'el registro del caso en el semestre', un: 'un registro del caso en el semestre', asociados: 'casos registrados' },
  auditoria_eventos: { el: 'el evento de auditoría', un: 'un evento de auditoría', asociados: 'eventos de auditoría' },
  notificaciones: { el: 'la notificación', un: 'una notificación', asociados: 'notificaciones', femenino: true },
  password_reset_tokens: { el: 'el código de recuperación', un: 'un código de recuperación', asociados: 'códigos de recuperación de contraseña pendientes' },
};

/**
 * Frases para parejas padre:hijo donde la genérica del hijo no encaja
 * ("la acción porque tiene acciones ejecutadas").
 */
const ASOCIADOS_POR_PADRE: Record<string, string> = {
  'acciones:ejecutan': 'ejecutores registrados',
  'casos:ocurren_en': 'semestres registrados',
  'casos:se_le_asigna': 'estudiantes asignados',
  'casos:supervisa': 'profesores supervisores asignados',
  'citas:atienden': 'personas que la atendieron registradas',
  'viviendas:asignadas_a': 'características asignadas',
  'semestres:coordinadores': 'coordinadores registrados',
  'semestres:estudiantes': 'estudiantes inscritos',
  'semestres:profesores': 'profesores registrados',
};

/**
 * Tablas cuya relación con usuarios es de trazabilidad (quién registró o
 * modificó el registro): se explica como historial, no como "estados asociados".
 */
const HIJOS_OPERATIVOS_DE_USUARIO = new Set([
  'acciones', 'atienden', 'beneficiarios', 'cambio_estatus', 'citas', 'coordinadores', 'ejecutan',
  'estudiantes', 'notificaciones', 'password_reset_tokens', 'profesores', 'se_le_asigna', 'soportes', 'supervisa',
]);

// Nombres más largos primero para que "familias_y_hogares_check" no case con otra tabla.
const TABLAS_POR_LONGITUD = Object.keys(ENTIDADES).sort((a, b) => b.length - a.length);

const CAMPOS: Record<string, string> = {
  cedula: 'cédula',
  cedula_solicitante: 'cédula del solicitante',
  cedula_estudiante: 'estudiante',
  cedula_profesor: 'profesor',
  nombres: 'nombres',
  apellidos: 'apellidos',
  correo_electronico: 'correo electrónico',
  nombre_usuario: 'nombre de usuario',
  contrasena: 'contraseña',
  telefono_celular: 'teléfono celular',
  telefono_local: 'teléfono local',
  fecha_nacimiento: 'fecha de nacimiento',
  fecha_nac: 'fecha de nacimiento',
  sexo: 'sexo',
  nacionalidad: 'nacionalidad',
  estado_civil: 'estado civil',
  tipo_usuario: 'tipo de usuario',
  tipo_estudiante: 'tipo de estudiante',
  tipo_profesor: 'tipo de profesor',
  tipo_beneficiario: 'tipo de beneficiario',
  parentesco: 'parentesco',
  term: 'semestre',
  fecha_inicio: 'fecha de inicio',
  fecha_fin: 'fecha de fin',
  fecha_solicitud: 'fecha de solicitud',
  fecha_inicio_caso: 'fecha de inicio del caso',
  fecha_fin_caso: 'fecha de fin del caso',
  fecha_encuentro: 'fecha del encuentro',
  fecha_proxima_cita: 'fecha de la próxima cita',
  fecha_registro: 'fecha de registro',
  fecha_ejecucion: 'fecha de ejecución',
  fecha_consignacion: 'fecha de consignación',
  tramite: 'trámite',
  id_nucleo: 'núcleo',
  id_estado: 'estado',
  num_municipio: 'municipio',
  num_parroquia: 'parroquia',
  id_materia: 'materia',
  num_categoria: 'categoría',
  num_subcategoria: 'subcategoría',
  num_ambito_legal: 'ámbito legal',
  id_nivel_educativo: 'nivel educativo',
  id_trabajo: 'condición de trabajo',
  id_actividad: 'condición de actividad',
  nombre_estado: 'nombre del estado',
  nombre_municipio: 'nombre del municipio',
  nombre_parroquia: 'nombre de la parroquia',
  nombre_nucleo: 'nombre del núcleo',
  nombre_materia: 'nombre de la materia',
  nombre_categoria: 'nombre de la categoría',
  nombre_subcategoria: 'nombre de la subcategoría',
  nombre_ambito_legal: 'nombre del ámbito legal',
  descripcion: 'descripción',
  titulo_accion: 'título de la acción',
  observacion: 'observación',
  nombre_archivo: 'nombre del archivo',
  tipo_mime: 'tipo de archivo',
  cant_habitaciones: 'cantidad de habitaciones',
  cant_banos: 'cantidad de baños',
  cant_personas: 'cantidad de personas',
  cant_trabajadores: 'cantidad de trabajadores',
  cant_no_trabajadores: 'cantidad de personas que no trabajan',
  cant_ninos: 'cantidad de niños',
  cant_ninos_estudiando: 'cantidad de niños estudiando',
  ingresos_mensuales: 'ingresos mensuales',
  tiempo_estudio: 'tiempo de estudio',
  tiempo_estudio_jefe: 'tiempo de estudio del jefe del hogar',
  tipo_tiempo_estudio: 'unidad del tiempo de estudio',
  tipo_tiempo_estudio_jefe: 'unidad del tiempo de estudio del jefe del hogar',
  nuevo_estatus: 'estatus',
  motivo: 'motivo',
};

/**
 * Mensajes para checks cuyo nombre no basta para deducir la regla. Incluye los
 * nombres de la BD desplegada (chk_*) y los que genera schema.sql en una BD nueva.
 */
const CHECKS: Record<string, string> = {
  // Fechas que no pueden ser futuras
  chk_solicitantes_nacimiento_pasado: 'La fecha de nacimiento no puede ser posterior a la fecha actual.',
  chk_beneficiarios_nac_pasado: 'La fecha de nacimiento no puede ser posterior a la fecha actual.',
  chk_casos_solicitud_pasada: 'La fecha de solicitud no puede ser posterior a la fecha actual.',
  chk_casos_inicio_pasado: 'La fecha de inicio del caso no puede ser posterior a la fecha actual.',
  chk_acciones_registro_pasado: 'La fecha de registro de la acción no puede ser posterior a la fecha actual.',
  chk_atienden_registro_pasado: 'La fecha de registro no puede ser posterior a la fecha actual.',
  chk_ejecutan_fecha_pasada: 'La fecha de ejecución no puede ser posterior a la fecha actual.',
  chk_cambio_estatus_fecha_pasada: 'La fecha del cambio de estatus no puede ser posterior a la fecha actual.',
  chk_soportes_consignacion_pasada: 'La fecha de consignación del documento no puede ser posterior a la fecha actual.',
  // Orden entre fechas
  chk_casos_inicio_post_solicitud: 'La fecha de inicio del caso no puede ser anterior a la fecha de solicitud.',
  chk_casos_fin_post_inicio: 'La fecha de fin del caso no puede ser anterior a la fecha de inicio.',
  chk_citas_proxima_posterior: 'La fecha de la próxima cita debe ser posterior a la fecha del encuentro.',
  citas_check: 'La fecha de la próxima cita debe ser posterior a la fecha del encuentro.',
  chk_fechas: 'La fecha de fin del semestre no puede ser anterior a la fecha de inicio.',
  semestres_check: 'La fecha de fin del semestre no puede ser anterior a la fecha de inicio.',
  semestres_term_check: 'El semestre debe tener el formato AAAA-15 o AAAA-25 (por ejemplo, 2026-15).',
  // Hogar
  chk_cant_personas_minimo: 'El hogar debe tener al menos una persona.',
  chk_al_menos_un_adulto: 'La cantidad de niños debe ser menor que la cantidad total de personas del hogar.',
  chk_ninos_estudiando_menor_igual_ninos: 'La cantidad de niños estudiando no puede ser mayor que la cantidad de niños.',
  chk_trabajadores_menor_igual_personas: 'La cantidad de trabajadores no puede ser mayor que la cantidad de personas del hogar.',
  familias_tiempo_estudio_jefe_check: 'El tiempo de estudio del jefe del hogar no puede ser negativo.',
  familias_y_hogares_check: 'La cantidad de niños estudiando no puede ser mayor que la cantidad de niños.',
  familias_y_hogares_check1: 'La cantidad de niños debe ser menor que la cantidad total de personas del hogar.',
  familias_y_hogares_check2: 'La cantidad de trabajadores no puede ser mayor que la cantidad de personas del hogar.',
  // Otros
  solicitantes_telefono_local_check: 'El teléfono local debe tener entre 7 y 11 dígitos, sin guiones ni espacios.',
  solicitantes_telefono_celular_check: 'El teléfono celular no puede tener más de 20 dígitos.',
};

/** Mensajes para unique/primary keys concretas. */
const UNICOS: Record<string, string> = {
  usuarios_pkey: 'Ya existe un usuario registrado con esa cédula.',
  usuarios_correo_electronico_key: 'Ya existe un usuario registrado con ese correo electrónico.',
  usuarios_nombre_usuario_key: 'Ya existe un usuario con ese nombre de usuario.',
  solicitantes_pkey: 'Ya existe un solicitante registrado con esa cédula.',
  solicitantes_correo_electronico_key: 'Ya existe un solicitante registrado con ese correo electrónico.',
  solicitantes_correo_electronico_unique: 'Ya existe un solicitante registrado con ese correo electrónico.',
  semestres_pkey: 'Ya existe un semestre registrado con ese período.',
  estudiantes_pkey: 'Ese estudiante ya está inscrito en el semestre seleccionado.',
  profesores_pkey: 'Ese profesor ya está registrado en el semestre seleccionado.',
  coordinadores_pkey: 'Ese usuario ya está registrado como coordinador.',
  se_le_asigna_pkey: 'Ese estudiante ya está asignado a este caso en el semestre seleccionado.',
  supervisa_pkey: 'Ese profesor ya supervisa este caso en el semestre seleccionado.',
  ocurren_en_pkey: 'El caso ya está registrado en ese semestre.',
  viviendas_pkey: 'El solicitante ya tiene datos de vivienda registrados.',
  familias_y_hogares_pkey: 'El solicitante ya tiene datos del hogar registrados.',
  asignadas_a_pkey: 'Esa característica ya está asignada a la vivienda.',
};

// ---------------------------------------------------------------------------
// Detección de mensajes técnicos
// ---------------------------------------------------------------------------

const PATRONES_TECNICOS: RegExp[] = [
  // PostgreSQL
  /violates|constraint|foreign key|duplicate key|not-null|null value in column/i,
  /\b(relation|column|table|type|function|operator|schema|role|database)\s+"[^"]*"/i,
  /syntax error|invalid input|out of range|value too long|permission denied|row-level security/i,
  /deadlock|could not (serialize|connect|obtain)|canceling statement|statement timeout|current transaction is aborted/i,
  /does not exist|already exists|is not present in|there is no|bind message|could not determine/i,
  /\bKey \(|\bDETAIL:|\bHINT:|SQLSTATE|SQLERRM|\bpg_\w+|\.sql\b|SET LOCAL|\brol_(coordinador|profesor|estudiante)\b/i,
  // Red / Node
  /\bE(CONNREFUSED|CONNRESET|TIMEDOUT|NOTFOUND|AI_AGAIN|PIPE|NOENT|ACCES)\b|getaddrinfo|socket hang up/i,
  /connection terminated|terminating connection|timeout exceeded|fetch failed|network ?error|Invalid login/i,
  // JavaScript
  /\b(TypeError|ReferenceError|SyntaxError|RangeError|ZodError)\b|is not a function|cannot read propert|is not defined/i,
  /\bundefined\b|\bnull\b|\bNaN\b|\[object Object\]|Unexpected (token|end)|\bJSON\b|at \S+ \(|\bstack\b/i,
  // Frases en inglés típicas de librerías
  /\b(the|is|not|of|cannot|could|invalid|unexpected|failed|must|unable|expected|received|internal server)\b/i,
  // Identificadores snake_case entre comillas o códigos tipo HAS_ASSOCIATIONS
  /"[a-z0-9]+_[a-z0-9_]+"/,
  /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/,
];

/** true si el mensaje expone detalles técnicos o no está pensado para el usuario. */
export function isTechnicalMessage(message: string): boolean {
  const texto = message.trim();
  if (!texto) return true;
  return PATRONES_TECNICOS.some((patron) => patron.test(texto));
}

// ---------------------------------------------------------------------------
// Traducción
// ---------------------------------------------------------------------------

const CODIGOS_RED = /^E(CONNREFUSED|CONNRESET|TIMEDOUT|NOTFOUND|AI_AGAIN|PIPE|HOSTUNREACH|NETUNREACH)$/;

interface DatosError {
  code?: string;
  message: string;
  constraint?: string;
  table?: string;
  column?: string;
  detail?: string;
}

function extraerDatos(error: unknown): DatosError {
  if (typeof error === 'string') return { message: error };
  if (!error || typeof error !== 'object') return { message: '' };

  const e = error as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
  const code = str(e.code);
  return {
    // Los AppError de los servicios guardan en `code` códigos propios
    // ("CASO_ERROR"); solo interesan los SQLSTATE (5 caracteres) y los de red.
    code: code && (/^[0-9][0-9A-Z]{4}$/.test(code) || CODIGOS_RED.test(code)) ? code : undefined,
    message: str(e.message) ?? '',
    constraint: str(e.constraint),
    table: str(e.table),
    column: str(e.column),
    detail: str(e.detail),
  };
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function tablaDeConstraint(constraint: string | undefined): string | undefined {
  if (!constraint) return undefined;
  return TABLAS_POR_LONGITUD.find((t) => constraint === t || constraint.startsWith(`${t}_`));
}

function columnaDeConstraint(constraint: string, tabla: string | undefined, sufijo: string): string | undefined {
  if (!tabla || !constraint.startsWith(`${tabla}_`) || !constraint.endsWith(sufijo)) return undefined;
  const columna = constraint.slice(tabla.length + 1, -sufijo.length);
  return columna || undefined;
}

/** Deduce la operación a partir del mensaje de respaldo ("Error al actualizar…"). */
function verbo(contexto: string): string {
  return /actualiz|modific|edit|cambi|mover|mueve|renombr/i.test(contexto) ? 'modificar' : 'eliminar';
}

function traducirFkPadreConHijos(padre: string | undefined, hijo: string | undefined, contexto: string): string {
  const entPadre = padre ? ENTIDADES[padre] : undefined;
  const entHijo = hijo ? ENTIDADES[hijo] : undefined;
  const accion = verbo(contexto);

  const sujeto = entPadre ? entPadre.el : 'este registro';
  let asociados = entHijo?.asociados;
  if (padre && hijo && ASOCIADOS_POR_PADRE[`${padre}:${hijo}`]) {
    asociados = ASOCIADOS_POR_PADRE[`${padre}:${hijo}`];
  } else if (padre === 'usuarios' && hijo && !HIJOS_OPERATIVOS_DE_USUARIO.has(hijo)) {
    asociados = 'registros a su nombre en el historial del sistema';
  }
  const razon = asociados ? `tiene ${asociados}` : 'tiene información asociada';
  let mensaje = `No se puede ${accion} ${sujeto} porque ${razon}.`;

  if (accion === 'eliminar' && entPadre?.deshabilitable) {
    mensaje += ` Si ya no se usa, puedes deshabilitarl${entPadre.femenino ? 'a' : 'o'} en su lugar.`;
  }
  return mensaje;
}

function traducirFkReferenciaInexistente(padre: string | undefined): string {
  const ent = padre ? ENTIDADES[padre] : undefined;
  if (!ent) {
    return 'Uno de los datos seleccionados ya no existe. Actualiza la página e intenta de nuevo.';
  }
  const o = ent.femenino ? 'a' : 'o';
  return `${capitalizar(ent.el)} seleccionad${o} ya no existe o fue eliminad${o}. Actualiza la página e intenta de nuevo.`;
}

function traducirUnico(constraint: string | undefined, detail: string): string {
  if (constraint && UNICOS[constraint]) return UNICOS[constraint];

  const tabla = tablaDeConstraint(constraint);
  const ent = tabla ? ENTIDADES[tabla] : undefined;
  const columnaDetalle = /Key \(([a-z0-9_]+)\)=/i.exec(detail)?.[1];
  const campo = columnaDetalle ? CAMPOS[columnaDetalle] : undefined;

  if (ent && campo) return `Ya existe ${ent.un} con el mismo valor en «${campo}».`;
  if (ent) return `Ya existe ${ent.un} registrad${ent.femenino ? 'a' : 'o'} con esos datos.`;
  return 'Ya existe un registro con esos datos.';
}

function traducirNoNulo(columna: string | undefined): string {
  const campo = columna ? CAMPOS[columna] : undefined;
  return campo
    ? `Falta completar un dato obligatorio: ${campo}.`
    : 'Falta completar un dato obligatorio. Revisa el formulario e intenta de nuevo.';
}

function traducirCheck(constraint: string | undefined): string {
  const generico = 'Uno de los datos ingresados no es válido. Revisa el formulario e intenta de nuevo.';
  if (!constraint) return generico;
  if (CHECKS[constraint]) return CHECKS[constraint];

  const tabla = tablaDeConstraint(constraint);
  const columna = columnaDeConstraint(constraint, tabla, '_check');
  if (!columna) return generico;

  const campo = CAMPOS[columna];
  if (/^fecha/.test(columna)) {
    return `La ${campo ?? 'fecha'} no puede ser posterior a la fecha actual.`;
  }
  if (/^(cant_|tiempo_estudio|ingresos)/.test(columna)) {
    return `El valor de «${campo ?? 'cantidad'}» no puede ser negativo.`;
  }
  return campo ? `El valor de «${campo}» no es válido.` : generico;
}

/** Deduce el SQLSTATE cuando solo se tiene el texto del error (p. ej. ya envuelto en otro mensaje). */
function inferirCodigo(texto: string): string | undefined {
  if (/violates foreign key constraint/i.test(texto)) return '23503';
  if (/duplicate key value violates unique constraint/i.test(texto)) return '23505';
  if (/violates not-null constraint/i.test(texto)) return '23502';
  if (/violates check constraint/i.test(texto)) return '23514';
  if (/value too long for type/i.test(texto)) return '22001';
  if (/out of range/i.test(texto)) return '22003';
  if (/invalid input (syntax|value)/i.test(texto)) return '22P02';
  if (/permission denied|row-level security/i.test(texto)) return '42501';
  if (/deadlock detected/i.test(texto)) return '40P01';
  if (/could not serialize/i.test(texto)) return '40001';
  if (/canceling statement due to statement timeout|query read timeout/i.test(texto)) return '57014';
  if (/\bE(CONNREFUSED|CONNRESET|TIMEDOUT|NOTFOUND|AI_AGAIN)\b|getaddrinfo|connection terminated|terminating connection|timeout exceeded when trying to connect|could not connect/i.test(texto)) {
    return '08006';
  }
  return undefined;
}

function traducirPorCodigo(datos: DatosError, contexto: string): string | undefined {
  const texto = [datos.message, datos.detail].filter(Boolean).join(' ');
  const code = datos.code ?? inferirCodigo(texto);
  if (!code) return undefined;

  const constraint = datos.constraint ?? /constraint "([^"]+)"/i.exec(texto)?.[1];

  switch (code) {
    case '23503': {
      // update or delete on table "padre" violates foreign key constraint "x" on table "hijo"
      const borrado = /update or delete on table "([^"]+)" violates foreign key constraint "[^"]+" on table "([^"]+)"/i.exec(texto);
      if (borrado) return traducirFkPadreConHijos(borrado[1], borrado[2], contexto);
      if (/is still referenced from table "([^"]+)"/i.test(texto)) {
        const hijo = /is still referenced from table "([^"]+)"/i.exec(texto)?.[1];
        return traducirFkPadreConHijos(datos.table, hijo, contexto);
      }
      // insert or update on table "hijo" violates foreign key constraint … is not present in table "padre"
      const padre = /is not present in table "([^"]+)"/i.exec(texto)?.[1];
      return traducirFkReferenciaInexistente(padre);
    }
    case '23505':
      return traducirUnico(constraint, texto);
    case '23502':
      return traducirNoNulo(datos.column ?? /null value in column "([^"]+)"/i.exec(texto)?.[1]);
    case '23514':
      return traducirCheck(constraint);
    case '22001':
      return 'Uno de los campos supera la cantidad máxima de caracteres permitida.';
    case '22003':
    case '22008':
      return 'Uno de los valores ingresados está fuera del rango permitido.';
    case '22P02':
    case '22007':
    case '22023':
      return 'Uno de los datos ingresados tiene un formato inválido. Revisa el formulario e intenta de nuevo.';
    case '42501':
      return 'No tienes permisos para realizar esta acción.';
    case '40001':
    case '40P01':
    case '55P03':
      return 'La operación coincidió con otra que estaba en curso. Intenta de nuevo en unos segundos.';
    case '57014':
      return 'La operación tardó demasiado en completarse. Intenta de nuevo en unos momentos.';
    default:
      if (/^(08|53|57P0)/.test(code) || CODIGOS_RED.test(code)) return CONNECTION_MESSAGE;
      return undefined;
  }
}

/**
 * Los RAISE EXCEPTION de la BD suelen tener una parte legible y otra técnica:
 * "No se puede eliminar el caso porque aún tiene referencias activas. Detalle: update or delete…".
 * Devuelve la parte legible si la hay.
 */
function parteLegible(mensaje: string): string | undefined {
  const partes = mensaje.split(/\s*(?:Detalle|Error|Detail):\s*/i);
  const cabeza = partes[0]?.trim();
  if (partes.length < 2 || !cabeza || isTechnicalMessage(cabeza)) return undefined;
  // "Error al eliminar caso" no aporta nada: mejor el mensaje de respaldo.
  if (/^error al /i.test(cabeza)) return undefined;
  return /[.!?]$/.test(cabeza) ? cabeza : `${cabeza}.`;
}

/**
 * Convierte cualquier error en un mensaje apto para mostrar al usuario.
 *
 * @param error    Error capturado (pg, AppError, Error, string…)
 * @param fallback Mensaje a usar si el error no se puede traducir. También se
 *                 usa para deducir la operación ("Error al actualizar…").
 */
export function toUserMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string {
  const respaldo = fallback && !isTechnicalMessage(fallback) ? fallback : DEFAULT_ERROR_MESSAGE;
  const datos = extraerDatos(error);

  const traducido = traducirPorCodigo(datos, respaldo);
  if (traducido) return traducido;

  const mensaje = datos.message.trim();
  if (mensaje && !isTechnicalMessage(mensaje)) return mensaje;
  if (mensaje) return parteLegible(mensaje) ?? respaldo;
  return respaldo;
}

/**
 * Red de seguridad para textos que ya son strings (p. ej. lo que llega al toast).
 * Devuelve el mismo texto si es apto para el usuario, o una traducción/respaldo si no.
 */
export function sanitizeUserMessage(message: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string {
  return toUserMessage(message, fallback);
}
