import { dateKey } from './date';

export const EVENT_CATEGORIES = [
  { key: 'birthday', label: 'birthday', icon: '🎂' },
  { key: 'holiday', label: 'holiday', icon: '🎉' },
  { key: 'anniversary', label: 'anniversary', icon: '💍' },
  { key: 'reminder', label: 'reminder', icon: '📌' },
  { key: 'other', label: 'other', icon: '⭐' },
];

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function eventsOnDate(events, date) {
  const key = dateKey(date);
  return events.filter(e => {
    if (e.repeats) {
      const evDate = parseDateKey(e.date);
      return evDate.getMonth() === date.getMonth() && evDate.getDate() === date.getDate();
    }
    return e.date === key;
  });
}

// Next time this event occurs on/after `from` (midnight-aligned), or null if it's a one-time event already past.
export function nextOccurrence(event, from) {
  const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const evDate = parseDateKey(event.date);
  if (!event.repeats) {
    return evDate >= fromDay ? evDate : null;
  }
  let candidate = new Date(fromDay.getFullYear(), evDate.getMonth(), evDate.getDate());
  if (candidate < fromDay) candidate = new Date(fromDay.getFullYear() + 1, evDate.getMonth(), evDate.getDate());
  return candidate;
}

export function upcomingEvents(events, from = new Date(), limit = 3) {
  return events
    .map(e => ({ event: e, date: nextOccurrence(e, from) }))
    .filter(x => x.date)
    .sort((a, b) => a.date - b.date)
    .slice(0, limit)
    .map(x => ({ ...x, daysAway: Math.round((x.date - new Date(from.getFullYear(), from.getMonth(), from.getDate())) / 86400000) }));
}
