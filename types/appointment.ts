export interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string; // Formato HH:mm
  caseDetail: string;
  client: string;
  location: string;
  orientation: string; // Orientación de la cita
  attendingUsers?: string; // Usuarios que atendieron
  isMultiplePeople?: boolean; // Indica si son múltiples personas
  nextAppointmentDate?: string; // Fecha de próxima cita
}

