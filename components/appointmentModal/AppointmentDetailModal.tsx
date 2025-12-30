'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/feedback/Modal';
import { X, Calendar, Clock, User, MapPin, FileText } from 'lucide-react';
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
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
    return `${dayName}, ${day} de ${monthName} de ${year}`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      onClose();
    }, 200); // Coincide con la duración de la animación del Modal
  };

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
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Título */}
        <h2 className="text-2xl font-normal text-foreground mb-4">
          Detalles de la cita
        </h2>

        {/* Línea divisoria naranja */}
        <div className="border-b-2 border-secondary w-full mb-8"></div>

        {/* Grid de contenido */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 mb-8">
          {/* Título de la cita */}
          <div className="col-span-2">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Título de la cita
              </label>
              <p className="text-base text-gray-900">
                {appointment.title}
              </p>
            </div>
          </div>

          {/* Fecha */}
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Fecha
              </label>
              <p className="text-base text-gray-900">
                {formatDate(appointment.date)}
              </p>
            </div>
          </div>

          {/* Hora */}
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hora
              </label>
              <p className="text-base text-gray-900">
                {formatTime(appointment.time)}
              </p>
            </div>
          </div>

          {/* Cliente */}
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Cliente
              </label>
              <p className="text-base text-gray-900">
                {appointment.client}
              </p>
            </div>
          </div>

          {/* Ubicación */}
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Ubicación
              </label>
              <p className="text-base text-gray-900">
                {appointment.location}
              </p>
            </div>
          </div>
        </div>

        {/* Separador sutil */}
        <div className="border-b border-gray-200 mb-6"></div>

        <div className="grid grid-cols-1 gap-y-6">
          {/* Detalle del Caso */}
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-base font-normal text-foreground mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Detalle del caso
              </label>
              <div className="bg-neutral-50 rounded-3xl p-4 min-h-[80px]">
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {appointment.caseDetail}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
