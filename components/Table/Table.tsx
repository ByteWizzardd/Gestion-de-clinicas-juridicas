"use client";
import React, { useState } from "react";
import { TableContainer } from "@/components/Table/TableContainer";
import { TableHeader } from "@/components/Table/TableHeader";
import { TableRow } from "@/components/Table/TableRow";
import { TablePagination } from "@/components/Table/TablePagination";


interface TableProps<T> {
  data: T[];
  rowsPerPage?: number;
  columns: string[];
}

export default function Table<T extends Record<string, unknown>>({ data, rowsPerPage = 10, columns }: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const pageData = data.slice(startIdx, endIdx);
  
  return (
    <>
      <TableContainer>
        <TableHeader title={columns}/>
        <tbody className="border-t-2 border-t-transparent">
          {pageData.map((row, idx) => (
            <TableRow key={idx} data={row} rowIndex={startIdx + idx} />
          ))}
        </tbody>
      </TableContainer>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
