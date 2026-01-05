const fs = require('fs');
const path = require('path');

const catalogs = [
  { name: 'estados', idField: 'id_estado', nameField: 'nombre_estado' },
  { name: 'materias', idField: 'id_materia', nameField: 'nombre_materia' },
  { name: 'niveles-educativos', idField: 'id_nivel_educativo', nameField: 'descripcion', tableName: 'niveles_educativos' },
  { name: 'nucleos', idField: 'id_nucleo', nameField: 'nombre_nucleo' },
  { name: 'condiciones-trabajo', idField: 'id_trabajo', nameField: 'nombre_trabajo', tableName: 'condiciones_trabajo' },
  { name: 'condiciones-actividad', idField: 'id_actividad', nameField: 'nombre_actividad', tableName: 'condiciones_actividad' },
  { name: 'tipos-caracteristicas', idField: 'id_tipo', nameField: 'nombre_tipo_caracteristica', tableName: 'tipos_caracteristicas' },
  { name: 'semestres', idField: 'term', nameField: 'term', isTerm: true },
  { name: 'municipios', idField: 'num_municipio', nameField: 'nombre_municipio', hasEstado: true },
  { name: 'parroquias', idField: 'num_parroquia', nameField: 'nombre_parroquia', hasEstado: true, hasMunicipio: true },
  { name: 'categorias', idField: 'num_categoria', nameField: 'nombre_categoria', hasMateria: true },
  { name: 'subcategorias', idField: 'num_subcategoria', nameField: 'nombre_subcategoria', hasMateria: true, hasCategoria: true },
  { name: 'ambitos-legales', idField: 'num_ambito_legal', nameField: 'nombre_ambito_legal', hasMateria: true, hasCategoria: true, hasSubcategoria: true },
  { name: 'caracteristicas', idField: 'num_caracteristica', nameField: 'descripcion', hasTipo: true },
];

const baseDir = path.join(__dirname, '..', 'database', 'queries');

catalogs.forEach(catalog => {
  const dir = path.join(baseDir, `auditoria-insercion-${catalog.name}`);
  
  // Crear directorio si no existe
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // get-all.sql
  let getAllSQL = `-- Obtener todos los ${catalog.name} insertados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_creo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en ${catalog.idField}, ${catalog.nameField}
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.${catalog.idField},
    a.${catalog.nameField}`;

  if (catalog.hasEstado) {
    getAllSQL += `,
    a.id_estado`;
  }
  if (catalog.hasMunicipio) {
    getAllSQL += `,
    a.num_municipio`;
  }
  if (catalog.hasMateria) {
    getAllSQL += `,
    a.id_materia`;
  }
  if (catalog.hasCategoria) {
    getAllSQL += `,
    a.num_categoria`;
  }
  if (catalog.hasSubcategoria) {
    getAllSQL += `,
    a.num_subcategoria`;
  }
  if (catalog.hasTipo) {
    getAllSQL += `,
    a.id_tipo_caracteristica`;
  }
  if (catalog.isTerm) {
    getAllSQL += `,
    a.fecha_inicio,
    a.fecha_fin`;
  }

  getAllSQL += `,
    a.habilitado,
    a.fecha_creacion,
    a.id_usuario_creo,
    u.nombres AS nombres_usuario_creo,
    u.apellidos AS apellidos_usuario_creo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_creo,
    u.foto_perfil AS foto_perfil_usuario_creo
FROM auditoria_insercion_${catalog.name.replace(/-/g, '_')} a
LEFT JOIN usuarios u ON a.id_usuario_creo = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_creo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.${catalog.idField}::TEXT ILIKE '%' || $4 || '%'
        OR a.${catalog.nameField} ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST;
`;

  // get-count.sql
  const getCountSQL = `-- Obtener el conteo total de ${catalog.name} insertados
SELECT COUNT(*) as total
FROM auditoria_insercion_${catalog.name.replace(/-/g, '_')};
`;

  // Escribir archivos
  fs.writeFileSync(path.join(dir, 'get-all.sql'), getAllSQL);
  fs.writeFileSync(path.join(dir, 'get-count.sql'), getCountSQL);

  console.log(`✅ Creadas queries para auditoria-insercion-${catalog.name}`);
});

console.log(`\n✅ Generadas ${catalogs.length} queries SQL de inserciones`);
