import { writeFileSync } from 'fs';
import { join } from 'path';

const catalogs = [
  { name: 'nucleos', idField: 'id_nucleo', nameField: 'nombre_nucleo', hasExtra: ['id_estado', 'num_municipio', 'num_parroquia'] },
  { name: 'condiciones-trabajo', idField: 'id_trabajo', nameField: 'nombre_trabajo' },
  { name: 'condiciones-actividad', idField: 'id_actividad', nameField: 'nombre_actividad' },
  { name: 'tipos-caracteristicas', idField: 'id_tipo', nameField: 'nombre_tipo_caracteristica' },
  { name: 'semestres', idField: 'term', nameField: 'term', isTerm: true },
  { name: 'municipios', idField: 'id_estado, num_municipio', nameField: 'nombre_municipio', hasComposite: true },
  { name: 'parroquias', idField: 'id_estado, num_municipio, num_parroquia', nameField: 'nombre_parroquia', hasComposite: true },
  { name: 'categorias', idField: 'id_materia, num_categoria', nameField: 'nombre_categoria', hasComposite: true },
  { name: 'subcategorias', idField: 'id_materia, num_categoria, num_subcategoria', nameField: 'nombre_subcategoria', hasComposite: true },
  { name: 'ambitos-legales', idField: 'id_materia, num_categoria, num_subcategoria, num_ambito_legal', nameField: 'nombre_ambito_legal', hasComposite: true },
  { name: 'caracteristicas', idField: 'id_tipo_caracteristica, num_caracteristica', nameField: 'descripcion', hasComposite: true },
];

const baseDir = process.cwd();

catalogs.forEach(cat => {
  const className = cat.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const varName = cat.name.replace(/-/g, '');
  
  // Eliminación
  const elimFields = cat.hasComposite
    ? cat.idField.split(', ').map(f => `    ${f.trim()}: number;`).join('\n')
    : `    ${cat.idField}: number;`;
  
  const elimExtraFields = cat.hasExtra ? cat.hasExtra.map(f => `    ${f}: number | null;`).join('\n') : '';
  
  const elimHelper = `import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaEliminacion${className}
 */
export const auditoriaEliminacion${className}Queries = {
  /**
   * Obtiene el conteo total de ${cat.name.replace(/-/g, ' ')} eliminados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-eliminacion-${cat.name}/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los ${cat.name.replace(/-/g, ' ')} eliminados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
${elimFields}
    ${cat.nameField}: string;
    habilitado: boolean | null;
${elimExtraFields ? elimExtraFields + '\n' : ''}    fecha_eliminacion: string;
    id_usuario_elimino: string;
    nombres_usuario_elimino: string | null;
    apellidos_usuario_elimino: string | null;
    nombre_completo_usuario_elimino: string | null;
    foto_perfil_usuario_elimino: string | null;
    motivo: string | null;
  }>> => {
    const query = loadSQL('auditoria-eliminacion-${cat.name}/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_elimino: row.foto_perfil_usuario_elimino 
        ? \`data:image/jpeg;base64,\${(row.foto_perfil_usuario_elimino as Buffer).toString('base64')}\`
        : null,
    }));
  },
};
`;
  
  writeFileSync(join(baseDir, 'lib', 'db', 'queries', `auditoria-eliminacion-${cat.name}.queries.ts`), elimHelper);
  
  // Actualización
  const actNameFields = cat.isTerm
    ? '    fecha_inicio_anterior: string | null;\n    fecha_inicio_nuevo: string | null;\n    fecha_fin_anterior: string | null;\n    fecha_fin_nuevo: string | null;'
    : `    ${cat.nameField}_anterior: string | null;\n    ${cat.nameField}_nuevo: string | null;`;
  
  const actExtraFields = cat.hasExtra 
    ? cat.hasExtra.map(f => `    ${f}_anterior: number | null;\n    ${f}_nuevo: number | null;`).join('\n')
    : '';
  
  const actHelper = `import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacion${className}
 */
export const auditoriaActualizacion${className}Queries = {
  /**
   * Obtiene el conteo total de ${cat.name.replace(/-/g, ' ')} actualizados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-${cat.name}/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todas las actualizaciones de ${cat.name.replace(/-/g, ' ')} con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
${cat.hasComposite ? cat.idField.split(', ').map(f => `    ${f.trim()}: number;`).join('\n') : `    ${cat.idField}: ${cat.isTerm ? 'string' : 'number'};`}
${actNameFields}
    habilitado_anterior: boolean | null;
    habilitado_nuevo: boolean | null;
${actExtraFields ? actExtraFields + '\n' : ''}    fecha_actualizacion: string;
    id_usuario_actualizo: string;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-${cat.name}/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo 
        ? \`data:image/jpeg;base64,\${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}\`
        : null,
    }));
  },
};
`;
  
  writeFileSync(join(baseDir, 'lib', 'db', 'queries', `auditoria-actualizacion-${cat.name}.queries.ts`), actHelper);
});

console.log('✅ Queries helpers TypeScript creados para todos los catálogos');
