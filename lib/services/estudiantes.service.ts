import ExcelJS from 'exceljs';
import { pool } from '@/lib/db/pool';
import { hashPassword } from '@/lib/utils/security';
import { ValidationError } from '@/lib/utils/errors';

export interface EstudianteRow {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  nombre_usuario: string;
  nrc: string;
}

export interface ProcessedRow {
  rowNumber: number;
  data: EstudianteRow | null;
  errors: string[];
  isDuplicate: boolean;
}

export interface BulkUploadResult {
  total: number;
  success: number;
  errors: number;
  duplicates: number;
  details: ProcessedRow[];
}

/**
 * Normaliza la cédula: si es solo numérica, agrega prefijo "V-"
 */
function normalizeCedula(cedula: string): string {
  const cleaned = cedula.trim();
  // Si es solo numérica, agregar prefijo V-
  if (/^\d+$/.test(cleaned)) {
    return `V-${cleaned}`;
  }
  // Si ya tiene formato (V-12345678 o similar), mantenerlo
  return cleaned;
}

/**
 * Separa nombres y apellidos del formato "Apellidos, Nombres"
 */
function parseNombreCompleto(nombreCompleto: string): { nombres: string; apellidos: string } {
  const trimmed = nombreCompleto.trim();
  const parts = trimmed.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    return {
      apellidos: parts[0],
      nombres: parts.slice(1).join(' '),
    };
  }
  
  // Si no hay coma, asumir que todo son apellidos y nombres están vacíos
  // O intentar separar por último espacio
  const lastSpaceIndex = trimmed.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    return {
      apellidos: trimmed.substring(0, lastSpaceIndex),
      nombres: trimmed.substring(lastSpaceIndex + 1),
    };
  }
  
  return {
    apellidos: trimmed,
    nombres: '',
  };
}

/**
 * Normaliza el correo electrónico completando el dominio si está truncado
 */
function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  
  // Si termina en @est.uca o @est.ucab, completar a @est.ucab.edu.ve
  if (trimmed.endsWith('@est.uca') || trimmed.endsWith('@est.ucab')) {
    return trimmed.replace(/@est\.(uca|ucab)$/, '@est.ucab.edu.ve');
  }
  
  // Si termina en @ucab, completar a @ucab.edu.ve
  if (trimmed.endsWith('@ucab')) {
    return trimmed.replace('@ucab', '@ucab.edu.ve');
  }
  
  return trimmed;
}

/**
 * Valida que el correo tenga dominio UCAB válido
 */
function validateEmailDomain(email: string): boolean {
  return email.endsWith('@est.ucab.edu.ve') || email.endsWith('@ucab.edu.ve');
}

/**
 * Función helper para parsear una línea CSV considerando comillas
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim().replace(/^"|"$/g, ''));
  return values;
}

/**
 * Parsea un archivo CSV
 */
async function parseCSV(file: File): Promise<EstudianteRow[]> {
  const text = await file.text();
  // Remover BOM si existe
  const textWithoutBOM = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const lines = textWithoutBOM.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    throw new ValidationError('El archivo CSV está vacío');
  }
  
  // Leer encabezados (primera línea) usando el mismo algoritmo de parsing
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.trim());
  
  // Buscar índices de las columnas necesarias (búsqueda case-insensitive y flexible)
  const getIndex = (name: string): number => {
    const nameUpper = name.toUpperCase().trim();
    const index = headers.findIndex(h => {
      const headerUpper = h.toUpperCase().trim();
      return headerUpper === nameUpper || 
             headerUpper.includes(nameUpper) || 
             nameUpper.includes(headerUpper);
    });
    if (index === -1) {
      // Mostrar headers disponibles para debug
      throw new ValidationError(
        `Columna requerida no encontrada: ${name}. ` +
        `Headers encontrados: ${headers.join(', ')}`
      );
    }
    return index;
  };
  
  const cedulaIndex = getIndex('CEDULA');
  const nombreIndex = getIndex('NOMBRE_ESTUDIANTE');
  const emailIndex = getIndex('ESTU_EMAIL_ADDRESS');
  const usuarioIndex = getIndex('UCAB_USER');
  const crnIndex = getIndex('CRN');
  
  // Parsear filas
  const rows: EstudianteRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Parsear CSV usando la misma función helper
    const values = parseCSVLine(line);
    
    if (values.length > Math.max(cedulaIndex, nombreIndex, emailIndex, usuarioIndex, crnIndex)) {
      rows.push({
        cedula: values[cedulaIndex] || '',
        nombres: values[nombreIndex] || '',
        apellidos: '', 
        correo_electronico: values[emailIndex] || '',
        nombre_usuario: values[usuarioIndex] || '',
        nrc: values[crnIndex] || '',
      });
    }
  }
  
  return rows;
}

