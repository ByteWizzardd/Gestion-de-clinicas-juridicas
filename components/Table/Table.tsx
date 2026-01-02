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
  hideDelete
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

  return (
    <>
      <TableContainer>
        <TableHeader title={columns} />
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
              />
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
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
        onPageChange={setCurrentPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </>
  );
}