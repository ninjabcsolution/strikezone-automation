/**
 * SVG Icons component to replace emojis for consistent rendering
 */

// Checkmark icon (replaces ✅ and ✓)
export const CheckIcon = ({ size = 16, color = '#10b981', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M8 12l2.5 2.5L16 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// X/Close icon (replaces ❌ and ×)
export const CloseIcon = ({ size = 16, color = '#ef4444', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Warning icon (replaces ⚠️)
export const WarningIcon = ({ size = 16, color = '#f59e0b', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M12 2L2 20h20L12 2z" fill={color} />
    <path d="M12 9v4M12 16v1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Chart/Analytics icon (replaces 📊)
export const ChartIcon = ({ size = 16, color = '#6366f1', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill={color} opacity="0.2" />
    <rect x="5" y="10" width="3" height="9" rx="1" fill={color} />
    <rect x="10.5" y="6" width="3" height="13" rx="1" fill={color} />
    <rect x="16" y="12" width="3" height="7" rx="1" fill={color} />
  </svg>
);

// Trending Up icon (replaces 📈)
export const TrendingUpIcon = ({ size = 16, color = '#10b981', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M22 7l-8.5 8.5-5-5L2 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7h6v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Trending Down icon (replaces 📉)
export const TrendingDownIcon = ({ size = 16, color = '#ef4444', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M22 17l-8.5-8.5-5 5L2 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17h6v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Target icon (replaces 🎯)
export const TargetIcon = ({ size = 16, color = '#2563eb', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

// Dollar/Money icon (replaces 💰)
export const MoneyIcon = ({ size = 16, color = '#10b981', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M12 6v12M8 9h6a2 2 0 010 4H9a2 2 0 100 4h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// List/Clipboard icon (replaces 📋)
export const ClipboardIcon = ({ size = 16, color = '#6366f1', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <rect x="5" y="3" width="14" height="18" rx="2" stroke={color} strokeWidth="2" />
    <path d="M9 7h6M9 11h6M9 15h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Refresh/Sync icon (replaces 🔄)
export const RefreshIcon = ({ size = 16, color = '#6366f1', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M21 12a9 9 0 01-9 9m-9-9a9 9 0 019-9" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 3l5 3-5 3M8 21l-5-3 5-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Star icon for highlights
export const StarIcon = ({ size = 16, color = '#f59e0b', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// Crown icon for Top 20%
export const CrownIcon = ({ size = 16, color = '#f59e0b', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <path d="M2 8l5 12h10l5-12-6 3-4-6-4 6-6-3z" />
    <rect x="4" y="20" width="16" height="2" rx="1" />
  </svg>
);

// Users icon
export const UsersIcon = ({ size = 16, color = '#6366f1', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={color} strokeWidth="2" />
    <circle cx="17" cy="7" r="3" stroke={color} strokeWidth="2" />
    <path d="M21 21v-2a3 3 0 00-2-2.83" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default {
  CheckIcon,
  CloseIcon,
  WarningIcon,
  ChartIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
  MoneyIcon,
  ClipboardIcon,
  RefreshIcon,
  StarIcon,
  CrownIcon,
  UsersIcon
};
