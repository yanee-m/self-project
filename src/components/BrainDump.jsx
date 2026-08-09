import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItem, setItem } from '../lib/storage';

export default function BrainDump() {
  const [notes, setNotes] = useState(() => getItem('braindump', []));
  const [input, setInput] = useState('');

  useEffect(() => { setItem('braindump', notes); }, [notes]);

  function addNote() {
    const text = input.trim();
    if (!text) return;
    setNotes(prev => [...prev, { id: Date.now() + Math.random(), text, createdAt: Date.now() }]);
    setInput('');
  }
  function removeNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  const ordered = notes.slice().reverse();

  return (
    <div className="card" id="braindump">
      <h3>brain dump</h3>
      <div id="braindump-list">
        {ordered.length === 0 ? (
          <div className="dump-empty">nothing captured yet</div>
        ) : (
          ordered.map(d => (
            <div key={d.id} className="dump-row">
              <span>{d.text}</span>
              <button aria-label="delete note" onClick={() => removeNote(d.id)}>×</button>
            </div>
          ))
        )}
      </div>
      <div className="reminder-add">
        <input
          type="text"
          placeholder="jot something down…"
          maxLength={140}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addNote(); }}
        />
        <button onClick={addNote}>+</button>
      </div>
    </div>
  );
}

export function BrainDumpSummary() {
  const notes = getItem('braindump', []);
  const stat = notes.length === 0 ? 'nothing captured yet' : `${notes.length} note${notes.length === 1 ? '' : 's'} captured`;

  return (
    <Link to="/braindump" className="card tile">
      <h3>brain dump</h3>
      <p className="tile-stat">{stat}</p>
      <span className="tile-cta">view →</span>
    </Link>
  );
}
