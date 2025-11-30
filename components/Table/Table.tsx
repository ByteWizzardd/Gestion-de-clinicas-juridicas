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
        <TableHeader title={columns}/>
        <tbody className="border-t-2 border-t-transparent">
          {pageData.map((row, idx) => (
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
        onPageChange={setCurrentPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </>
  );
}
