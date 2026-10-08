import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { DAY_SHORT, MONTH_NAMES, toDateStr, DaySchedule } from "../lib/dates";

const SView = styled(View);
const SText = styled(Text);
const STouchable = styled(TouchableOpacity);

type Props = {
  scheduleByWeekday: Record<number, DaySchedule>;
  selectedDate: Date | null;
  onSelectDate: (d: Date) => void;
  minToday?: boolean;
};

export default function MonthCalendar({ scheduleByWeekday, selectedDate, onSelectDate, minToday = true }: Props) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const todayStr = toDateStr(today);

  return (
    <SView>
      <SView className="flex-row items-center justify-between mb-3">
        <STouchable
          onPress={() => setCursor(new Date(year, month - 1, 1))}
          className="w-7 h-7 rounded-full items-center justify-center bg-blush"
        >
          <ChevronLeft size={14} color="#511F2E" />
        </STouchable>
        <SText className="font-display text-sm text-wine-dark">
          {MONTH_NAMES[month]} {year}
        </SText>
        <STouchable
          onPress={() => setCursor(new Date(year, month + 1, 1))}
          className="w-7 h-7 rounded-full items-center justify-center bg-blush"
        >
          <ChevronRight size={14} color="#511F2E" />
        </STouchable>
      </SView>

      <SView className="flex-row mb-1">
        {DAY_SHORT.map((d) => (
          <SView key={d} style={{ width: `${100 / 7}%` }}>
            <SText className="text-center text-[10px] font-bold text-[#B7A9A3]">{d}</SText>
          </SView>
        ))}
      </SView>

      <SView className="flex-row flex-wrap">
        {cells.map((d, i) => {
          if (!d) return <SView key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const works = scheduleByWeekday[d.getDay()]?.works;
          const isPast = minToday && toDateStr(d) < todayStr;
          const disabled = !works || isPast;
          const selected = selectedDate && toDateStr(d) === toDateStr(selectedDate);
          const isToday = toDateStr(d) === todayStr;
          return (
            <SView key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
              <STouchable
                disabled={disabled}
                onPress={() => onSelectDate(d)}
                className="flex-1 rounded-xl items-center justify-center"
                style={{
                  backgroundColor: selected ? "#6E2A3D" : isToday ? "#F4DEDA" : "transparent",
                  opacity: disabled ? 0.35 : 1,
                }}
              >
                <SText
                  className="text-xs font-semibold"
                  style={{ color: selected ? "#FBF5F0" : "#2B211F" }}
                >
                  {d.getDate()}
                </SText>
              </STouchable>
            </SView>
          );
        })}
      </SView>
    </SView>
  );
}
