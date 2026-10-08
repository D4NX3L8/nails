import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  addAppointment,
  deleteAppointment as removeAppointment,
  loadAppointments,
  loadSchedule,
  loadServices,
  saveSchedule,
  saveServices,
  updateAppointment,
} from "./lib/storage";
import type { Appointment, DaySchedule, Service } from "./lib/types";

type DataContextValue = {
  services: Service[];
  appointments: Appointment[];
  schedule: Record<number, DaySchedule>;
  addService: (s: Service) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  removeService: (id: string) => void;
  book: (a: Appointment) => void;
  patchAppointment: (id: string, patch: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  updateSchedule: (weekday: number, patch: Partial<DaySchedule>) => void;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(() => loadServices());
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments());
  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>(() => loadSchedule());

  useEffect(() => {
    saveServices(services);
  }, [services]);

  useEffect(() => {
    // Mantiene otros archivos/pestañas sincronizados cuando el usuario cambia a otra pestaña.
    const onFocus = () => setAppointments(loadAppointments());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const value: DataContextValue = {
    services,
    appointments,
    schedule,
    addService: (s) => setServices(loadServices().concat(s)),
    updateService: (id, patch) =>
      setServices(loadServices().map((s) => (s.id === id ? { ...s, ...patch } : s))),
    removeService: (id) => {
      const next = loadServices().filter((s) => s.id !== id);
      setServices(next);
      saveServices(next);
    },
    book: (a) => setAppointments(addAppointment(a)),
    patchAppointment: (id, patch) => setAppointments(updateAppointment(id, patch)),
    removeAppointment: (id) => setAppointments(removeAppointment(id)),
    updateSchedule: (weekday, patch) => {
      const current = loadSchedule();
      const next = { ...current, [weekday]: { ...current[weekday], ...patch } };
      setSchedule(next);
      saveSchedule(next);
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
}