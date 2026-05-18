// components/listing/OpeningHours.tsx
import type { OpeningHoursDay } from "@/types/listing";

interface Props {
  hours: OpeningHoursDay[];
}

const TODAY_MAP: Record<number, OpeningHoursDay["day"]> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export function OpeningHours({ hours }: Props) {
  const todayName = TODAY_MAP[new Date().getDay()];

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm" aria-labelledby="hours-heading">
      <h2 id="hours-heading" className="text-base font-semibold text-foreground">
        Opening hours
      </h2>
      <dl className="mt-3 space-y-1.5 text-sm">
        {hours.map((h) => {
          const isToday = h.day === todayName;
          return (
            <div
              key={h.day}
              className={`flex items-center justify-between ${isToday ? "font-medium text-foreground" : "text-muted-foreground"}`}
            >
              <dt>{h.day}</dt>
              <dd>{h.closed || !h.opens || !h.closes ? "Closed" : `${h.opens} – ${h.closes}`}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
