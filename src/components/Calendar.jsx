import { Link } from 'react-router-dom';

export default function Calendar() {
  const now = new Date();
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toLowerCase();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <div className="cal-card">
      <div className="cal-head">{monthLabel}</div>
      <div className="cal-grid">
        {['s', 'm', 't', 'w', 't', 'f', 's'].map((d, i) => <span key={i}>{d}</span>)}
        {Array.from({ length: firstDay }, (_, i) => <div key={'b' + i} className="day blank" />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          return <div key={d} className={'day' + (d === now.getDate() ? ' today' : '')}>{d}</div>;
        })}
      </div>
    </div>
  );
}

export function CalendarSummary() {
  const now = new Date();
  const label = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase();

  return (
    <Link to="/calendar" className="card tile">
      <h3>calendar</h3>
      <p className="tile-stat">{label}</p>
      <span className="tile-cta">view →</span>
    </Link>
  );
}
