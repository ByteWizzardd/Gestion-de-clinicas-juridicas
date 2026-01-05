const fs = require('fs');
const path = require('path');

const catalogs = [
  { name: 'materias', singular: 'Materia', plural: 'Materias', defaultTab: 'materias-insertadas' },
  { name: 'niveles-educativos', singular: 'Nivel Educativo', plural: 'Niveles Educativos', defaultTab: 'niveles-educativos-insertados' },
  { name: 'nucleos', singular: 'Núcleo', plural: 'Núcleos', defaultTab: 'nucleos-insertados' },
  { name: 'condiciones-trabajo', singular: 'Condición Trabajo', plural: 'Condiciones Trabajo', defaultTab: 'condiciones-trabajo-insertadas' },
  { name: 'condiciones-actividad', singular: 'Condición Actividad', plural: 'Condiciones Actividad', defaultTab: 'condiciones-actividad-insertadas' },
  { name: 'tipos-caracteristicas', singular: 'Tipo Característica', plural: 'Tipos Características', defaultTab: 'tipos-caracteristicas-insertados' },
  { name: 'semestres', singular: 'Semestre', plural: 'Semestres', defaultTab: 'semestres-insertados' },
  { name: 'municipios', singular: 'Municipio', plural: 'Municipios', defaultTab: 'municipios-insertados' },
  { name: 'parroquias', singular: 'Parroquia', plural: 'Parroquias', defaultTab: 'parroquias-insertadas' },
  { name: 'categorias', singular: 'Categoría', plural: 'Categorías', defaultTab: 'categorias-insertadas' },
  { name: 'subcategorias', singular: 'Subcategoría', plural: 'Subcategorías', defaultTab: 'subcategorias-insertadas' },
  { name: 'ambitos-legales', singular: 'Ámbito Legal', plural: 'Ámbitos Legales', defaultTab: 'ambitos-legales-insertados' },
  { name: 'caracteristicas', singular: 'Característica', plural: 'Características', defaultTab: 'caracteristicas-insertadas' },
];

const baseDir = path.join(process.cwd(), 'app', 'dashboard', 'audit', 'catalogos');

catalogs.forEach(catalog => {
  const filePath = path.join(baseDir, catalog.name, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    return;
  }

  const content = `import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function ${catalog.singular.replace(/\s+/g, '')}AuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div className="m-3">
      <AuditEntityDetailClient
        entityTitle="${catalog.plural}"
        entityDescription="Registro completo de todas las acciones realizadas sobre los ${catalog.name.replace(/-/g, ' ')} del sistema"
        defaultTab="${catalog.defaultTab}"
        operations={[
          {
            label: 'Insertados',
            auditType: '${catalog.name.replace(/-/g, '-')}-insertados',
            title: '${catalog.plural} Insertados',
            description: 'Registro completo de todos los ${catalog.name.replace(/-/g, ' ')} creados en el sistema',
            emptyMessage: 'No se encontraron ${catalog.name.replace(/-/g, ' ')} insertados'
          },
          {
            label: 'Actualizados',
            auditType: '${catalog.name.replace(/-/g, '-')}-actualizados',
            title: '${catalog.plural} Actualizados',
            description: 'Registro completo de todos los cambios realizados en los ${catalog.name.replace(/-/g, ' ')}',
            emptyMessage: 'No se encontraron ${catalog.name.replace(/-/g, ' ')} actualizados'
          },
          {
            label: 'Eliminados',
            auditType: '${catalog.name.replace(/-/g, '-')}-eliminados',
            title: '${catalog.plural} Eliminados',
            description: 'Registro completo de todos los ${catalog.name.replace(/-/g, ' ')} eliminados del sistema',
            emptyMessage: 'No se encontraron ${catalog.name.replace(/-/g, ' ')} eliminados'
          }
        ]}
      />
    </div>
  );
}
`;

  fs.writeFileSync(filePath, content);
  console.log(`✅ Actualizado: ${catalog.name}`);
});

console.log(`\n✅ Actualizadas ${catalogs.length} páginas de auditoría de catálogos`);
