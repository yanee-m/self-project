import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AREAS } from '../lib/areas';

export default function TaskBoard({ tasks, onAdd, onToggle, onDelete }) {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('work');

  function handleAdd() {
    const t = title.trim();
    if (!t) return;
    onAdd(t, area);
    setTitle('');
  }

  return (
    <>
      <div className="add-row">
        <input
          type="text"
          placeholder="add a task…"
          maxLength={120}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
        />
        <select value={area} onChange={e => setArea(e.target.value)}>
          {AREAS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
        </select>
        <button onClick={handleAdd}>add</button>
      </div>
      <div id="task-groups">
        {AREAS.map(a => {
          const items = tasks
            .filter(t => t.area === a.key)
            .sort((x, y) => (x.done === y.done ? y.createdAt - x.createdAt : (x.done ? 1 : -1)));
          return (
            <div key={a.key} className="list-group">
              <h3 className={'list-title lt-' + a.key}>{a.label}</h3>
              <div className="list-rows">
                {items.length === 0 ? (
                  <div className="row-empty">nothing here yet</div>
                ) : (
                  items.map(t => (
                    <div key={t.id} className={'row-item row-' + a.key + (t.done ? ' done' : '')}>
                      <span className="row-arrow" onClick={() => onToggle(t.id)}>{t.done ? '✓' : '▸'}</span>
                      <span className="row-text" onClick={() => onToggle(t.id)}>{t.title}</span>
                      {t.focusSessions ? <span className="row-sessions">{t.focusSessions}×</span> : null}
                      <button className="row-del" aria-label="delete task" onClick={() => onDelete(t.id)}>×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function TasksSummary({ tasks }) {
  const open = tasks.filter(t => !t.done).length;
  const done = tasks.filter(t => t.done).length;
  const stat = tasks.length === 0 ? 'no tasks yet' : `${open} open · ${done} done`;

  return (
    <Link to="/tasks" className="card tile">
      <h3>tasks</h3>
      <p className="tile-stat">{stat}</p>
      <span className="tile-cta">view →</span>
    </Link>
  );
}
