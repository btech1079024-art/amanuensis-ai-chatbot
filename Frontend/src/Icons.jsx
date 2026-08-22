// Hand-drawn line icon set for Amanuensis.
// Simple stroke-based SVGs (currentColor) so they inherit color from CSS
// and stay visually consistent — no icon-font dependency.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconCompose({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M14.5 4.5l5 5L8 21H3v-5L14.5 4.5z" />
      <path d="M12.5 6.5l5 5" />
    </svg>
  );
}

export function IconSend({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M21 3L10.5 13.5" />
      <path d="M21 3l-7 18-4-8-8-4 19-6z" />
    </svg>
  );
}

export function IconTrash({ size = 16, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M4 7h16" />
      <path d="M9 7V4.6c0-.3.3-.6.6-.6h4.8c.3 0 .6.3.6.6V7" />
      <path d="M6 7l1 13.4c0 .9.7 1.6 1.6 1.6h6.8c.9 0 1.6-.7 1.6-1.6L18 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconUser({ size = 16, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.6-3.6 4.5-5.5 7.5-5.5s5.9 1.9 7.5 5.5" />
    </svg>
  );
}

export function IconChevronDown({ size = 12, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M5 8.5l7 7 7-7" />
    </svg>
  );
}

export function IconSettings({ size = 16, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a7.6 7.6 0 000-2l2-1.5-2-3.4-2.4 1a7.6 7.6 0 00-1.7-1L14.9 3h-4l-.4 2.6a7.6 7.6 0 00-1.7 1l-2.4-1-2 3.4L6.4 11a7.6 7.6 0 000 2l-2 1.5 2 3.4 2.4-1a7.6 7.6 0 001.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 001.7-1l2.4 1 2-3.4-2-1.5z" />
    </svg>
  );
}

export function IconSpark({ size = 16, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M12 3l1.8 5.6L19.5 10l-5.7 1.4L12 17l-1.8-5.6L4.5 10l5.7-1.4L12 3z" />
    </svg>
  );
}

export function IconLogout({ size = 16, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M9 21H5.6A1.6 1.6 0 014 19.4V4.6A1.6 1.6 0 015.6 3H9" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconMenu({ size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconMic({ size = 16, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0014 0" />
      <path d="M12 18v3" />
      <path d="M8.5 21h7" />
    </svg>
  );
}

export function IconVolume({ size = 15, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.5 9a5 5 0 010 6" />
      <path d="M19 7a8 8 0 010 10" />
    </svg>
  );
}

export function IconVolumeOff({ size = 15, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16 9l5 6M21 9l-5 6" />
    </svg>
  );
}

export function IconCopy({ size = 15, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <rect x="8" y="8" width="12" height="12" rx="2.2" />
      <path d="M16 8V6.2A2.2 2.2 0 0013.8 4H6.2A2.2 2.2 0 004 6.2v7.6A2.2 2.2 0 006.2 16H8" />
    </svg>
  );
}

export function IconCheck({ size = 15, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconRefresh({ size = 15, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <path d="M20 12a8 8 0 10-2.7 6" />
      <path d="M20 8v4h-4" />
    </svg>
  );
}

export function IconSwatches({ size = 15, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </svg>
  );
}