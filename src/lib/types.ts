export type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  active: boolean;
};

export type ApptStatus = "pendiente" | "confirmada" | "completada" | "cancelada";

export type Appointment = {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  clientName: string;
  notes: string;
  images: string[]; // data URLs (comprimidas)
  status: ApptStatus;
  createdAt: string; // ISO
};

export type DaySchedule = {
  works: boolean;
  start: string;
  end: string;
  breakStart: string;
  breakEnd: string;
};

export type Slot = { time: string; isBreak: boolean };