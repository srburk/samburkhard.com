import * as stylex from '@stylexjs/stylex';

export const colors = stylex.defineVars({
  text: {
    default: '#101517',
    '@media (prefers-color-scheme: dark)': '#ffffff',
  },
  background: {
    default: '#ffffff',
    '@media (prefers-color-scheme: dark)': '#101517',
  },
  accent: {
    default: '#115995',
    '@media (prefers-color-scheme: dark)': '#5AB9EA',
  },
  codeBackground: {
    default: '#f5f5f5',
    '@media (prefers-color-scheme: dark)': '#1a2024',
  },
  codeBorder: {
    default: 'color-mix(in srgb, #101517 12%, transparent)',
    '@media (prefers-color-scheme: dark)': 'color-mix(in srgb, #ffffff 12%, transparent)',
  },
  codeLang: {
    default: 'color-mix(in srgb, #101517 55%, transparent)',
    '@media (prefers-color-scheme: dark)': 'color-mix(in srgb, #ffffff 55%, transparent)',
  },
  synComment: {
    default: '#6b7280',
    '@media (prefers-color-scheme: dark)': '#8b949e',
  },
  synKeyword: {
    default: '#115995',
    '@media (prefers-color-scheme: dark)': '#5AB9EA',
  },
  synString: {
    default: '#0f7b4c',
    '@media (prefers-color-scheme: dark)': '#7ee787',
  },
  synNumber: {
    default: '#b45309',
    '@media (prefers-color-scheme: dark)': '#f0b429',
  },
  synFunction: {
    default: '#6d28d9',
    '@media (prefers-color-scheme: dark)': '#d2a8ff',
  },
  synClass: {
    default: '#6d28d9',
    '@media (prefers-color-scheme: dark)': '#d2a8ff',
  },
  synBuiltin: {
    default: '#0369a1',
    '@media (prefers-color-scheme: dark)': '#79c0ff',
  },
  synTag: {
    default: '#0f7b4c',
    '@media (prefers-color-scheme: dark)': '#7ee787',
  },
  synAttr: {
    default: '#6d28d9',
    '@media (prefers-color-scheme: dark)': '#d2a8ff',
  },
  synError: {
    default: '#dc2626',
    '@media (prefers-color-scheme: dark)': '#ff7b72',
  },
});

export const fonts = stylex.defineVars({
  sans: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
});
