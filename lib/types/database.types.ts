/**
 * Tipos TypeScript para las tablas de la base de datos
 * Estos tipos deben coincidir con el esquema SQL en database/schemas/schema.sql
 * 
 * NOTA: Estos tipos son manuales. En un proyecto más grande, podrías generar
 * estos tipos automáticamente desde el schema SQL usando herramientas como:
 * - pg-to-ts
 * - postgres-codegen
 * - O scripts personalizados
 */

// Tipos base de las tablas principales
export interface Solicitante {
  cedula: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: Date;
  telefono_local: string | null;
  telefono_celular: string;
  correo_electronico: string;
  sexo: 'M' | 'F';
  nacionalidad: 'V' | 'E';
  estado_civil: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | 'Concubino';
  concubinato: boolean;
  tiempo_estudio: string;
  id_nivel_educativo: number;
  id_trabajo: number;
  id_actividad: number;
  id_estado: number;
  num_municipio: number;
  num_parroquia: number;
}

export interface Usuario {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  nombre_usuario: string;
  contrasena: string;
  telefono_celular: string | null;
  habilitado_sistema: boolean;
  tipo_usuario: 'Estudiante' | 'Profesor' | 'Coordinador';
  // Campos legacy para compatibilidad (mapeados desde queries SQL)
  password_hash?: string; // Alias de contrasena
  habilitado?: boolean; // Alias de habilitado_sistema
  rol_sistema?: 'Estudiante' | 'Profesor' | 'Coordinador'; // Alias de tipo_usuario
}

export interface Caso {
  id_caso: number;
  fecha_inicio_caso: Date;
  fecha_fin_caso: Date | null;
  fecha_solicitud: Date;
  tramite: string;
  observaciones: string | null;
  id_nucleo: number;
  cedula: string; // Cédula del solicitante
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  // Nota: estatus y cant_beneficiarios son atributos derivados obtenidos de las vistas
}

export interface Cita {
  num_cita: number;
  id_caso: number;
  fecha_proxima_cita: Date | null;
  fecha_encuentro: Date;
  orientacion: string;
}

export interface Atiende {
  id_usuario: string;
  num_cita: number;
  id_caso: number;
  fecha_registro: Date;
}

export interface Seccion {
  num_seccion: number;
  nrc_materia: string;
  term_semestre: string;
  cedula_profesor: string;
  cedula_coordinador: string;
}

export interface Estudiante {
  cedula_estudiante: string;
  tipo_estudiante: 'Voluntario' | 'Inscrito' | 'Egresado' | null;
  num_seccion: number | null;
  nrc_materia: string | null;
  term_semestre: string | null;
}

export interface Profesor {
  cedula_profesor: string;
}

export interface Coordinador {
  cedula_coordinador: string;
}

// Tipos para relaciones y joins
export interface CasoWithRelations extends Caso {
  estatus?: string; // Derivado de cambio_estatus
  cant_beneficiarios?: number; // Derivado de conteo de beneficiarios
  nombres_solicitante?: string;
  apellidos_solicitante?: string;
  nombre_completo_solicitante?: string;
  nombre_nucleo?: string;
  nombre_materia?: string;
  nombre_categoria?: string;
  nombre_subcategoria?: string;
  nombre_responsable?: string | null;
}

export interface SolicitanteWithRelations extends Solicitante {
  nombre_parroquia?: string;
  nombre_municipio?: string;
  nombre_estado?: string;
  nombre_nucleo?: string;
}

export interface CitaWithRelations extends Cita {
  // Información del caso
  tramite?: string;
  estatus?: string;
  cedula?: string;
  nombres_solicitante?: string;
  apellidos_solicitante?: string;
  nombre_completo_solicitante?: string;
  // Información del núcleo
  id_nucleo?: number;
  nombre_nucleo?: string;
  // Información del ámbito legal
  id_materia?: number;
  num_categoria?: number;
  num_subcategoria?: number;
  num_ambito_legal?: number;
  nombre_materia?: string;
  nombre_categoria?: string;
  nombre_subcategoria?: string;
  // Información de la orientación
  fecha_registro?: Date;
  id_usuario_orientacion?: string;
  nombre_usuario_orientacion?: string;
}

// Tipos para inserts (sin campos auto-generados)
export type CreateSolicitante = Omit<Solicitante, never>;
export type CreateCaso = Omit<Caso, 'id_caso' | 'fecha_inicio_caso'>;
export type CreateUsuario = Omit<Usuario, never>;
export type CreateCita = Omit<Cita, never>;
export type CreateAtiende = Omit<Atiende, 'fecha_registro'>;

// Tipos para updates (todos los campos opcionales excepto PK)
export type UpdateSolicitante = Partial<Omit<Solicitante, 'cedula'>>;
export type UpdateCaso = Partial<Omit<Caso, 'id_caso'>>;
export type UpdateUsuario = Partial<Omit<Usuario, 'cedula'>>;
export type UpdateCita = Partial<Omit<Cita, 'num_cita' | 'id_caso'>>;

