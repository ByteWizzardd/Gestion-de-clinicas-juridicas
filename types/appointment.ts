export interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string; // Formato HH:mm
  caseDetail: string;
  client: string;
  location: string;
}

