"use client";
import React, { useState } from "react";
import { TableContainer } from "./TableContainer";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { TablePagination } from "./TablePagination";
interface TableProps<T> {
  data: T[];
  rowsPerPage?: number;
  columns: string[];
  onView?: (data: T) => void;
  onEdit?: (data: T) => void;
  onDelete?: (data: T) => void;
}

export default function Table<T extends Record<string, unknown>>({ 
  data, 
  rowsPerPage: initialRowsPerPage = 10, 
  columns,
  onView,
  onEdit,
  onDelete
}: TableProps<T>) {

  // Paginación visual: no oculta filas, solo navega visualmente
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = initialRowsPerPage;
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  // Cuando cambias de página, hace scroll automático a la tabla
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll a la tabla (ajusta el selector si tu tabla tiene un id diferente)
    const table = document.querySelector('table');
    if (table) {
      table.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <TableContainer>
        <TableHeader title={columns}/>
        <tbody className="border-t-2 border-t-transparent">
          {data.map((row, idx) => (
            <TableRow 
              key={idx} 
              data={row} 
              rowIndex={idx}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </TableContainer>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={() => {}}
      />
    </>
  );
}
