import { useEffect, useState } from 'react';
import { MODES } from '../lib/areas';

const ORIGINAL_TITLE = 'my focus dashboard';

export function useFocusTimer(tasks, onSessionComplete) {
  const [mode, setMode] = useState('focus');
  const [remaining, setRemaining] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [, forceIdleTick] = useState(0);

  const totalSeconds = MODES[mode].minutes * 60;
  const openTasks = tasks.filter(t => !t.done);
  const linkedTask = tasks.find(t => String(t.id) === String(linkedTaskId));

  // drop the link if the task was completed or deleted elsewhere
  useEffect(() => {
    if (linkedTaskId && !openTasks.some(t => String(t.id) === String(linkedTaskId))) {
      setLinkedTaskId('');
    }
  }, [tasks, linkedTaskId]); // eslint-disable-line react-hooks/exhaustive-deps

  // idle clock re-renders every 15s so the time-of-day display stays fresh
  useEffect(() => {
    if (running) return;
    const id = setInterval(() => forceIdleTick(x => x + 1), 15000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      finishSession();
      return;
    }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [running, remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) {
      document.title = ORIGINAL_TITLE;
      return;
    }
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const label = linkedTask ? linkedTask.title : MODES[mode].label;
    document.title = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} · ${label}`;
  }, [remaining, running, mode, linkedTask]);

  function finishSession() {
    if (mode === 'focus') {
      onSessionComplete(linkedTaskId || null);
    }
    notifyDone();
    beep();
    setRunning(false);
    setRemaining(totalSeconds);
  }

  function notifyDone() {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const heading = mode === 'focus' ? 'focus session done' : MODES[mode].label + ' done';
    const body = linkedTask ? 'worked on: ' + linkedTask.title : 'take a short break before the next one';
    try { new Notification(heading, { body }); } catch { /* ignore */ }
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
    } catch { /* ignore */ }
  }

  function start() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setRunning(true);
  }
  function pauseOrReset(reset) {
    setRunning(false);
    if (reset) setRemaining(totalSeconds);
  }
  function changeMode(key) {
    if (running) return;
    setMode(key);
    setRemaining(MODES[key].minutes * 60);
  }

  return {
    mode,
    remaining,
    running,
    linkedTaskId,
    setLinkedTaskId,
    openTasks,
    linkedTask,
    start,
    pauseOrReset,
    changeMode,
  };
}
