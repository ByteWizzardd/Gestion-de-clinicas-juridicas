'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import Tabs from '@/components/ui/Tabs';
import AuditDetailClient from './detail/AuditDetailClient';

interface AuditOperation {
  label: string;
  auditType: 'soportes' | 'soportes-creados' | 'soportes-descargados' | 'citas-eliminadas' | 'citas-actualizadas' | 'citas-creadas' | 'usuarios-eliminados' | 'usuarios-habilitados' | 'usuarios-actualizados-campos' | 'usuarios-creados'
  | 'solicitantes-eliminados' | 'solicitantes-actualizados' | 'solicitantes-creados'
  | 'estudiantes-inscritos' | 'profesores-asignados'
  | 'casos-eliminados' | 'casos-actualizados' | 'casos-creados'
  | 'estados-eliminados' | 'estados-actualizados' | 'estados-insertados'
  | 'materias-eliminadas' | 'materias-actualizadas' | 'materias-insertadas'
  | 'niveles-educativos-eliminados' | 'niveles-educativos-actualizados' | 'niveles-educativos-insertados'
  | 'nucleos-eliminados' | 'nucleos-actualizados' | 'nucleos-insertados'
  | 'condiciones-trabajo-eliminadas' | 'condiciones-trabajo-actualizadas' | 'condiciones-trabajo-insertadas'
  | 'condiciones-actividad-eliminadas' | 'condiciones-actividad-actualizadas' | 'condiciones-actividad-insertadas'
  | 'tipos-caracteristicas-eliminados' | 'tipos-caracteristicas-actualizados' | 'tipos-caracteristicas-insertados'
  | 'semestres-eliminados' | 'semestres-actualizados' | 'semestres-insertados'
  | 'municipios-eliminados' | 'municipios-actualizados' | 'municipios-insertados'
  | 'parroquias-eliminadas' | 'parroquias-actualizadas' | 'parroquias-insertadas'
  | 'categorias-eliminadas' | 'categorias-actualizadas' | 'categorias-insertadas'
  | 'subcategorias-eliminadas' | 'subcategorias-actualizadas' | 'subcategorias-insertadas'
  | 'ambitos-legales-eliminados' | 'ambitos-legales-actualizados' | 'ambitos-legales-insertados'
  | 'caracteristicas-eliminadas' | 'caracteristicas-actualizadas' | 'caracteristicas-insertadas'
  | 'beneficiarios-eliminados' | 'beneficiarios-actualizados' | 'beneficiarios-creados'
  | 'acciones-creadas' | 'acciones-actualizadas' | 'acciones-eliminadas'
  | 'equipos-actualizados' | 'equipos-creados'
  | 'reportes-generados' | 'reportes-vista-previa';
  title: string;
  description: string;
  emptyMessage: string;
}

interface AuditEntityDetailClientProps {
  entityTitle: string;
  entityDescription: string;
  operations: AuditOperation[];
  defaultTab?: string;
  hideMainHeader?: boolean;
}

export default function AuditEntityDetailClient({
  entityTitle,
  entityDescription,
  operations,
  defaultTab,
  hideMainHeader = false
}: AuditEntityDetailClientProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Si viene el parámetro tab en la URL, usarlo como pestaña inicial
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      return tabParam;
    }
    // Si hay defaultTab, usarlo
    if (defaultTab) {
      return defaultTab;
    }
    // Por defecto, primera operación
    return operations[0]?.auditType || '';
  });

  // Crear tabs basados en las operaciones
  const tabs = operations.map((op) => ({
    id: op.auditType,
    label: op.label,
    content: (
      <AuditDetailClient
        title={op.title}
        description={op.description}
        auditType={op.auditType}
        emptyMessage={op.emptyMessage}
        hideHeader={true}
      />
    ),
  }));

  return (
    <div className="w-full">
      {/* Encabezado de la entidad */}
      {!hideMainHeader && (
        <div className="mb-4 md:mb-6 mt-4">
          <h1 className="text-4xl m-3 font-semibold font-primary">{entityTitle}</h1>
          <p className="mb-6 ml-3">{entityDescription}</p>
        </div>
      )}

      {/* Tabs con las operaciones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="px-0"
      >
        <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={setActiveTab} />
      </motion.div>
    </div>
  );
}
