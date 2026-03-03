export interface AtencionUsuario {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  fecha_registro: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string; // Formato HH:mm
  caseId: number; // ID numérico del caso para filtrado preciso
  caseDetail: string;
  client: string;
  clientCedula: string;
  location: string;
  orientation: string; // Orientación de la cita
  attendingUsers: string; // String con nombres separados por comas (para display)
  attendingUsersList: AtencionUsuario[]; // Array completo con todos los usuarios que atendieron
  isMultiplePeople: boolean; // Indica si son múltiples personas (derivado de attendingUsersList.length > 1)
  nextAppointmentDate?: string | null; // Fecha de próxima cita
}

