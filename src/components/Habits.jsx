import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItem, setItem } from '../lib/storage';
import { dateKey, habitStreak } from '../lib/date';

export default function Habits() {
  const [habits, setHabits] = useState(() => getItem('habits', []));
  const [input, setInput] = useState('');

  useEffect(() => { setItem('habits', habits); }, [habits]);

  function addHabit() {
    const name = input.trim();
    if (!name) return;
    setHabits(prev => [...prev, { id: Date.now() + Math.random(), name, history: [] }]);
    setInput('');
  }
  function removeHabit(id) {
    setHabits(prev => prev.filter(h => h.id !== id));
  }
  function toggleToday(id, key) {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const has = h.history.includes(key);
      return { ...h, history: has ? h.history.filter(k => k !== key) : [...h.history, key] };
    }));
  }

  const today = new Date();

  return (
    <div className="card" id="habits">
      <h3>habits</h3>
      <div id="habit-list">
        {habits.length === 0 ? (
          <div className="dump-empty">no habits yet</div>
        ) : (
          habits.map(h => {
            const streak = habitStreak(h.history);
            return (
              <div key={h.id} className="habit-row">
                <div className="habit-top">
                  <span className="habit-name">{h.name}</span>
                  <span className="habit-streak">{streak > 0 ? streak + 'd streak' : ''}</span>
                  <button className="habit-del" aria-label="delete habit" onClick={() => removeHabit(h.id)}>×</button>
                </div>
                <div className="habit-grid">
                  {Array.from({ length: 7 }, (_, idx) => {
                    const i = 6 - idx;
                    const d = new Date(today);
                    d.setDate(today.getDate() - i);
                    const key = dateKey(d);
                    const filled = h.history.includes(key);
                    const isToday = i === 0;
                    return (
                      <span
                        key={i}
                        className={'habit-day' + (filled ? ' filled' : '') + (isToday ? ' today' : '')}
                        role={isToday ? 'button' : undefined}
                        aria-label={isToday ? 'toggle today for ' + h.name : undefined}
                        onClick={isToday ? () => toggleToday(h.id, key) : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="reminder-add">
        <input
          type="text"
          placeholder="add a habit…"
          maxLength={40}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addHabit(); }}
        />
        <button onClick={addHabit}>+</button>
      </div>
    </div>
  );
}

export function HabitsSummary() {
  const habits = getItem('habits', []);
  const activeStreaks = habits.filter(h => habitStreak(h.history) > 0).length;
  const stat = habits.length === 0 ? 'no habits yet' : `${activeStreaks} active streak${activeStreaks === 1 ? '' : 's'}`;

  return (
    <Link to="/habits" className="card tile">
      <h3>habits</h3>
      <p className="tile-stat">{stat}</p>
      <span className="tile-cta">view →</span>
    </Link>
  );
}