/**
 * Parsea un archivo Excel
 */
async function parseExcel(file: File): Promise<EstudianteRow[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new ValidationError('El archivo Excel no contiene hojas');
  }
  
  // Leer encabezados (primera fila)
  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    headers.push(cell.value?.toString() || '');
  });
  
  // Buscar índices de las columnas necesarias
  const getIndex = (name: string): number => {
    const index = headers.findIndex(h => h.toUpperCase() === name.toUpperCase());
    if (index === -1) {
      throw new ValidationError(`Columna requerida no encontrada: ${name}`);
    }
    return index;
  };
  
  const cedulaIndex = getIndex('CEDULA');
  const nombreIndex = getIndex('NOMBRE_ESTUDIANTE');
  const emailIndex = getIndex('ESTU_EMAIL_ADDRESS');
  const usuarioIndex = getIndex('UCAB_USER');
  const crnIndex = getIndex('CRN');
  
  // Parsear filas
  const rows: EstudianteRow[] = [];
  for (let i = 2; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i);
    const values: string[] = [];
    
    row.eachCell({ includeEmpty: true }, (cell) => {
      values.push(cell.value?.toString() || '');
    });
    
    if (values.length > Math.max(cedulaIndex, nombreIndex, emailIndex, usuarioIndex, crnIndex)) {
      rows.push({
        cedula: values[cedulaIndex] || "",
        nombres: values[nombreIndex] || "",
        apellidos: "",
        correo_electronico: values[emailIndex] || "",
        nombre_usuario: values[usuarioIndex] || "",
        nrc: values[crnIndex] || "",
      });
    }
  }
  
  return rows;
}

/**
 * Procesa y valida las filas del archivo
 */
function processRows(
  rows: EstudianteRow[],
  term: string,
  existingCedulas: Set<string>
): ProcessedRow[] {
  const processed: ProcessedRow[] = [];
  const seenCedulas = new Set<string>();
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 porque la fila 1 es encabezado
    const errors: string[] = [];
    
    // Validar y normalizar cédula
    let cedula = '';
    if (!row.cedula || row.cedula.trim() === '') {
      errors.push('Cédula es requerida');
    } else {
      cedula = normalizeCedula(row.cedula);
      if (cedula.length < 3) {
        errors.push('Cédula inválida');
      }
    }
    
    // Validar y parsear nombre completo
    let nombres = '';
    let apellidos = '';
    if (!row.nombres || row.nombres.trim() === '') {
      errors.push('Nombre completo es requerido');
    } else {
      const parsed = parseNombreCompleto(row.nombres);
      nombres = parsed.nombres;
      apellidos = parsed.apellidos;
      if (!nombres || nombres.trim() === '') {
        errors.push('No se pudo extraer nombres del campo NOMBRE_ESTUDIANTE');
      }
      if (!apellidos || apellidos.trim() === '') {
        errors.push('No se pudo extraer apellidos del campo NOMBRE_ESTUDIANTE');
      }
    }
    
    // Validar y normalizar correo
    let correo = '';
    if (!row.correo_electronico || row.correo_electronico.trim() === '') {
      errors.push('Correo electrónico es requerido');
    } else {
      correo = normalizeEmail(row.correo_electronico);
      if (!validateEmailDomain(correo)) {
        errors.push('El correo debe tener dominio @est.ucab.edu.ve o @ucab.edu.ve');
      }
    }
    
    // Validar nombre de usuario
    let nombreUsuario = '';
    if (!row.nombre_usuario || row.nombre_usuario.trim() === '') {
      errors.push('Nombre de usuario (UCAB_USER) es requerido');
    } else {
      nombreUsuario = row.nombre_usuario.trim();
    }
    
    // Validar NRC
    let nrc = '';
    if (!row.nrc || row.nrc.trim() === '') {
      errors.push('NRC (CRN) es requerido');
    } else {
      nrc = row.nrc.trim();
    }
    
    // Verificar duplicados en el mismo archivo
    const isDuplicateInFile = seenCedulas.has(cedula);
    if (cedula && !isDuplicateInFile) {
      seenCedulas.add(cedula);
    }
    
    // Verificar si ya existe en BD
    const isDuplicateInDB = cedula ? existingCedulas.has(cedula) : false;
    
    if (errors.length === 0) {
      processed.push({
        rowNumber,
        data: {
          cedula,
          nombres,
          apellidos,
          correo_electronico: correo,
          nombre_usuario: nombreUsuario,
          nrc,
        },
        errors: [],
        isDuplicate: isDuplicateInFile || isDuplicateInDB,
      });
    } else {
      processed.push({
        rowNumber,
        data: null,
        errors,
        isDuplicate: false,
      });
    }
  }
  
  return processed;
}

