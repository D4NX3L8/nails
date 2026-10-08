import React, { ReactNode } from "react";
import { CalendarDays, Clock, ListChecks, Scissors } from "lucide-react";

export type Tab = "agendar" | "citas" | "servicios" | "horario";

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "agendar", label: "Agendar", icon: CalendarDays },
  { key: "citas", label: "Citas", icon: ListChecks },
  { key: "servicios", label: "Servicios", icon: Scissors },
  { key: "horario", label: "Horario", icon: Clock },
];

export default function Layout({
  tab,
  onTab,
  children,
}: {
  tab: Tab;
  onTab: (t: Tab) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory lg:flex">
      {/*
       * Sidebar (desktop)
       */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-line bg-white/70 backdrop-blur px-5 py-7">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1.5">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onTab(key)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                tab === key ? "bg-wine text-ivory shadow-soft" : "text-wine-dark hover:bg-blush/70"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 text-[11px] text-ink/40 leading-relaxed">
          Aplicación de agendamiento con almacenamiento local. Los datos se guardan en este navegador.
        </div>
      </aside>

      {/*
       * Contenido
       */}
      <div className="flex-1 min-w-0 pb-20 lg:pb-0">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10 pb-10">{children}</main>
      </div>

      {/*
       * Bottom nav (móvil)
       */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex lg:hidden bg-white border-t border-line px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTab(key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
              tab === key ? "text-wine" : "text-ink/40"
            }`}
          >
            <span
              className={`flex items-center justify-center rounded-full px-3 py-1 transition-colors ${
                tab === key ? "bg-blush" : "bg-transparent"
              }`}
            >
              <Icon size={19} />
            </span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-wine flex items-center justify-center shadow-soft">
        <span className="font-display text-xl text-ivory">N</span>
      </div>
      <div>
        <p className="font-display text-xl text-wine-dark leading-none">Nails</p>
        <p className="text-[10px] font-semibold text-ink/45 mt-0.5 tracking-wide uppercase">Estudio de manicura</p>
      </div>
    </div>
  );
}