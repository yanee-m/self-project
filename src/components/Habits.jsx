import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItem, setItem } from '../lib/storage';
import { dateKey, habitStreak } from '../lib/date';

const MILESTONES = [3, 7, 30];

export default function Habits() {
  const [habits, setHabits] = useState(() => getItem('habits', []));
  const [input, setInput] = useState('');
  const [icon, setIcon] = useState('');
  const [poppedId, setPoppedId] = useState(null);
  const [toast, setToast] = useState(null);
  const popTimer = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => { setItem('habits', habits); }, [habits]);
  useEffect(() => () => { clearTimeout(popTimer.current); clearTimeout(toastTimer.current); }, []);

  function addHabit() {
    const name = input.trim();
    if (!name) return;
    setHabits(prev => [...prev, { id: Date.now() + Math.random(), name, icon: icon.trim() || '⭐', history: [] }]);
    setInput('');
    setIcon('');
  }
  function removeHabit(id) {
    setHabits(prev => prev.filter(h => h.id !== id));
  }
  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }
  function toggleToday(id, key) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const has = habit.history.includes(key);
    const newHistory = has ? habit.history.filter(k => k !== key) : [...habit.history, key];
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, history: newHistory } : h)));

    if (!has) {
      setPoppedId(id);
      clearTimeout(popTimer.current);
      popTimer.current = setTimeout(() => setPoppedId(null), 600);

      const oldStreak = habitStreak(habit.history);
      const newStreak = habitStreak(newHistory);
      if (newStreak > oldStreak && MILESTONES.includes(newStreak)) {
        showToast(`🔥 ${newStreak} day streak on "${habit.name}"!`);
      }
    }
  }

  const today = new Date();

  return (
    <div className="card" id="habits">
      <h3>habits</h3>
      {toast && <div className="toast">{toast}</div>}
      <div id="habit-list">
        {habits.length === 0 ? (
          <div className="dump-empty">no habits yet</div>
        ) : (
          habits.map(h => {
            const streak = habitStreak(h.history);
            return (
              <div key={h.id} className={'habit-row' + (poppedId === h.id ? ' pop' : '')}>
                <div className="habit-top">
                  <span className="habit-icon">{h.icon || '⭐'}</span>
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
          className="icon-input"
          value={icon}
          onChange={e => setIcon(e.target.value)}
          maxLength={2}
          placeholder="⭐"
          aria-label="habit icon"
        />
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
