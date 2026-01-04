'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { TablePagination } from '@/components/Table/TablePagination';
import AuditRecordCard from './AuditRecordCard';

type AuditRecordType = 'soporte' | 'cita-eliminada' | 'cita-actualizada' | 'cita-creada' | 'usuario-eliminado' | 'usuario-actualizado-campos'
  | 'estado-eliminado' | 'estado-actualizado' | 'estado-insertado'
  | 'materia-eliminada' | 'materia-actualizada' | 'materia-insertada'
  | 'nivel-educativo-eliminado' | 'nivel-educativo-actualizado' | 'nivel-educativo-insertado'
  | 'nucleo-eliminado' | 'nucleo-actualizado' | 'nucleo-insertado'
  | 'condicion-trabajo-eliminada' | 'condicion-trabajo-actualizada' | 'condicion-trabajo-insertada'
  | 'condicion-actividad-eliminada' | 'condicion-actividad-actualizada' | 'condicion-actividad-insertada'
  | 'tipo-caracteristica-eliminado' | 'tipo-caracteristica-actualizado' | 'tipo-caracteristica-insertado'
  | 'semestre-eliminado' | 'semestre-actualizado' | 'semestre-insertado'
  | 'municipio-eliminado' | 'municipio-actualizado' | 'municipio-insertado'
  | 'parroquia-eliminada' | 'parroquia-actualizada' | 'parroquia-insertada'
  | 'categoria-eliminada' | 'categoria-actualizada' | 'categoria-insertada'
  | 'subcategoria-eliminada' | 'subcategoria-actualizada' | 'subcategoria-insertada'
  | 'ambito-legal-eliminado' | 'ambito-legal-actualizado' | 'ambito-legal-insertado'
  | 'caracteristica-eliminada' | 'caracteristica-actualizada' | 'caracteristica-insertada';

interface AuditListProps {
  records: any[];
  recordType: AuditRecordType;
  emptyMessage?: string;
  rowsPerPage?: number;
}

export default function AuditList({
  records,
  recordType,
  emptyMessage = 'No se encontraron registros',
  rowsPerPage: initialRowsPerPage = 10,
}: AuditListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = Math.max(1, Math.ceil(records.length / rowsPerPage));

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return records.slice(startIndex, endIndex);
  }, [records, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [records.length, currentPage, totalPages, rowsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {paginatedRecords.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <AuditRecordCard record={record} type={recordType} />
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
}
