"use client";
import React, { useState } from "react";
import type { JSX } from "react";
import { TableContainer } from "@/components/Table/TableContainer";
import { TableHeader } from "@/components/Table/TableHeader";
import { TableRow } from "@/components/Table/TableRow";
import { TablePagination } from "@/components/Table/TablePagination";
import ActionMenu from "@/components/ui/ActionMenu";

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";

  if (typeof value === "boolean") return value ? "Sí" : "No";

  if (value instanceof Date) {
    return value.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  if (typeof value === "string") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (dateRegex.test(value)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    }
  }

  return String(value);
}

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
  idKey = 'cedula'
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
      {/* Vista móvil (cards) */}
      <div className="sm:hidden space-y-3">
        {pageData.length > 0 ? (
          pageData.map((row, idx) => {
            const entries = Object.entries(row);
            const rowId = String(row[idKey]);
            const isSelected = selectedIds.includes(rowId);
            const shouldHideEdit = hideEdit ? hideEdit(row) : false;
            const shouldHideDelete = hideDelete ? hideDelete(row) : false;

            return (
              <div
                key={startIdx + idx}
                className={`rounded-2xl border border-gray-200 p-4 shadow-sm ${idx % 2 === 1 ? 'bg-on-primary-light' : 'bg-white'} ${isSelected ? "ring-1 ring-primary/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {selectable ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                      />
                      <span className="text-sm text-gray-600">Seleccionar</span>
                    </label>
                  ) : (
                    <div />
                  )}

                  <div className="shrink-0">
                    {renderRowActions ? (
                      renderRowActions(row)
                    ) : (shouldHideEdit && shouldHideDelete && !actions) ? null : (
                      <ActionMenu
                        onView={onView ? () => onView(row) : undefined}
                        onEdit={!shouldHideEdit && onEdit ? () => onEdit(row) : undefined}
                        onDelete={!shouldHideDelete && onDelete ? () => onDelete(row) : undefined}
                        customActions={actions?.map(action => {
                          const label = typeof action.label === 'function' ? action.label(row) : action.label;
                          return {
                            label,
                            onClick: () => action.onClick(row)
                          };
                        })}
                      />
                    )}
                  </div>
                </div>

                <dl className="mt-3 space-y-2">
                  {entries.map(([key, value], cellIdx) => (
                    <div key={key} className="grid grid-cols-5 gap-2">
                      <dt className="col-span-2 text-xs font-medium text-gray-600">
                        {columns[cellIdx] ?? key}
                      </dt>
                      <dd className="col-span-3 text-sm text-foreground wrap-break-word">
                        {formatCellValue(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No se encontraron casos que coincidan con los filtros
          </div>
        )}
      </div>

      {/* Vista escritorio/tablet */}
      <div className="hidden sm:block">
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
                />
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (selectable ? 2 : 1)} className="text-center py-8 text-gray-500">
                  No se encontraron casos que coincidan con los filtros
                </td>
              </tr>
            )}
          </tbody>
        </TableContainer>
      </div>
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
