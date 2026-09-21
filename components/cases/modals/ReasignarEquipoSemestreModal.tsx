'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, AlertTriangle, CheckCircle2, Loader2, User, Users, Briefcase, ChevronDown } from 'lucide-react';
import Modal from '@/components/ui/feedback/Modal';
import { useToast } from '@/components/ui/feedback/ToastProvider';
import { getCasosConEquipoAnteriorAction, desasignarEquipoSemestreAnteriorAction } from '@/app/actions/casos';

interface CasoConEquipoAnterior {
  id_caso: number;
  nombre_solicitante: string;
  miembros: Array<{ tipo: string; nombre: string; cedula: string; term: string }>;
}

interface ReasignarEquipoSemestreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReasignarEquipoSemestreModal({
  isOpen,
  onClose,
  onSuccess,
}: ReasignarEquipoSemestreModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [casos, setCasos] = useState<CasoConEquipoAnterior[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [expandedCases, setExpandedCases] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadCasos();
    }
  }, [isOpen]);

  const loadCasos = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCasosConEquipoAnteriorAction();
      if (result.success && result.data) {
        setCasos(result.data);
        setSelectedIds(new Set(result.data.map((c) => c.id_caso)));
      } else {
        setError(result.error?.message || 'Error al cargar casos con equipo anterior');
      }
    } catch (err) {
      setError('Error al cargar casos');
    } finally {
      setLoading(false);
    }
  };

  const toggleCaseSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === casos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(casos.map((c) => c.id_caso)));
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCases(newExpanded);
  };

  const handleDesasignar = async () => {
    if (selectedIds.size === 0) {
      toast.warning('Selecciona al menos un caso para desasignar equipo', 'Selección requerida');
      return;
    }

    setProcessing(true);
    try {
      const result = await desasignarEquipoSemestreAnteriorAction(Array.from(selectedIds));
      if (result.success && result.data) {
        toast.success(`Se desasignó el equipo de ${result.data.casosDesasignados} caso(s)`, 'Cierre de semestre exitoso');
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.error?.message || 'Error al desasignar equipo', 'Error');
      }
    } catch (err) {
      toast.error('Error al desasignar equipo', 'Error inesperado');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Cierre de Semestre"
      size="custom"
      className="w-[95vw] sm:w-[90vw] lg:w-[85vw] max-w-4xl"
    >
      <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-start gap-3 transition-colors">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-[var(--foreground)]">Reasignación de Equipos</h4>
            <p className="text-sm text-[var(--card-text-muted)] mt-1">
              Los siguientes casos se encuentran "En proceso" pero tienen asignado un equipo (profesores y/o estudiantes) de un semestre anterior.
              Al continuar, se deshabilitará la asignación actual para que puedan ser reasignados con miembros del semestre activo. El historial de asignaciones se mantendrá.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-[var(--card-text-muted)]">Buscando casos...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadCasos}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && casos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h4 className="text-lg font-medium text-[var(--foreground)]">¡Excelente!</h4>
            <p className="text-[var(--card-text-muted)] mt-2">
              Todos los casos "En proceso" tienen su equipo asignado en el semestre actual ✓
            </p>
          </div>
        )}

        {!loading && !error && casos.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === casos.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-primary border-[var(--ui-border)] bg-[var(--background)] rounded focus:ring-primary transition-colors"
                />
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Seleccionar todos ({casos.length} casos)
                </span>
              </label>
              <span className="text-sm text-[var(--card-text-muted)]">
                {selectedIds.size} seleccionado(s)
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {casos.map((caso, index) => {
                  const isSelected = selectedIds.has(caso.id_caso);
                  const isExpanded = expandedCases.has(caso.id_caso);

                  return (
                    <motion.div
                      key={caso.id_caso}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className={`
                        border rounded-lg transition-all overflow-hidden
                        ${isSelected
                          ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                          : 'border-[var(--card-border)] hover:border-[var(--ui-border)] bg-[var(--card-bg)]'
                        }
                      `}
                    >
                      <div 
                        className="p-4 cursor-pointer flex items-start gap-3"
                        onClick={() => toggleCaseSelection(caso.id_caso)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCaseSelection(caso.id_caso)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-[var(--foreground)]">
                                Caso #{caso.id_caso}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                En proceso
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(caso.id_caso);
                              }}
                              className="text-[var(--card-text-muted)] hover:text-primary transition-colors flex items-center gap-1 text-xs px-2 py-1 rounded"
                            >
                              {caso.miembros.length} miembros
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-[var(--card-text-muted)]">
                            <User className="w-3 h-3" />
                            <span>Solicitante: {caso.nombre_solicitante}</span>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-[var(--card-border)] bg-[var(--ui-bg-inactive)]/50"
                          >
                            <div className="p-3 pl-11 space-y-2">
                              {caso.miembros.map((miembro, i) => (
                                <div key={i} className="flex flex-wrap items-center justify-between gap-2 text-sm bg-[var(--background)] border border-[var(--card-border)] p-2 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5 text-[var(--card-text-muted)]" />
                                    <span className="font-medium text-[var(--foreground)]">{miembro.nombre}</span>
                                    <span className="text-[var(--card-text-muted)]">({miembro.cedula})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                      {miembro.tipo}
                                    </span>
                                    <span className="text-xs font-mono px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-400">
                                      Semestre: {miembro.term}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {!loading && !error && casos.length > 0 && (
        <div className="border-t border-[var(--card-border)] p-4 flex justify-end gap-3 transition-colors">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--card-text-muted)] bg-[var(--ui-bg-inactive)] dark:bg-[var(--sidebar-hover)] rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors cursor-pointer"
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            onClick={handleDesasignar}
            disabled={selectedIds.size === 0 || processing}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2 transition-colors
              ${selectedIds.size === 0 || processing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
              }
            `}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Desasignando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Desasignar equipo en {selectedIds.size} caso(s)
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}
