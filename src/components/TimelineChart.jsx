// src/components/TimelineChart.jsx
import React, { useMemo } from 'react';
import {
  parseISO,
  format,
  startOfHour,
  addHours,
  addMinutes,
  differenceInMinutes,
} from 'date-fns';

export default function TimelineChart({ appointments, userMap = {} }) {
  const sorted = useMemo(
    () => appointments.slice().sort((a, b) => new Date(a.datetime) - new Date(b.datetime)),
    [appointments]
  );

  const start = useMemo(() => {
    if (!sorted.length) return null;
    return startOfHour(parseISO(sorted[0].datetime));
  }, [sorted]);

  const end = useMemo(() => {
    if (!sorted.length) return null;
    let lastEnd = parseISO(sorted[0].datetime);
    sorted.forEach(appt => {
      const st = parseISO(appt.datetime);
      const en = new Date(st.getTime() + (appt.duration || 0) * 60000);
      if (en > lastEnd) lastEnd = en;
    });
    return addHours(startOfHour(lastEnd), 1);
  }, [sorted]);

  const hours = useMemo(() => {
    if (!start || !end) return [];
    const arr = [];
    let t = start;
    while (t <= end) {
      arr.push(t);
      t = addHours(t, 1);
    }
    return arr;
  }, [start, end]);

  const halfHours = useMemo(() => {
    if (!start || !end) return [];
    const arr = [];
    let t = start;
    while (t <= end) {
      arr.push(t);
      t = addMinutes(t, 30);
    }
    return arr;
  }, [start, end]);

  const pxPerMinute = 4;
  const totalMinutes = start && end ? differenceInMinutes(end, start) : 0;
  const width = totalMinutes * pxPerMinute;

  const offset = d => differenceInMinutes(d, start) * pxPerMinute;
  const height = 48 + 52;

  return (
    <div className="overflow-x-auto mb-6 p-4">
      <div className="relative" style={{ width, height }}>
        {halfHours.map(h => (
          <div
            key={`half-${h.getTime()}`}
            className="absolute border-l border-gray-100"
            style={{ left: offset(h), top: 24, bottom: 0 }}
          />
        ))}
        {hours.map(h => (
          <React.Fragment key={h.getTime()}>
            <div
              className="absolute top-0 text-gray-500 text-xs"
              style={{ left: offset(h) - 16 }}
            >
              {format(h, 'HH:mm')}
            </div>
            <div
              className="absolute border-l border-gray-200"
              style={{ left: offset(h), top: 16, bottom: 0 }}
            />
          </React.Fragment>
        ))}

        {sorted.map(appt => {
          const st = parseISO(appt.datetime);
          const en = new Date(st.getTime() + (appt.duration || 0) * 60000);
          const left = offset(st);
          const w = (appt.duration || 30) * pxPerMinute;
          const top = 20;
          const user = userMap[appt.clientId] || {};
          const clientName = user.firstName
            ? `${user.firstName} ${user.lastName}`
            : appt.clientEmail;
          return (
            <div
              key={appt.id}
              className="absolute bg-[#f1bc8a] rounded p-2 text-xs shadow"
              style={{ left, width: w, top }}
            >
              <div className="font-medium">
                {format(st, 'HH:mm')} - {format(en, 'HH:mm')}
              </div>
              <div className="text-gray-700">
                {appt.serviceName} - {clientName}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
