'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import Tabs from '@/components/ui/Tabs';
import AuditDetailClient from './detail/AuditDetailClient';

interface AuditOperation {
  label: string;
  auditType: 'soportes' | 'soportes-creados' | 'citas-eliminadas' | 'citas-actualizadas' | 'citas-creadas' | 'usuarios-eliminados' | 'usuarios-actualizados-campos' | 'usuarios-creados'
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
  | 'acciones-creadas' | 'acciones-actualizadas' | 'acciones-eliminadas';
  title: string;
  description: string;
  emptyMessage: string;
}

interface AuditEntityDetailClientProps {
  entityTitle: string;
  entityDescription: string;
  operations: AuditOperation[];
  defaultTab?: string;
}

export default function AuditEntityDetailClient({
  entityTitle,
  entityDescription,
  operations,
  defaultTab
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl m-3 font-semibold font-primary">{entityTitle}</h1>
        <p className="mb-6 ml-3">{entityDescription}</p>
      </motion.div>

      {/* Tabs con las operaciones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={setActiveTab} />
      </motion.div>
    </div>
  );
}
