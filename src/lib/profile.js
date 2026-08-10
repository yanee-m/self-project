import { getItem } from './storage';

export const DEFAULT_PROFILE = {
  heroTitle: 'my focus dashboard',
  heroTagline: '',
  userName: '',
  sparkle: '✨',
  palette: 'pastel',
  font: 'typewriter',
};

export const SPARKLE_OPTIONS = ['✨', '🌱', '🔥', '⭐', '🌙', '☀️', '🍃', '💫'];
export const PALETTES = [
  { key: 'pastel', label: 'pastel' },
  { key: 'forest', label: 'forest' },
  { key: 'ocean', label: 'ocean' },
  { key: 'sunset', label: 'sunset' },
];
export const FONT_PAIRINGS = [
  { key: 'typewriter', label: 'typewriter' },
  { key: 'modern', label: 'modern' },
  { key: 'handwritten', label: 'handwritten' },
];
export const FONT_FAMILIES = {
  typewriter: { mono: "'Space Mono', ui-monospace, monospace", sans: "'Nunito', sans-serif" },
  modern: { mono: "'Sora', ui-sans-serif, sans-serif", sans: "'Inter', sans-serif" },
  handwritten: { mono: "'Patrick Hand', cursive", sans: "'Quicksand', sans-serif" },
};

export function getProfile() {
  return { ...DEFAULT_PROFILE, ...getItem('profile', {}) };
}
