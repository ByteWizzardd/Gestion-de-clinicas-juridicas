"use client";
import React, { useState } from "react";
import { TableContainer } from "@/components/table/TableContainer";
import { TableHeader } from "@/components/table/TableHeader";
import { TableRow } from "@/components/table/TableRow";
import { TablePagination } from "@/components/table/TablePagination";
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

  // Paginación: calcular qué datos mostrar según la página actual
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));

  // Calcular el rango de datos a mostrar
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Resetear a la página 1 cuando cambian los datos o las filas por página
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, totalPages, rowsPerPage]);

  // Manejar cambio de filas por página
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Resetear a la primera página cuando cambia el número de filas
  };

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
    <div className="relative overflow-visible">
      <TableContainer>
        <TableHeader title={columns}/>
        <tbody className="border-t-2 border-t-transparent">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, idx) => (
              <TableRow 
                key={startIndex + idx} 
                data={row} 
                rowIndex={startIndex + idx}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
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
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
}
