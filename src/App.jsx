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
import Settings from './components/Settings';
import { useFocusTimer } from './hooks/useFocusTimer';
import { getItem, setItem } from './lib/storage';
import { getProfile } from './lib/profile';
import { dailyQuote } from './lib/quotes';

const NAV_ITEMS = [
  { to: '/', label: 'dashboard', end: true },
  { to: '/reminders', label: 'reminders' },
  { to: '/tasks', label: 'tasks' },
  { to: '/focus', label: 'focus' },
  { to: '/braindump', label: 'brain dump' },
  { to: '/habits', label: 'habits' },
  { to: '/stats', label: 'stats' },
  { to: '/calendar', label: 'calendar' },
  { to: '/settings', label: 'settings' },
];

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'good morning';
  if (h < 18) return 'good afternoon';
  return 'good evening';
}

export default function App() {
  const [theme, setTheme] = useState(() => getItem('theme', 'light'));
  const [tasks, setTasks] = useState(() => getItem('tasks', []));
  const [sessionLog, setSessionLog] = useState(() => getItem('sessionLog', []));
  const [profile, setProfile] = useState(() => getProfile());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    setItem('theme', theme);
  }, [theme]);

  useEffect(() => { setItem('tasks', tasks); }, [tasks]);
  useEffect(() => { setItem('sessionLog', sessionLog); }, [sessionLog]);
  useEffect(() => {
    document.documentElement.setAttribute('data-palette', profile.palette);
    document.documentElement.setAttribute('data-font', profile.font);
    setItem('profile', profile);
  }, [profile]);

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

  const tagline = profile.heroTagline.trim() || dailyQuote();
  const heroLine = profile.userName.trim() ? `${timeGreeting()}, ${profile.userName.trim()} — ${tagline}` : tagline;

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
          <span className="sparkle" role="img" aria-label="sparkle">{profile.sparkle}</span>
          <Link to="/" className="hero-title-link"><h1>{profile.heroTitle || 'my focus dashboard'}</h1></Link>
          <p>{heroLine}</p>
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
        <Route path="/settings" element={<Page><Settings profile={profile} onChange={setProfile} /></Page>} />
      </Routes>
    </BrowserRouter>
  );
}
