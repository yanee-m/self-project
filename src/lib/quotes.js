export const QUOTES = [
  'a small corner for tasks, reminders, and deep work',
  'small steps, done daily, beat big plans left undone',
  'progress, not perfection',
  'one task at a time',
  'done is better than perfect',
  'protect your focus — it is precious',
  'today is a good day to start',
  'consistency beats intensity',
  'clear mind, clear list',
  'you do not need to see the whole staircase, just the first step',
  'small wins add up',
  'future you will thank present you',
];

export function dailyQuote(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
