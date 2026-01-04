import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const catalogs = [
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
  const tableName = `auditoria_eliminacion_${cat.name.replace(/-/g, '_')}`;
  const tableNameAct = `auditoria_actualizacion_${cat.name.replace(/-/g, '_')}`;
  
  // Eliminación get-all.sql
  const elimDir = join(baseDir, 'database', 'queries', `auditoria-eliminacion-${cat.name}`);
  mkdirSync(elimDir, { recursive: true });
  
  const elimFields = cat.hasComposite 
    ? `a.${cat.idField.split(', ').join(',\n    a.')},\n    a.${cat.nameField}`
    : `a.${cat.idField},\n    a.${cat.nameField}`;
  
  const elimSearch = cat.hasComposite
    ? cat.idField.split(', ').map(f => `OR a.${f}::TEXT ILIKE '%' || $4 || '%'`).join('\n        ')
    : `OR a.${cat.idField}::TEXT ILIKE '%' || $4 || '%'\n        OR a.${cat.nameField} ILIKE '%' || $4 || '%'`;
  
  const elimAllSQL = `-- Obtener todos los ${cat.name.replace(/-/g, ' ')} eliminados con filtros opcionales
SELECT 
    a.id,
    ${elimFields},
    a.habilitado,
    ${cat.name === 'nucleos' ? 'a.id_estado,\n    a.num_municipio,\n    a.num_parroquia,' : ''}
    a.fecha_eliminacion,
    a.id_usuario_elimino,
    u.nombres AS nombres_usuario_elimino,
    u.apellidos AS apellidos_usuario_elimino,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_elimino,
    u.foto_perfil AS foto_perfil_usuario_elimino,
    a.motivo
FROM ${tableName} a
LEFT JOIN usuarios u ON a.id_usuario_elimino = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_eliminacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_eliminacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_elimino = $3)
    AND (
        $4::TEXT IS NULL 
        ${elimSearch}
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_eliminacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_eliminacion END ASC NULLS FIRST;
`;
  
  writeFileSync(join(elimDir, 'get-all.sql'), elimAllSQL);
  writeFileSync(join(elimDir, 'get-count.sql'), `-- Obtener el conteo total de ${cat.name.replace(/-/g, ' ')} eliminados\nSELECT COUNT(*) as total\nFROM ${tableName};\n`);
  
  // Actualización get-all.sql
  const actDir = join(baseDir, 'database', 'queries', `auditoria-actualizacion-${cat.name}`);
  mkdirSync(actDir, { recursive: true });
  
  const actFields = cat.hasComposite
    ? cat.idField.split(', ').map(f => `a.${f}`).join(',\n    ')
    : `a.${cat.idField}`;
  
  const actNameFields = cat.name === 'semestres' 
    ? 'a.fecha_inicio_anterior,\n    a.fecha_inicio_nuevo,\n    a.fecha_fin_anterior,\n    a.fecha_fin_nuevo'
    : `a.${cat.nameField}_anterior,\n    a.${cat.nameField}_nuevo`;
  
  const actSearch = cat.hasComposite
    ? cat.idField.split(', ').map(f => `OR a.${f}::TEXT ILIKE '%' || $4 || '%'`).join('\n        ') + `\n        OR a.${cat.nameField}_anterior ILIKE '%' || $4 || '%'\n        OR a.${cat.nameField}_nuevo ILIKE '%' || $4 || '%'`
    : `OR a.${cat.idField}::TEXT ILIKE '%' || $4 || '%'\n        OR a.${cat.nameField}_anterior ILIKE '%' || $4 || '%'\n        OR a.${cat.nameField}_nuevo ILIKE '%' || $4 || '%'`;
  
  const actAllSQL = `-- Obtener todas las actualizaciones de ${cat.name.replace(/-/g, ' ')} con filtros opcionales
SELECT 
    a.id,
    ${actFields},
    ${actNameFields},
    a.habilitado_anterior,
    a.habilitado_nuevo,
    ${cat.name === 'nucleos' ? 'a.id_estado_anterior,\n    a.id_estado_nuevo,\n    a.num_municipio_anterior,\n    a.num_municipio_nuevo,\n    a.num_parroquia_anterior,\n    a.num_parroquia_nuevo,' : ''}
    a.fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM ${tableNameAct} a
LEFT JOIN usuarios u ON a.id_usuario_actualizo = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        ${actSearch}
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
`;
  
  writeFileSync(join(actDir, 'get-all.sql'), actAllSQL);
  writeFileSync(join(actDir, 'get-count.sql'), `-- Obtener el conteo total de ${cat.name.replace(/-/g, ' ')} actualizados\nSELECT COUNT(*) as total\nFROM ${tableNameAct};\n`);
});

console.log('✅ Queries SQL creados para todos los catálogos');
