import { Link } from 'react-router-dom';
import { MODES } from '../lib/areas';

export default function FocusTimer({ timer, sessionsCompleted }) {
  const { mode, remaining, running, linkedTaskId, setLinkedTaskId, openTasks, linkedTask, start, pauseOrReset, changeMode } = timer;

  const now = new Date();
  let idleHour = now.getHours() % 12;
  if (idleHour === 0) idleHour = 12;
  const idleSuffix = now.getHours() >= 12 ? 'pm' : 'am';

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const blockA = running ? String(mins).padStart(2, '0') : String(idleHour).padStart(2, '0');
  const blockB = running ? String(secs).padStart(2, '0') : String(now.getMinutes()).padStart(2, '0');
  const labelA = running ? 'min' : idleSuffix;
  const labelB = running ? 'sec' : 'min';
  const noteText = running
    ? (linkedTask ? 'focus — ' + linkedTask.title : MODES[mode].label)
    : (linkedTask ? 'ready — ' + linkedTask.title : 'now — tap start to focus');

  const pipPos = sessionsCompleted % 4;

  return (
    <div className="focus-card" id="focus">
      <select
        className="focus-task-select"
        value={linkedTaskId}
        disabled={running}
        onChange={e => setLinkedTaskId(e.target.value)}
      >
        <option value="">no task — just focus</option>
        {openTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>
      <div className="mode-chips">
        {Object.keys(MODES).map(key => (
          <button
            key={key}
            className={mode === key ? 'active' : ''}
            disabled={running}
            onClick={() => changeMode(key)}
          >
            {MODES[key].minutes}m
          </button>
        ))}
      </div>
      <div className="blocks">
        <div className="block"><div className="n">{blockA}</div><div className="l">{labelA}</div></div>
        <div className="block"><div className="n">{blockB}</div><div className="l">{labelB}</div></div>
      </div>
      <div className="focus-note" title={linkedTask ? linkedTask.title : ''}>{noteText}</div>
      <div className="timer-controls">
        <button className="btn-start" onClick={() => (running ? pauseOrReset(false) : start())}>
          {running ? 'pause' : 'start'}
        </button>
        <button className="btn-reset" onClick={() => pauseOrReset(true)}>reset</button>
      </div>
      <div className="pips">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={'pip' + (i < pipPos ? ' filled' : '')} />
        ))}
      </div>
    </div>
  );
}

export function FocusSummary({ timer }) {
  const { mode, remaining, running, linkedTask } = timer;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const stat = running
    ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} · ${linkedTask ? linkedTask.title : MODES[mode].label}`
    : `${String(MODES[mode].minutes).padStart(2, '0')}:00 · ready`;

  return (
    <Link to="/focus" className="card tile">
      <h3>focus</h3>
      <p className="tile-stat">{stat}</p>
      <span className="tile-cta">{running ? 'open →' : 'start →'}</span>
    </Link>
  );
}
