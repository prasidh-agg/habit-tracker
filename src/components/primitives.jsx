import { ink, inkSoft, inkFaint, paper, accent, titleFont, handFont, monoFont } from '../constants.js';

export const Check = ({ state = 'empty', size = 18, onClick }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    style={{ flexShrink: 0, cursor: onClick ? 'pointer' : 'default' }}
    onClick={onClick}
  >
    <path
      d="M2.5 3 Q2 3.5 2.2 17.5 Q2.8 18 17.5 17.6 Q18 17 17.7 2.6 Q17 2 2.5 3 Z"
      fill="none"
      stroke={ink}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {state === 'checked' && (
      <path
        d="M4 10 Q7 13 9 14 Q12 9 16 4"
        fill="none"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {state === 'miss' && (
      <g stroke={inkSoft} strokeWidth="1.6" strokeLinecap="round">
        <line x1="5" y1="5" x2="15" y2="15" />
        <line x1="15" y1="5" x2="5" y2="15" />
      </g>
    )}
  </svg>
);

export const Dot = ({ state = 'empty' }) => (
  <svg width={12} height={12} viewBox="0 0 12 12">
    <circle
      cx="6"
      cy="6"
      r="4.5"
      fill={state === 'done' ? accent : 'transparent'}
      stroke={state === 'today' ? ink : inkFaint}
      strokeWidth={state === 'today' ? 1.6 : 1}
      strokeDasharray={state === 'miss' ? '1.5 1.5' : 'none'}
    />
  </svg>
);

export const Avatar = ({ letter, color = ink, size = 32 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '50%',
    border: `1.5px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: titleFont,
    fontSize: size * 0.55,
    color,
    background: paper,
    transform: 'rotate(-2deg)',
    flexShrink: 0,
  }}>
    {letter}
  </div>
);

export const Paper = ({ children, style }) => (
  <div style={{
    width: '100%',
    height: '100%',
    background: paper,
    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(31,26,20,0.04) 27px, rgba(31,26,20,0.04) 28px), radial-gradient(ellipse at top left, rgba(255,255,255,0.4), transparent 60%)`,
    color: ink,
    fontFamily: handFont,
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
    ...style,
  }}>
    {children}
  </div>
);

export const SketchBox = ({ children, style }) => (
  <div style={{ position: 'relative', padding: '12px 14px', ...style }}>
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        d="M0.6 1.2 Q50 0.3 99.4 1 Q99.2 50 99.6 99 Q50 99.5 0.4 98.8 Q0.8 50 0.6 1.2 Z"
        fill="none"
        stroke={ink}
        vectorEffect="non-scaling-stroke"
        style={{ strokeWidth: '1.4px' }}
      />
    </svg>
    <div style={{ position: 'relative' }}>{children}</div>
  </div>
);

export const Caption = ({ children, style }) => (
  <div style={{
    fontFamily: handFont,
    fontSize: 13,
    color: inkSoft,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 6,
    ...style,
  }}>
    {children}
  </div>
);
