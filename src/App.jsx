import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import TaskBoard from './components/TaskBoard';
import FocusTimer from './components/FocusTimer';
import RemindersCard from './components/RemindersCard';
import BrainDump from './components/BrainDump';
import Habits from './components/Habits';
import Stats from './components/Stats';
import Calendar from './components/Calendar';
import Page from './components/Page';
import Dashboard from './pages/Dashboard';
import { useFocusTimer } from './hooks/useFocusTimer';
import { getItem, setItem } from './lib/storage';

const NAV_ITEMS = [
  { to: '/', label: 'dashboard', end: true },
  { to: '/reminders', label: 'reminders' },
  { to: '/tasks', label: 'tasks' },
  { to: '/focus', label: 'focus' },
  { to: '/braindump', label: 'brain dump' },
  { to: '/habits', label: 'habits' },
  { to: '/stats', label: 'stats' },
  { to: '/calendar', label: 'calendar' },
];

export default function App() {
  const [theme, setTheme] = useState(() => getItem('theme', 'light'));
  const [tasks, setTasks] = useState(() => getItem('tasks', []));
  const [sessionLog, setSessionLog] = useState(() => getItem('sessionLog', []));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    setItem('theme', theme);
  }, [theme]);

  useEffect(() => { setItem('tasks', tasks); }, [tasks]);
  useEffect(() => { setItem('sessionLog', sessionLog); }, [sessionLog]);

  function addTask(title, area) {
    setTasks(prev => [
      ...prev,
      { id: Date.now() + Math.random(), title, area, done: false, createdAt: Date.now(), doneAt: null, focusSessions: 0 },
    ]);
  }
  function toggleTask(id) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? Date.now() : null } : t)));
  }
  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }
  function recordFocusSession(taskId) {
    setSessionLog(prev => [...prev, Date.now()]);
    if (taskId) {
      setTasks(prev => prev.map(t => (String(t.id) === String(taskId) ? { ...t, focusSessions: (t.focusSessions || 0) + 1 } : t)));
    }
  }

  // lives at the App level (not the /focus route) so the timer keeps running while you're on another page
  const timer = useFocusTimer(tasks, recordFocusSession);

  return (
    <BrowserRouter>
      <div className="hero">
        <button
          className="theme-toggle"
          aria-label="toggle dark mode"
          onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <div className="hero-inner">
          <svg className="sparkle" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2 C21 12 28 19 38 20 C28 21 21 28 20 38 C19 28 12 21 2 20 C12 19 19 12 20 2 Z" fill="currentColor" />
          </svg>
          <Link to="/" className="hero-title-link"><h1>my focus dashboard</h1></Link>
          <p>a small corner for tasks, reminders, and deep work</p>
        </div>
      </div>

      <div className="nav-bar-wrap">
        <nav className="nav-bar">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Routes>
        <Route path="/" element={<Dashboard tasks={tasks} sessionLog={sessionLog} timer={timer} />} />
        <Route path="/reminders" element={<Page><RemindersCard /></Page>} />
        <Route
          path="/tasks"
          element={<Page><TaskBoard tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} /></Page>}
        />
        <Route path="/focus" element={<Page><FocusTimer timer={timer} sessionsCompleted={sessionLog.length} /></Page>} />
        <Route path="/braindump" element={<Page><BrainDump /></Page>} />
        <Route path="/habits" element={<Page><Habits /></Page>} />
        <Route path="/stats" element={<Page><Stats tasks={tasks} sessionLog={sessionLog} /></Page>} />
        <Route path="/calendar" element={<Page><Calendar /></Page>} />
      </Routes>
    </BrowserRouter>
  );
}
