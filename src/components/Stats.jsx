import { Link } from 'react-router-dom';
import { AREAS } from '../lib/areas';
import { startOfWeek } from '../lib/date';

export default function Stats({ tasks, sessionLog }) {
  const start = startOfWeek().getTime();
  const tasksDone = tasks.filter(t => t.done && t.doneAt && t.doneAt >= start).length;
  const sessions = sessionLog.filter(ts => ts >= start).length;

  const byArea = {};
  tasks.forEach(t => {
    if (t.done && t.doneAt && t.doneAt >= start) {
      byArea[t.area] = (byArea[t.area] || 0) + 1;
    }
  });
  let topArea = '—';
  let topCount = 0;
  Object.keys(byArea).forEach(k => {
    if (byArea[k] > topCount) {
      topCount = byArea[k];
      const def = AREAS.find(a => a.key === k);
      topArea = def ? def.label : k;
    }
  });

  return (
    <div className="card" id="stats">
      <h3>this week</h3>
      <div className="stat-row"><span className="stat-num">{tasksDone}</span><span className="stat-label">tasks done</span></div>
      <div className="stat-row"><span className="stat-num">{sessions}</span><span className="stat-label">focus sessions</span></div>
      <div className="stat-row"><span className="stat-word">{topCount ? topArea : '—'}</span><span className="stat-label">top area</span></div>
    </div>
  );
}

export function StatsSummary({ tasks, sessionLog }) {
  const start = startOfWeek().getTime();
  const tasksDone = tasks.filter(t => t.done && t.doneAt && t.doneAt >= start).length;

  return (
    <Link to="/stats" className="card tile">
      <h3>stats</h3>
      <p className="tile-stat">{tasksDone} done this week</p>
      <span className="tile-cta">view →</span>
    </Link>
  );
}
