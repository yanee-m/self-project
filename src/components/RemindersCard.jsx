import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItem, setItem } from '../lib/storage';

const DEFAULT_REMINDERS = [
  { id: 1, text: 'drink water', done: false },
  { id: 2, text: 'stretch or walk', done: false },
];

function computeBars() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayPct = ((now - startOfDay) / 86400000) * 100;

  const dow = now.getDay();
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - dow);
  const weekPct = ((now - startOfWeek) / (7 * 86400000)) * 100;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthPct = ((now.getDate() - 1 + (now - startOfDay) / 86400000) / daysInMonth) * 100;

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysInYear = (new Date(now.getFullYear() + 1, 0, 1) - startOfYear) / 86400000;
  const yearPct = ((now - startOfYear) / 86400000 / daysInYear) * 100;

  return [
    ['day', dayPct],
    ['week', weekPct],
    ['month', monthPct],
    ['year', yearPct],
  ];
}

export default function RemindersCard() {
  const [reminders, setReminders] = useState(() => getItem('reminders', DEFAULT_REMINDERS));
  const [input, setInput] = useState('');

  useEffect(() => { setItem('reminders', reminders); }, [reminders]);

  function addReminder() {
    const text = input.trim();
    if (!text) return;
    setReminders(prev => [...prev, { id: Date.now(), text, done: false }]);
    setInput('');
  }
  function toggleReminder(id) {
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, done: !r.done } : r)));
  }
  function removeReminder(id) {
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  const bars = computeBars();

  return (
    <div className="card" id="reminders">
      <h3>daily reminders</h3>
      <div id="reminder-list">
        {reminders.map(r => (
          <div key={r.id} className={'reminder-row' + (r.done ? ' done' : '')}>
            <input type="checkbox" checked={r.done} onChange={() => toggleReminder(r.id)} />
            <span>{r.text}</span>
            <button aria-label="remove reminder" onClick={() => removeReminder(r.id)}>×</button>
          </div>
        ))}
      </div>
      <div className="reminder-add">
        <input
          type="text"
          placeholder="add a reminder…"
          maxLength={60}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addReminder(); }}
        />
        <button onClick={addReminder}>+</button>
      </div>
      <div className="bars">
        {bars.map(([label, pct]) => {
          const clamped = Math.max(0, Math.min(100, pct));
          return (
            <div key={label} className="bar-row">
              <span className="bar-label">{label}</span>
              <span className="bar-track"><span className="bar-fill" style={{ width: clamped + '%' }} /></span>
              <span className="bar-pct">{Math.round(clamped)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RemindersSummary() {
  const reminders = getItem('reminders', DEFAULT_REMINDERS);
  const left = reminders.filter(r => !r.done).length;
  const stat = reminders.length === 0 ? 'no reminders yet' : left === 0 ? 'all done today' : `${left} left today`;

  return (
    <Link to="/reminders" className="card tile">
      <h3>reminders</h3>
      <p className="tile-stat">{stat}</p>
      <span className="tile-cta">view →</span>
    </Link>
  );
}
