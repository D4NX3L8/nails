import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_SHORT, MONTH_NAMES, toDateStr } from "../lib/dates";
import type { DaySchedule } from "../lib/types";

type Props = {
  scheduleByWeekday: Record<number, DaySchedule>;
  selectedDate?: string | null;
  onSelectDate: (d: string) => void;
  minToday?: boolean;
};

export default function MonthCalendar({ scheduleByWeekday, selectedDate, onSelectDate, minToday = true }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateStr(today);

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toDateStr(new Date(year, month, d)));

  const canPrev = !minToday || cursor >= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-blush text-wine-dark hover:bg-line disabled:opacity-40 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="font-display text-sm text-wine-dark">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-blush text-wine-dark hover:bg-line transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_SHORT.map((d) => (
          <span key={d} className="text-center text-[10px] font-bold text-ink/40">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const date = new Date(d + "T00:00");
          const works = scheduleByWeekday[date.getDay()]?.works;
          const isPast = minToday && isBeforeToday(d, todayStr);
          const disabled = !works || isPast;
          const selected = d === selectedDate;
          const isToday = d === todayStr;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(d)}
              className="aspect-square rounded-xl text-sm font-semibold transition-all flex items-center justify-center disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose/40"
              style={{
                backgroundColor: selected ? "#6E2A3D" : isToday ? "#F4DEDA" : "transparent",
                color: selected ? "#FBF5F0" : "#2B211F",
                opacity: disabled ? 0.32 : 1,
              }}
            >
              {Number(d.slice(8, 10))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isBeforeToday(dateStr: string, todayStr: string) {
  return dateStr < todayStr;
}