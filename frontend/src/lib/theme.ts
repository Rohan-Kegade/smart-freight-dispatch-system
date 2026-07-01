export type ThemeName = 'dark' | 'light';

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export interface ThemePalette {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  border2: string;
  text: string;
  muted: string;
  faint: string;
  accent: string;
  accentDim: string;
  accentLine: string;
  accentSoft: string;
  accentText: string;
  success: string;
  successDim: string;
  warn: string;
  warnDim: string;
}

export const palettes: Record<ThemeName, ThemePalette> = {
  dark: {
    bg: '#090d13',
    surface: '#11171f',
    surface2: '#18212c',
    surface3: '#232f3c',
    border: 'rgba(255,255,255,.08)',
    border2: 'rgba(255,255,255,.15)',
    text: '#eaf0f6',
    muted: '#8a97a6',
    faint: '#5c6875',
    accent: '#5aa2f0',
    accentDim: 'rgba(90,162,240,0.14)',
    accentLine: 'rgba(90,162,240,0.45)',
    accentSoft: 'rgba(90,162,240,0.22)',
    accentText: '#071019',
    success: '#4fca8b',
    successDim: 'rgba(79,202,139,0.15)',
    warn: '#e0a35e',
    warnDim: 'rgba(224,163,94,0.15)',
  },
  light: {
    bg: '#f4f6f9',
    surface: '#ffffff',
    surface2: '#eef1f6',
    surface3: '#e3e8ef',
    border: 'rgba(15,23,42,.10)',
    border2: 'rgba(15,23,42,.18)',
    text: '#0f172a',
    muted: '#5b6779',
    faint: '#8b96a5',
    accent: '#2f6fe0',
    accentDim: 'rgba(47,111,224,0.10)',
    accentLine: 'rgba(47,111,224,0.35)',
    accentSoft: 'rgba(47,111,224,0.18)',
    accentText: '#ffffff',
    success: '#188a5a',
    successDim: 'rgba(24,138,90,0.12)',
    warn: '#a3660d',
    warnDim: 'rgba(163,102,13,0.12)',
  },
};

export type NavColorKey = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';

export interface NavColorSet {
  color: string;
  dim: string;
  line: string;
}

export const navColors: Record<ThemeName, Record<NavColorKey, NavColorSet>> = {
  dark: {
    blue:   { color: '#5aa2f0', dim: 'rgba(90,162,240,0.14)', line: 'rgba(90,162,240,0.45)' },
    purple: { color: '#a78bfa', dim: 'rgba(167,139,250,0.14)', line: 'rgba(167,139,250,0.45)' },
    green:  { color: '#4fca8b', dim: 'rgba(79,202,139,0.14)', line: 'rgba(79,202,139,0.45)' },
    orange: { color: '#e0a35e', dim: 'rgba(224,163,94,0.14)', line: 'rgba(224,163,94,0.45)' },
    pink:   { color: '#f472b6', dim: 'rgba(244,114,182,0.14)', line: 'rgba(244,114,182,0.45)' },
    teal:   { color: '#2dd4bf', dim: 'rgba(45,212,191,0.14)', line: 'rgba(45,212,191,0.45)' },
  },
  light: {
    blue:   { color: '#2f6fe0', dim: 'rgba(47,111,224,0.10)', line: 'rgba(47,111,224,0.35)' },
    purple: { color: '#7c3aed', dim: 'rgba(124,58,237,0.10)', line: 'rgba(124,58,237,0.35)' },
    green:  { color: '#188a5a', dim: 'rgba(24,138,90,0.10)', line: 'rgba(24,138,90,0.35)' },
    orange: { color: '#a3660d', dim: 'rgba(163,102,13,0.10)', line: 'rgba(163,102,13,0.35)' },
    pink:   { color: '#c0266f', dim: 'rgba(192,38,111,0.10)', line: 'rgba(192,38,111,0.35)' },
    teal:   { color: '#0f8f81', dim: 'rgba(15,143,129,0.10)', line: 'rgba(15,143,129,0.35)' },
  },
};
