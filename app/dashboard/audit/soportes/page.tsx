import { authorizeRole } from '@/lib/utils/auth-utils';
import AuditEntityDetailClient from '@/components/audit/AuditEntityDetailClient';

export const dynamic = 'force-dynamic';

export default async function SoportesAuditPage() {
  await authorizeRole(['coordinator']);

  return (
    <div>
      <AuditEntityDetailClient
        entityTitle="Soportes"
        entityDescription="Registro completo de todas las acciones realizadas sobre los documentos y archivos del sistema"
        defaultTab="soportes-creados"
        operations={[
          {
            label: 'Creados',
            auditType: 'soportes-creados',
            title: 'Soportes Creados',
            description: 'Registro completo de todos los documentos y archivos subidos al sistema',
            emptyMessage: 'No se encontraron soportes creados'
          },
          {
            label: 'Descargados',
            auditType: 'soportes-descargados',
            title: 'Descargas de Soportes',
            description: 'Registro de todas las descargas de documentos y archivos del sistema',
            emptyMessage: 'No se encontraron descargas de soportes'
          },
          {
            label: 'Eliminados',
            auditType: 'soportes',
            title: 'Soportes Eliminados',
            description: 'Registro completo de todos los documentos y archivos eliminados del sistema',
            emptyMessage: 'No se encontraron soportes eliminados'
          }
        ]}
      />
    </div>
  );
}
