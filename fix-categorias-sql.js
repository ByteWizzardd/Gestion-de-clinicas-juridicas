const fs = require('fs');
const path = require('path');

const sqlContent = `-- Get all categorias with materia information
SELECT 
    c.id_materia,
    c.num_categoria,
    c.nombre_categoria,
    m.nombre_materia,
    c.id_categoria
FROM categorias c
JOIN materias m ON c.id_materia = m.id_materia
ORDER BY c.id_materia DESC, c.num_categoria DESC;
`;

const filePath = path.join(__dirname, 'database', 'queries', 'catalogos', 'get-all-categorias.sql');
fs.writeFileSync(filePath, sqlContent, 'utf8');
console.log('✅ File written successfully');
console.log('Content:', sqlContent);
