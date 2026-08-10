import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AREA_COLORS, DEFAULT_AREAS } from '../lib/areas';
import { getItem, setItem } from '../lib/storage';

export default function TaskBoard({ tasks, onAdd, onToggle, onDelete }) {
  const [areas, setAreas] = useState(() => getItem('taskAreas', DEFAULT_AREAS));
  const [title, setTitle] = useState('');
  const [area, setArea] = useState(areas[0]?.key || '');
  const [showManager, setShowManager] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(AREA_COLORS[0]);
  const [poppedId, setPoppedId] = useState(null);
  const popTimer = useRef(null);

  useEffect(() => { setItem('taskAreas', areas); }, [areas]);
  useEffect(() => {
    if (!areas.find(a => a.key === area)) setArea(areas[0]?.key || '');
  }, [areas, area]);
  useEffect(() => () => clearTimeout(popTimer.current), []);

  function handleAdd() {
    const t = title.trim();
    if (!t || !area) return;
    onAdd(t, area);
    setTitle('');
  }
  function handleToggle(id, wasDone) {
    onToggle(id);
    if (!wasDone) {
      setPoppedId(id);
      clearTimeout(popTimer.current);
      popTimer.current = setTimeout(() => setPoppedId(null), 600);
    }
  }

  function areaHasTasks(key) {
    return tasks.some(t => t.area === key);
  }
  function addArea() {
    const label = newLabel.trim();
    if (!label) return;
    const key = 'area-' + Date.now();
    setAreas(prev => [...prev, { key, label, icon: newIcon.trim() || '🏷️', color: newColor }]);
    setNewLabel('');
    setNewIcon('');
    setNewColor(AREA_COLORS[(areas.length + 1) % AREA_COLORS.length]);
  }
  function removeArea(key) {
    if (areaHasTasks(key)) return;
    setAreas(prev => prev.filter(a => a.key !== key));
  }
  function setAreaColor(key, color) {
    setAreas(prev => prev.map(a => (a.key === key ? { ...a, color } : a)));
  }
  function startEditLabel(a) {
    setEditingKey(a.key);
    setEditLabel(a.label);
  }
  function saveEditLabel() {
    const label = editLabel.trim();
    if (label) {
      setAreas(prev => prev.map(a => (a.key === editingKey ? { ...a, label } : a)));
    }
    setEditingKey(null);
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
          {areas.map(a => <option key={a.key} value={a.key}>{a.icon} {a.label}</option>)}
        </select>
        <button onClick={handleAdd}>add</button>
      </div>

      <button type="button" className="areas-toggle" onClick={() => setShowManager(s => !s)}>
        {showManager ? '‹ hide areas' : '✎ manage areas'}
      </button>

      {showManager && (
        <div className="areas-manager">
          {areas.map(a => (
            <div key={a.key} className="area-edit-row">
              <span className="area-icon">{a.icon}</span>
              {editingKey === a.key ? (
                <input
                  autoFocus
                  className="area-label-input"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  onBlur={saveEditLabel}
                  onKeyDown={e => { if (e.key === 'Enter') saveEditLabel(); }}
                  maxLength={24}
                />
              ) : (
                <span className="area-label" onClick={() => startEditLabel(a)}>{a.label}</span>
              )}
              <div className="swatch-row">
                {AREA_COLORS.map(c => (
                  <button
                    type="button"
                    key={c}
                    className={'swatch swatch-' + c + (a.color === c ? ' active' : '')}
                    aria-label={c}
                    onClick={() => setAreaColor(a.key, c)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="row-del"
                disabled={areaHasTasks(a.key)}
                title={areaHasTasks(a.key) ? 'move or delete its tasks first' : 'delete area'}
                onClick={() => removeArea(a.key)}
              >×</button>
            </div>
          ))}
          <div className="area-add-row">
            <input
              type="text"
              className="icon-input"
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
              maxLength={2}
              placeholder="🏷️"
              aria-label="area icon"
            />
            <input
              type="text"
              placeholder="new area name…"
              maxLength={24}
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addArea(); }}
            />
            <div className="swatch-row">
              {AREA_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  className={'swatch swatch-' + c + (newColor === c ? ' active' : '')}
                  aria-label={c}
                  onClick={() => setNewColor(c)}
                />
              ))}
            </div>
            <button type="button" onClick={addArea}>+</button>
          </div>
        </div>
      )}

      <div id="task-groups">
        {areas.map(a => {
          const items = tasks
            .filter(t => t.area === a.key)
            .sort((x, y) => (x.done === y.done ? y.createdAt - x.createdAt : (x.done ? 1 : -1)));
          return (
            <div key={a.key} className="list-group">
              <h3 className={'list-title lt-' + a.color}>{a.icon} {a.label}</h3>
              <div className="list-rows">
                {items.length === 0 ? (
                  <div className="row-empty">nothing here yet</div>
                ) : (
                  items.map(t => (
                    <div key={t.id} className={'row-item row-' + a.color + (t.done ? ' done' : '') + (poppedId === t.id ? ' pop' : '')}>
                      <span className="row-arrow" onClick={() => handleToggle(t.id, t.done)}>{t.done ? '✓' : '▸'}</span>
                      <span className="row-text" onClick={() => handleToggle(t.id, t.done)}>{t.title}</span>
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
