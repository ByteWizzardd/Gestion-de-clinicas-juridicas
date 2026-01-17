'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/feedback/Modal';
import Button from '@/components/ui/Button';
import TextArea from '@/components/forms/TextArea';
import DatePicker from '@/components/forms/DatePicker';
import MultiSelect from '@/components/forms/MultiSelect';
import { createAccionAction, updateAccionAction } from '@/app/actions/casos';
import { getUsuariosAction } from '@/app/actions/usuarios';
import { X, Users, Calendar } from 'lucide-react';

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCaso: number;
  onSuccess?: () => void;
  editingAction?: {
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    ejecutores?: Array<{
      id_usuario_ejecuta: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  };
  onActionAdded?: () => void;
}

export default function AddActionModal({ isOpen, onClose, idCaso, onSuccess, editingAction, onActionAdded }: AddActionModalProps) {
  const [detalleAccion, setDetalleAccion] = useState('');
  const [comentario, setComentario] = useState('');
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<string[]>([]);
  const [fechaEjecucion, setFechaEjecucion] = useState('');
  const [usuarios, setUsuarios] = useState<Array<{ cedula: string; nombre_completo: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ detalleAccion?: string; ejecutores?: string; fechaEjecucion?: string }>({});

  // Determinar si es una acción de cita (no se puede cambiar caso ni fecha)
  const isCitaAction = editingAction?.detalle_accion?.startsWith('Cita realizada el');

  // Cargar usuarios disponibles al abrir el modal y datos de edición
  useEffect(() => {
    if (isOpen) {
      console.log('DEBUG AddActionModal - Modal opened, editingAction:', editingAction);
      loadUsuarios();
      if (editingAction) {
        console.log('DEBUG AddActionModal - Loading edit data:', {
          detalle_accion: editingAction.detalle_accion,
          comentario: editingAction.comentario,
          ejecutores: editingAction.ejecutores
        });
        // Cargar datos para edición
        setDetalleAccion(editingAction.detalle_accion || '');
        setComentario(editingAction.comentario || '');
        const ejecutoresIds = editingAction.ejecutores?.map(e => e.id_usuario_ejecuta) || [];
        const fechaEjec = editingAction.ejecutores?.[0]?.fecha_ejecucion || '';
        console.log('DEBUG AddActionModal - Setting form data:', {
          ejecutoresIds,
          fechaEjec
        });
        setUsuariosSeleccionados(ejecutoresIds);
        setFechaEjecucion(fechaEjec);
      } else {
        // Limpiar formulario para nueva acción
        setDetalleAccion('');
        setComentario('');
        setUsuariosSeleccionados([]);
        setFechaEjecucion('');
      }
    } else {
      // Limpiar cuando se cierra el modal
      setDetalleAccion('');
      setComentario('');
      setUsuariosSeleccionados([]);
      setFechaEjecucion('');
      setError(null);
      setErrors({});
    }
  }, [isOpen, editingAction]);

  const loadUsuarios = async () => {
    setLoadingData(true);
    setError(null);
    try {
      const result = await getUsuariosAction(true);
      if (!result.success) {
        setError(result.error?.message || 'Error al cargar usuarios disponibles');
        return;
      }

      if (result.data) {
        const usuariosList = result.data
          .map(u => ({
            cedula: u.cedula,
            nombre_completo: u.nombre_completo,
          }));
        setUsuarios(usuariosList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios disponibles');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    console.log('DEBUG AddActionModal - handleSubmit called at', new Date().toISOString(), {
      editingAction: !!editingAction,
      detalleAccion,
      comentario,
      fechaEjecucion,
      usuariosSeleccionados
    });

    // Validar detalle de acción
    if (!detalleAccion.trim()) {
      setErrors(prev => ({ ...prev, detalleAccion: 'Este campo es requerido' }));
      return;
    }

    // Validar usuarios seleccionados (solo si no está deshabilitado)
    if (!isCitaAction && usuariosSeleccionados.length === 0) {
      setErrors(prev => ({ ...prev, ejecutores: 'Debe seleccionar al menos un usuario' }));
      return;
    }

    // Validar fecha de ejecución (solo si no está deshabilitado)
    if (!isCitaAction && !fechaEjecucion) {
      setErrors(prev => ({ ...prev, fechaEjecucion: 'La fecha de ejecución es requerida' }));
      return;
    }

    // Validar que la fecha no sea futura (solo al registrar, no al editar)
    if (!editingAction && !isCitaAction && fechaEjecucion) {
      const fechaSeleccionada = new Date(fechaEjecucion + 'T00:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada > hoy) {
        setErrors(prev => ({ ...prev, fechaEjecucion: 'La fecha de ejecución no puede ser futura' }));
        return;
      }
    }

    setLoading(true);
    try {
      // Map multiple users to the same execution date
      const ejecutoresData = usuariosSeleccionados.map(idUsuario => ({
        idUsuario,
        fechaEjecucion,
      }));

      // Obtener la fecha actual del cliente en formato YYYY-MM-DD
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const fechaRegistro = `${year}-${month}-${day}`;

      let result;
      if (editingAction) {
        console.log('DEBUG AddActionModal - Updating action', {
          numAccion: editingAction.num_accion,
          idCaso,
          detalleAccion: detalleAccion.trim(),
          comentario: comentario.trim() || undefined,
          ejecutoresData
        });

        // Modo edición
        result = await updateAccionAction({
          numAccion: editingAction.num_accion,
          idCaso: idCaso,
          detalleAccion: detalleAccion.trim(),
          comentario: comentario.trim() || undefined,
          ejecutores: ejecutoresData,
        });

        if (!result.success) {
          setError(result.error?.message || 'Error al actualizar la acción');
          return;
        }
      } else {
        // Modo creación
        result = await createAccionAction(
          idCaso,
          detalleAccion.trim(),
          comentario.trim() || undefined,
          ejecutoresData,
          fechaRegistro
        );

        if (!result.success) {
          setError(result.error?.message || 'Error al crear la acción');
          return;
        }
      }

      // Limpiar formulario solo en modo creación
      if (!editingAction) {
        setDetalleAccion('');
        setComentario('');
        setUsuariosSeleccionados([]);
        setFechaEjecucion('');
      }
      setErrors({});
      console.log('DEBUG AddActionModal - handleSubmit completed successfully');
      onSuccess?.();
      onActionAdded?.();
      onClose();
    } catch (err) {
      console.log('DEBUG AddActionModal - handleSubmit failed:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la acción');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingData) {
      setDetalleAccion('');
      setComentario('');
      setUsuariosSeleccionados([]);
      setFechaEjecucion('');
      setError(null);
      setErrors({});
      onClose();
    }
  };

  const usuariosOptions = usuarios.map(u => ({
    value: u.cedula,
    label: u.nombre_completo,
  }));

  // Limpiar error cuando se modifica el detalle
  const handleDetalleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetalleAccion(e.target.value);
    if (errors.detalleAccion) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.detalleAccion;
        return newErrors;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="custom"
      className="rounded-[50px] max-w-[1100px] mx-auto"
      showCloseButton={false}
    >
      <div className="flex flex-col relative">
        {/* Header fijo */}
        <div className="flex-shrink-0 p-8 pb-4 relative border-b border-gray-200">
          {/* Botón de cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
            aria-label="Cerrar modal"
            disabled={loading || loadingData}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Título */}
          <h2 className="text-2xl font-normal text-foreground">
            {editingAction ? 'Editar Acción' : 'Registrar Nueva Acción'}
          </h2>

          {/* Nota para acciones de cita */}
          {isCitaAction && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Acción vinculada a cita:</strong> Algunos campos están deshabilitados para mantener la sincronización con la cita correspondiente.
              </p>
            </div>
          )}
        </div>

        {/* Área de contenido */}
        <div className="px-8 py-4">
          {loadingData ? (
            <div className="py-12 text-center">
              <div className="text-gray-600">Cargando usuarios disponibles...</div>
            </div>
          ) : (
            <>
              {/* Grid de formulario */}
              <form
                onSubmit={(e) => {
                  console.log('DEBUG AddActionModal - Form onSubmit triggered');
                  handleSubmit(e);
                }}
                noValidate
                className="grid grid-cols-2 gap-x-8 gap-y-4"
              >
                {/* Detalle de la Acción (ocupa todo el ancho) */}
                <div className="col-span-2">
                  <TextArea
                    label="Detalle de la Acción *"
                    value={detalleAccion}
                    onChange={handleDetalleChange}
                    error={errors.detalleAccion}
                    required
                    disabled={loading}
                    placeholder="Describa la acción realizada..."
                    rows={2}
                  />
                </div>

                {/* Comentario (ocupa todo el ancho) */}
                <div className="col-span-2">
                  <TextArea
                    label="Comentario"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    disabled={loading}
                    placeholder="Comentarios adicionales (opcional)..."
                    rows={2}
                  />
                </div>

                {/* Usuarios Ejecutores */}
                <div className="col-span-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-foreground mb-1 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Usuarios Ejecutores {isCitaAction ? '' : <span className="text-danger">*</span>}
                    </label>
                    <MultiSelect
                      options={usuariosOptions}
                      value={usuariosSeleccionados}
                      onChange={(values) => {
                        setUsuariosSeleccionados(values);
                        if (errors.ejecutores) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.ejecutores;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="Seleccionar usuarios..."
                      disabled={loading || isCitaAction}
                      error={errors.ejecutores}
                    />
                    {isCitaAction && (
                      <p className="text-xs text-gray-500 mt-1">
                        No se pueden modificar los ejecutores de acciones vinculadas a citas
                      </p>
                    )}
                  </div>
                </div>

                {/* Fecha de Ejecución */}
                <div className="col-span-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-foreground mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha de Ejecución {isCitaAction ? '' : <span className="text-danger">*</span>}
                    </label>
                    <DatePicker
                      value={fechaEjecucion}
                      onChange={(value) => {
                        setFechaEjecucion(value);
                        if (errors.fechaEjecucion) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.fechaEjecucion;
                            return newErrors;
                          });
                        }
                      }}
                      disabled={loading || isCitaAction}
                      required
                    />
                    {isCitaAction && (
                      <p className="text-xs text-gray-500 mt-1">
                        No se puede modificar la fecha de acciones vinculadas a citas
                      </p>
                    )}
                    {errors.fechaEjecucion && (
                      <p className="text-xs text-danger mt-1">{errors.fechaEjecucion}</p>
                    )}
                  </div>
                </div>

                {/* Mensaje de error general */}
                {error && (
                  <div className="col-span-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Botón de submit dentro del formulario */}
                <div className="col-span-2 flex justify-end pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="xl"
                    disabled={loading || loadingData}
                    isLoading={loading}
                  >
                    {editingAction ? 'Actualizar Acción' : 'Registrar Acción'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer fijo */}
        <div className="flex-shrink-0 flex flex-col border-t border-gray-200 px-8 py-4 bg-white">
          {/* Nota sobre campos obligatorios */}
          <div className="flex items-center gap-1">
            <span className="text-danger font-medium text-sm">*</span>
            <span className="text-sm text-gray-600">Campo obligatorio</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
