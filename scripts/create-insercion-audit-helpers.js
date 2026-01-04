const fs = require('fs');
const path = require('path');

const catalogs = [
  { name: 'estados', idField: 'id_estado', nameField: 'nombre_estado', type: 'number' },
  { name: 'materias', idField: 'id_materia', nameField: 'nombre_materia', type: 'number' },
  { name: 'niveles-educativos', idField: 'id_nivel_educativo', nameField: 'descripcion', type: 'number' },
  { name: 'nucleos', idField: 'id_nucleo', nameField: 'nombre_nucleo', type: 'number', hasEstado: true },
  { name: 'condiciones-trabajo', idField: 'id_trabajo', nameField: 'nombre_trabajo', type: 'number' },
  { name: 'condiciones-actividad', idField: 'id_actividad', nameField: 'nombre_actividad', type: 'number' },
  { name: 'tipos-caracteristicas', idField: 'id_tipo', nameField: 'nombre_tipo_caracteristica', type: 'number' },
  { name: 'semestres', idField: 'term', nameField: 'term', type: 'string', isTerm: true },
  { name: 'municipios', idField: 'num_municipio', nameField: 'nombre_municipio', type: 'number', hasEstado: true },
  { name: 'parroquias', idField: 'num_parroquia', nameField: 'nombre_parroquia', type: 'number', hasEstado: true, hasMunicipio: true },
  { name: 'categorias', idField: 'num_categoria', nameField: 'nombre_categoria', type: 'number', hasMateria: true },
  { name: 'subcategorias', idField: 'num_subcategoria', nameField: 'nombre_subcategoria', type: 'number', hasMateria: true, hasCategoria: true },
  { name: 'ambitos-legales', idField: 'num_ambito_legal', nameField: 'nombre_ambito_legal', type: 'number', hasMateria: true, hasCategoria: true, hasSubcategoria: true },
  { name: 'caracteristicas', idField: 'num_caracteristica', nameField: 'descripcion', type: 'number', hasTipo: true },
];

const baseDir = path.join(__dirname, '..', 'lib', 'db', 'queries');

catalogs.forEach(catalog => {
  const fileName = `auditoria-insercion-${catalog.name}.queries.ts`;
  const filePath = path.join(baseDir, fileName);

  let fields = `    ${catalog.idField}: ${catalog.type};
    ${catalog.nameField}: string;`;

  if (catalog.hasEstado) {
    fields += `\n    id_estado?: number;`;
  }
  if (catalog.hasMunicipio) {
    fields += `\n    num_municipio?: number;`;
  }
  if (catalog.hasMateria) {
    fields += `\n    id_materia?: number;`;
  }
  if (catalog.hasCategoria) {
    fields += `\n    num_categoria?: number;`;
  }
  if (catalog.hasSubcategoria) {
    fields += `\n    num_subcategoria?: number;`;
  }
  if (catalog.hasTipo) {
    fields += `\n    id_tipo_caracteristica?: number;`;
  }
  if (catalog.isTerm) {
    fields += `\n    fecha_inicio?: string | null;
    fecha_fin?: string | null;`;
  }

  const content = `import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaInsercion${catalog.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}
 */
export const auditoriaInsercion${catalog.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Queries = {
  /**
   * Obtiene el conteo total de ${catalog.name} insertados
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-insercion-${catalog.name}/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },

  /**
   * Obtiene todos los ${catalog.name} insertados con filtros opcionales
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idUsuario?: string;
    busqueda?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
${fields}
    habilitado: boolean | null;
    fecha_creacion: string;
    id_usuario_creo: string;
    nombres_usuario_creo: string | null;
    apellidos_usuario_creo: string | null;
    nombre_completo_usuario_creo: string | null;
    foto_perfil_usuario_creo: string | null;
  }>> => {
    const query = loadSQL('auditoria-insercion-${catalog.name}/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idUsuario || null,
      filters?.busqueda || null,
      filters?.orden || 'desc',
    ]);
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_creo: row.foto_perfil_usuario_creo 
        ? \`data:image/jpeg;base64,\${(row.foto_perfil_usuario_creo as Buffer).toString('base64')}\`
        : null,
    }));
  },
};
`;

  fs.writeFileSync(filePath, content);
  console.log(`✅ Creado helper para auditoria-insercion-${catalog.name}`);
});

console.log(`\n✅ Generados ${catalogs.length} helpers TypeScript de inserciones`);
