'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/feedback/Modal';
import { X, Calendar, FileText, User } from 'lucide-react';
import type { Appointment } from '@/types/appointment';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetailModal({ appointment, isOpen, onClose }: AppointmentDetailModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  if (!appointment) return null;

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      onClose();
    }, 200); // Coincide con la duración de la animación del Modal
  };

  // Determinar si es una cita programada
  const isScheduledAppointment = appointment.orientation === "Cita programada";

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleClose}
      size="custom"
      className="rounded-[50px] max-w-[800px] mx-auto"
      showCloseButton={false}
    >
      <div className="p-12 relative">
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-4">
          {isScheduledAppointment ? 'Detalles de cita programada' : 'Detalles de la cita'}
        </h2>

        {/* Línea divisoria naranja */}
        <div className="border-b-2 border-secondary w-full mb-8"></div>

        {/* Contenido diferente según el tipo de cita */}
        {isScheduledAppointment ? (
          /* Vista para citas programadas */
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna 1 */}
            <div className="space-y-6">
              {/* Fecha de Encuentro */}
              <div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Fecha de Encuentro
                  </label>
                  <p className="text-base text-gray-900">
                    {formatDate(appointment.date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="space-y-6">
              {/* Personas que atenderán */}
              {appointment.attendingUsers && (
                <div>
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {appointment.isMultiplePeople ? 'Personas que atenderán' : 'Persona que atenderá'}
                    </label>
                    <p className="text-base text-gray-900">
                      {appointment.attendingUsers}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Caso relacionado - ocupa ambas columnas */}
            <div className="col-span-2">
              <div className="flex flex-col gap-1">
                <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Caso relacionado
                </label>
                <p className="text-base text-gray-900">
                  {appointment.caseDetail}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Vista para citas realizadas */
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Columna 1 */}
            <div className="space-y-6">
              {/* Fecha de la cita */}
              <div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Fecha de la cita
                  </label>
                  <p className="text-base text-gray-900">
                    {formatDate(appointment.date)}
                  </p>
                </div>
              </div>

              {/* Usuarios que atendieron */}
              {appointment.attendingUsers && (
                <div>
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      {appointment.isMultiplePeople ? 'Personas que atendieron' : 'Persona que atendió'}
                    </label>
                    <p className="text-base text-gray-900">
                      {appointment.attendingUsers}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Columna 2 */}
            <div className="space-y-6">
              {/* Caso relacionado */}
              <div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Caso relacionado
                  </label>
                  <p className="text-base text-gray-900">
                    {appointment.caseDetail}
                  </p>
                </div>
              </div>

              {/* Fecha de próxima cita */}
              {appointment.nextAppointmentDate && (
                <div>
                  <div className="flex flex-col gap-1">
                    <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Fecha de próxima cita
                    </label>
                    <p className="text-base text-gray-900">
                      {appointment.nextAppointmentDate}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Orientación - ocupa ambas columnas */}
            <div className="col-span-2">
              <div className="flex flex-col gap-1">
                <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Orientación
                </label>
                <p className="text-base text-gray-900">
                  {appointment.orientation}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
}
