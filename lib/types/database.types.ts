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
export interface Cliente {
  cedula: string;
  nombres: string | null;
  apellidos: string | null;
  fecha_nacimiento: Date | null;
  telefono_local: string | null;
  telefono_celular: string | null;
  correo_electronico: string | null;
  sexo: 'M' | 'F' | null;
  nacionalidad: 'V' | 'E' | 'Ext' | null;
  estado_civil: 'Soltero' | 'Casado' | 'Divorciado' | 'Viudo' | null;
  concubinato: boolean | null;
  id_hogar: number | null;
  id_nivel_educativo: number | null;
  id_trabajo: number | null;
  id_vivienda: number | null;
  id_parroquia: number | null;
}

export interface Usuario {
  cedula: string;
  nombre_usuario: string;
  password_hash: string;
  habilitado: boolean | null;
  rol_sistema: 'Estudiante' | 'Profesor' | 'Coordinador' | null;
  foto_perfil: Buffer | null;
}

export interface Caso {
  id_caso: number;
  fecha_inicio_caso: Date | null;
  fecha_fin_caso: Date | null;
  fecha_solicitud: Date;
  tramite: string | null;
  estatus: string | null;
  observaciones: string | null;
  id_nucleo: number | null;
  id_ambito_legal: number | null;
  id_expediente: string | null;
  cedula_cliente: string | null;
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
  nombres_cliente?: string;
  apellidos_cliente?: string;
  nombre_nucleo?: string;
  materia_ambito?: string;
}

export interface ClienteWithRelations extends Cliente {
  nombre_parroquia?: string;
  nombre_municipio?: string;
  nombre_estado?: string;
}

// Tipos para inserts (sin campos auto-generados)
export type CreateCliente = Omit<Cliente, never>;
export type CreateCaso = Omit<Caso, 'id_caso' | 'fecha_inicio_caso'>;
export type CreateUsuario = Omit<Usuario, never>;

// Tipos para updates (todos los campos opcionales excepto PK)
export type UpdateCliente = Partial<Omit<Cliente, 'cedula'>>;
export type UpdateCaso = Partial<Omit<Caso, 'id_caso'>>;
export type UpdateUsuario = Partial<Omit<Usuario, 'cedula'>>;

