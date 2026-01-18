'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/feedback/Modal';
import Button from '@/components/ui/Button';
import MultiSelect from '@/components/forms/MultiSelect';
import { getEquipoDisponibleAction, asignarEquipoAction } from '@/app/actions/casos';
import { Users } from 'lucide-react';

interface AssignTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCaso: number;
  equipoActual?: Array<{
    tipo: 'profesor' | 'estudiante';
    cedula: string;
    nombre_completo: string;
    habilitado: boolean;
  }>;
  onSuccess?: () => void;
}

export default function AssignTeamModal({
  isOpen,
  onClose,
  idCaso,
  equipoActual = [],
  onSuccess
}: AssignTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profesoresDisponibles, setProfesoresDisponibles] = useState<Array<{
    cedula: string;
    nombre_completo: string;
  }>>([]);
  const [estudiantesDisponibles, setEstudiantesDisponibles] = useState<Array<{
    cedula: string;
    nombre_completo: string;
  }>>([]);
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState<string[]>([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<string[]>([]);

  // Cargar equipo disponible y establecer selecciones iniciales
  useEffect(() => {
    if (isOpen) {
      loadEquipoDisponible();
    }
  }, [isOpen]);

  const loadEquipoDisponible = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const result = await getEquipoDisponibleAction();

      if (!result.success) {
        setError(result.error?.message || 'Error al cargar equipo disponible');
        return;
      }

      if (result.data) {
        // Obtener profesores del semestre actual
        const profesoresDelTerm = result.data.profesores.map(p => ({
          cedula: p.cedula,
          nombre_completo: p.nombre_completo,
        }));

        // Obtener estudiantes del semestre actual
        const estudiantesDelTerm = result.data.estudiantes.map(e => ({
          cedula: e.cedula,
          nombre_completo: e.nombre_completo,
        }));

        // Obtener profesores actuales del equipo (solo habilitados)
        const profesoresActualesDelEquipo = equipoActual
          .filter(m => m.tipo === 'profesor' && m.habilitado === true)
          .map(m => ({
            cedula: m.cedula,
            nombre_completo: m.nombre_completo,
          }));

        // Obtener estudiantes actuales del equipo (solo habilitados)
        const estudiantesActualesDelEquipo = equipoActual
          .filter(m => m.tipo === 'estudiante' && m.habilitado === true)
          .map(m => ({
            cedula: m.cedula,
            nombre_completo: m.nombre_completo,
          }));

        // Combinar: miembros actuales + disponibles del semestre actual (sin duplicados)
        const profesoresCombinados = [
          ...profesoresActualesDelEquipo,
          ...profesoresDelTerm.filter(
            p => !profesoresActualesDelEquipo.some(pa => pa.cedula === p.cedula)
          ),
        ];

        const estudiantesCombinados = [
          ...estudiantesActualesDelEquipo,
          ...estudiantesDelTerm.filter(
            e => !estudiantesActualesDelEquipo.some(ea => ea.cedula === e.cedula)
          ),
        ];

        setProfesoresDisponibles(profesoresCombinados);
        setEstudiantesDisponibles(estudiantesCombinados);

        // Establecer selecciones iniciales basadas en el equipo actual
        const profesoresActuales = profesoresActualesDelEquipo.map(m => m.cedula);
        const estudiantesActuales = estudiantesActualesDelEquipo.map(m => m.cedula);

        setProfesoresSeleccionados(profesoresActuales);
        setEstudiantesSeleccionados(estudiantesActuales);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar equipo disponible');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      const result = await asignarEquipoAction(
        idCaso,
        profesoresSeleccionados,
        estudiantesSeleccionados
      );

      if (!result.success) {
        setError(result.error?.message || 'Error al asignar equipo');
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingData) {
      setError(null);
      setProfesoresSeleccionados([]);
      setEstudiantesSeleccionados([]);
      onClose();
    }
  };

  const profesoresOptions = profesoresDisponibles.map(p => ({
    value: p.cedula,
    label: p.nombre_completo,
  }));

  const estudiantesOptions = estudiantesDisponibles.map(e => ({
    value: e.cedula,
    label: e.nombre_completo,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={equipoActual.length > 0 ? "Modificar Equipo" : "Asignar Equipo"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="px-6 pb-6">
        {loadingData ? (
          <div className="py-8 text-center">
            <div className="text-gray-600">Cargando equipo disponible...</div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-base font-normal text-foreground mb-1">
                  Profesores Supervisores
                </label>
                <MultiSelect
                  options={profesoresOptions}
                  value={profesoresSeleccionados}
                  onChange={setProfesoresSeleccionados}
                  placeholder="Seleccionar profesores"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-base font-normal text-foreground mb-1">
                  Estudiantes
                </label>
                <MultiSelect
                  options={estudiantesOptions}
                  value={estudiantesSeleccionados}
                  onChange={setEstudiantesSeleccionados}
                  placeholder="Seleccionar estudiantes"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || loadingData}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || loadingData}
                isLoading={loading}
              >
                {equipoActual.length > 0 ? 'Actualizar Equipo' : 'Asignar Equipo'}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}