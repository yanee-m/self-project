import { getItem } from './storage';

export const AREA_COLORS = ['pink', 'lav', 'blue', 'mint', 'sun'];

export const DEFAULT_AREAS = [
  { key: 'work', label: 'work', icon: '💼', color: 'blue' },
  { key: 'study', label: 'study', icon: '📚', color: 'lav' },
  { key: 'personal', label: 'personal', icon: '🌱', color: 'pink' },
  { key: 'side', label: 'side project', icon: '🚀', color: 'mint' },
];

// Read-only snapshot for components that don't own area state themselves (e.g. Stats).
export function getAreas() {
  return getItem('taskAreas', DEFAULT_AREAS);
}

export const MODES = {
  focus: { label: 'focus', minutes: 25 },
  short: { label: 'short break', minutes: 5 },
  long: { label: 'long break', minutes: 15 },
};
