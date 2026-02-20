"use client";
import React, { useState } from "react";
import type { JSX } from "react";
import { TableContainer } from "@/components/Table/TableContainer";
import { TableHeader } from "@/components/Table/TableHeader";
import { TableRow } from "@/components/Table/TableRow";
import { TablePagination } from "@/components/Table/TablePagination";

interface TableProps<T> {
  data: T[];
  rowsPerPage?: number;
  columns: string[];
  onView?: (data: T) => void;
  onEdit?: (data: T) => void;
  onDelete?: (data: T) => void;
  actions?: {
    label: string | JSX.Element | ((data: T) => string | JSX.Element);
    onClick: (data: T) => void;
  }[];
  hideEdit?: (data: T) => boolean;
  hideDelete?: (data: T) => boolean;
  renderRowActions?: (data: T) => React.ReactNode;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  idKey?: string;
  keys?: string[];
}

export default function Table<T extends Record<string, unknown>>({
  data,
  rowsPerPage: initialRowsPerPage = 10,
  columns,
  onView,
  onEdit,
  onDelete,
  actions,
  hideEdit,
  hideDelete,
  renderRowActions,
  selectable,
  selectedIds = [],
  onSelectionChange,
  idKey = 'cedula',
  keys
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const pageData = data.slice(startIdx, endIdx);

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Resetear a la primera página cuando cambia el número de filas
  };

  // Cuando cambias de página, hace scroll automático a la tabla
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const table = document.querySelector('table');
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Manejar selección de todos los elementos de la página actual
  const allInPageSelected = pageData.length > 0 && pageData.every(row =>
    selectedIds.includes(String(row[idKey]))
  );

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    const pageIds = pageData.map(row => String(row[idKey]));
    if (checked) {
      // Añadir todos los IDs de la página que no estén ya seleccionados
      const newSelectedIds = [...new Set([...selectedIds, ...pageIds])];
      onSelectionChange(newSelectedIds);
    } else {
      // Quitar todos los IDs de la página
      const newSelectedIds = selectedIds.filter(id => !pageIds.includes(id));
      onSelectionChange(newSelectedIds);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Resetear a la página 1 cuando cambian los datos o las filas por página
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, totalPages, rowsPerPage]);

  return (
    <>
      <TableContainer>
        <TableHeader
          title={columns}
          selectable={selectable}
          onSelectAll={handleSelectAll}
          allSelected={allInPageSelected}
        />
        <tbody className="border-t-2 border-t-transparent">
          {pageData.length > 0 ? (
            pageData.map((row, idx) => (
              <TableRow
                key={startIdx + idx}
                data={row}
                rowIndex={startIdx + idx}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                actions={actions}
                hideEdit={hideEdit}
                hideDelete={hideDelete}
                renderRowActions={renderRowActions}
                selectable={selectable}
                isSelected={selectedIds.includes(String(row[idKey]))}
                onSelect={(checked) => handleSelectRow(String(row[idKey]), checked)}
                columnKeys={keys}
              />
            ))
          ) : (
            <tr className="border-none">
              <td colSpan={columns.length + (selectable ? 2 : 1)} className="text-center py-8 text-gray-500">
                No se encontraron casos que coincidan con los filtros
              </td>
            </tr>
          )}
        </tbody>
      </TableContainer>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </>
  );
}