/**
 * Obtiene las cédulas existentes en la base de datos
 */
async function getExistingCedulas(): Promise<Set<string>> {
  const result = await pool.query('SELECT cedula FROM usuarios');
  return new Set(result.rows.map((row: EstudianteRow) => row.cedula));
}

/**
 * Procesa un archivo CSV o Excel y carga estudiantes en la base de datos
 */
export async function bulkCreateEstudiantes(
  file: File,
  term: string,
  tipoEstudiante: string = 'Inscrito'
): Promise<BulkUploadResult> {
  // Validar que el semestre existe
  const semestreCheck = await pool.query(
    'SELECT term FROM semestres WHERE term = $1',
    [term]
  );
  
  if (semestreCheck.rows.length === 0) {
    throw new ValidationError(`El semestre ${term} no existe en la base de datos`);
  }
  
  // Determinar tipo de archivo y parsearlo
  const fileName = file.name.toLowerCase();
  let rows: EstudianteRow[];
  
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    rows = await parseExcel(file);
  } else if (fileName.endsWith('.csv')) {
    rows = await parseCSV(file);
  } else {
    throw new ValidationError('Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)');
  }
  
  if (rows.length === 0) {
    throw new ValidationError('El archivo no contiene datos');
  }
  
  // Obtener cédulas existentes
  const existingCedulas = await getExistingCedulas();
  
  // Procesar y validar filas
  const processed = processRows(rows, term, existingCedulas);
  
  // Filtrar solo las válidas
  const validRows = processed.filter(p => p.data !== null && p.errors.length === 0);
  
  if (validRows.length === 0) {
    throw new ValidationError('No hay filas válidas para procesar');
  }
  
  // Hash de contraseña por defecto
  const defaultPasswordHash = await hashPassword('password123');
  
  // Procesar en transacción
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Cargar queries SQL
    const { loadSQL } = await import('@/lib/db/sql-loader');
    const usuarioQuery = loadSQL('usuarios/create-or-update.sql');
    const estudianteQuery = loadSQL('estudiantes/create-or-update.sql');
    
    let successCount = 0;
    
    for (const processedRow of validRows) {
      if (!processedRow.data) continue;
      
      try {
        const { cedula, nombres, apellidos, correo_electronico, nombre_usuario, nrc } = processedRow.data;
        
        // Crear o actualizar usuario usando el cliente de la transacción
        await client.query(usuarioQuery, [
          cedula,
          nombres,
          apellidos,
          correo_electronico,
          nombre_usuario,
          defaultPasswordHash,
          null, // telefono_celular
        ]);
        
        // Crear o actualizar estudiante usando el cliente de la transacción
        await client.query(estudianteQuery, [
          term,
          cedula,
          tipoEstudiante,
          nrc,
        ]);
        
        successCount++;
      } catch (error) {
        processedRow.errors.push(
          error instanceof Error ? error.message : 'Error desconocido al insertar'
        );
        processedRow.data = null;
      }
    }
    
    await client.query('COMMIT');
    
    return {
      total: processed.length,
      success: successCount,
      errors: processed.filter(p => p.errors.length > 0 || p.data === null).length,
      duplicates: processed.filter(p => p.isDuplicate).length,
      details: processed,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}