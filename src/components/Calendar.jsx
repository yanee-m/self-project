import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItem, setItem } from '../lib/storage';
import { dateKey } from '../lib/date';
import { EVENT_CATEGORIES, eventsOnDate, upcomingEvents, parseDateKey } from '../lib/calendarEvents';

export default function Calendar() {
  const today = new Date();
  const [events, setEvents] = useState(() => getItem('calendarEvents', []));
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [title, setTitle] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [categoryKey, setCategoryKey] = useState(EVENT_CATEGORIES[0].key);
  const [repeats, setRepeats] = useState(true);

  useEffect(() => { setItem('calendarEvents', events); }, [events]);

  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toLowerCase();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const category = EVENT_CATEGORIES.find(c => c.key === categoryKey) || EVENT_CATEGORIES[0];
  const resolvedIcon = customIcon.trim() || category.icon;

  function addEvent() {
    const t = title.trim();
    if (!t || !selectedDate) return;
    setEvents(prev => [
      ...prev,
      { id: Date.now() + Math.random(), date: selectedDate, title: t, icon: resolvedIcon, category: category.key, repeats },
    ]);
    setTitle('');
    setCustomIcon('');
  }
  function removeEvent(id) {
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  const selectedEvents = selectedDate ? eventsOnDate(events, parseDateKey(selectedDate)) : [];

  return (
    <>
      <div className="cal-card">
        <div className="cal-head">
          <button type="button" className="cal-nav" aria-label="previous month" onClick={() => setMonthOffset(o => o - 1)}>‹</button>
          <span>{monthLabel}</span>
          <button type="button" className="cal-nav" aria-label="next month" onClick={() => setMonthOffset(o => o + 1)}>›</button>
        </div>
        <div className="cal-grid">
          {['s', 'm', 't', 'w', 't', 'f', 's'].map((d, i) => <span key={i}>{d}</span>)}
          {Array.from({ length: firstDay }, (_, i) => <div key={'b' + i} className="day blank" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const cellDate = new Date(year, month, d);
            const key = dateKey(cellDate);
            const dayEvents = eventsOnDate(events, cellDate);
            const isToday = key === dateKey(today);
            const isSelected = key === selectedDate;
            return (
              <button
                type="button"
                key={d}
                className={'day' + (isToday ? ' today' : '') + (isSelected ? ' selected' : '')}
                onClick={() => setSelectedDate(key)}
              >
                <span className="day-num">{d}</span>
                {dayEvents.length > 0 && (
                  <span className="day-icons">
                    {dayEvents.slice(0, 3).map(e => <span key={e.id} className="day-icon">{e.icon}</span>)}
                    {dayEvents.length > 3 && <span className="day-icon-more">+{dayEvents.length - 3}</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="cal-day-panel">
          <h4>{parseDateKey(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h4>

          {selectedEvents.length === 0 ? (
            <div className="dump-empty">nothing saved for this date</div>
          ) : (
            <div className="event-list">
              {selectedEvents.map(e => (
                <div key={e.id} className="event-row">
                  <span className="event-icon">{e.icon}</span>
                  <span className="event-title">{e.title}</span>
                  {e.repeats && <span className="event-repeat" title="repeats every year">↻</span>}
                  <button className="row-del" aria-label="delete event" onClick={() => removeEvent(e.id)}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="category-picker">
            {EVENT_CATEGORIES.map(c => (
              <button
                type="button"
                key={c.key}
                className={'category-chip' + (categoryKey === c.key ? ' active' : '')}
                onClick={() => setCategoryKey(c.key)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <div className="event-add-row">
            <input
              type="text"
              className="icon-input"
              value={customIcon}
              onChange={e => setCustomIcon(e.target.value)}
              maxLength={2}
              placeholder={category.icon}
              aria-label="custom icon"
            />
            <input
              type="text"
              placeholder="add an event…"
              maxLength={60}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addEvent(); }}
            />
            <button onClick={addEvent}>+</button>
          </div>
          <label className="repeat-check">
            <input type="checkbox" checked={repeats} onChange={e => setRepeats(e.target.checked)} />
            repeats every year
          </label>
        </div>
      )}
    </>
  );
}

export function CalendarSummary() {
  const now = new Date();
  const events = getItem('calendarEvents', []);
  const next = upcomingEvents(events, now, 1)[0];

  let stat;
  if (next) {
    const away = next.daysAway === 0 ? 'today' : next.daysAway === 1 ? 'tomorrow' : `in ${next.daysAway}d`;
    stat = `${next.event.icon} ${next.event.title} · ${away}`;
  } else {
    stat = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase();
  }

  return (
    <Link to="/calendar" className="card tile">
      <h3>calendar</h3>
      <p className="tile-stat">{stat}</p>
      <span className="tile-cta">view →</span>
    </Link>
  );
}
