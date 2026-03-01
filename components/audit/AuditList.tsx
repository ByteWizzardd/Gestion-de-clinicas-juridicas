'use client';

import { useState, useMemo, useEffect } from 'react';
import { TablePagination } from '@/components/Table/TablePagination';
import AuditRecordCard from './AuditRecordCard';

import type { AuditRecordType } from '@/types/audit';

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
      <div className="bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)] p-8 text-center transition-colors">
        <p className="text-[var(--card-text-muted)] text-lg transition-colors">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {paginatedRecords.map((record, index) => (
          <AuditRecordCard
            key={`${record.id}-${index}`}
            record={record}
            type={record.tipo_registro ? (record.tipo_registro as any) : recordType}
          />
        ))}
      </div>

      {records.length > 0 && (
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
