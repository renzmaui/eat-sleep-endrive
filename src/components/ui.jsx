import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ children }) => createPortal(children, document.body);
import { byId } from '../data';
import { sfx } from '../lib/sound';

/* ---------------- Image that never shows a broken icon ---------------- */
export function SafeImg({ src, alt = '', enchinId, className = '', ...rest }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed) {
    const e = enchinId ? byId(enchinId) : null;
    return (
      <span
        className={`img-fallback ${className}`}
        style={{ '--c': e?.color || '#ffd8b0' }}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      >
        {e ? e.name.slice(0, 1) : '✦'}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}

/* ---------------- Button with built-in click sound + double-click guard ---------------- */
export function Btn({ variant = 'primary', size, sound = 'tap', onClick, className = '', children, ...rest }) {
  const busy = useRef(false);
  return (
    <button
      type="button"
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`}
      onClick={(e) => {
        if (busy.current) return;
        busy.current = true;
        window.setTimeout(() => (busy.current = false), 350);
        if (sound && sfx[sound]) sfx[sound]();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Accessible modal ---------------- */
export function Modal({ open, title, children, onClose, actions, tone = 'default' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const t = window.setTimeout(() => {
      ref.current?.querySelector('[data-autofocus]')?.focus() || ref.current?.querySelector('button')?.focus();
    }, 30);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal modal-${tone}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={ref}>
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">{actions}</div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------------- Confetti burst ---------------- */
const CONFETTI_COLORS = ['#f48fb1', '#9b87f5', '#f8cf63', '#8ed8ef', '#8ed9b2', '#f4a36f', '#d52e45'];
export function Confetti({ count = 46 }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 1.8 + Math.random() * 1.4,
      rot: Math.random() * 360,
      drift: (Math.random() - 0.5) * 160,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: i % 3,
    })),
  );
  return createPortal(
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti-piece shape-${p.shape}`}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            '--rot': `${p.rot}deg`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>,
    document.body,
  );
}

/* ---------------- Icons (inline SVG, currentColor) ---------------- */
export const Icon = {
  x: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  ),
  music: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  ),
  sound: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  ),
  mute: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="m22 9-6 6M16 9l6 6" />
    </svg>
  ),
  restart: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="m5 12 5 5 9-10" />
    </svg>
  ),
  lock: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  arrow: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  back: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  ),
  save: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M4 17v3h16v-3" />
    </svg>
  ),
  skip: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M5 5v14l9-7zM15 5h3v14h-3z" />
    </svg>
  ),
  play: (p) => (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M7 4v16l13-8z" />
    </svg>
  ),
  map: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  ),
  close: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  wheel: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M3.5 10.5c3 .8 5.5.8 8.5.8s5.5 0 8.5-.8M12 14.5V21" />
    </svg>
  ),
  shuffle: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  ),
};

/* ---------------- Logo mark ---------------- */
export function Logo({ size = 40 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-label="EN-Drive logo" role="img">
      <circle cx="24" cy="24" r="21" fill="#ffcf5c" stroke="#18221f" strokeWidth="3.5" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="#18221f" strokeWidth="3.5" />
      <path d="M11 22c4.5 1.6 8.5 2 13 2s8.5-.4 13-2" fill="none" stroke="#18221f" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 27v10" stroke="#18221f" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 30.5c-2.6-2.3-5-3.8-5-6.2a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 2.4-2.4 3.9-5 6.2z" fill="#d52e45" stroke="#18221f" strokeWidth="2" strokeLinejoin="round" transform="translate(0 -6)" />
    </svg>
  );
}

export function FanDisclaimer({ className = '' }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return createPortal(
    <div className={`fan-float ${open ? 'is-open' : ''} ${className}`}>
      {open && <button type="button" className="fan-scrim" aria-label="Close" onClick={() => setOpen(false)} />}
      {open && (
        <div className="fan-pop" role="dialog" aria-label="About this fan-made game">
          <button type="button" className="fan-close" aria-label="Close" onClick={() => setOpen(false)}>
            ×
          </button>
          <strong>Made by ENGENEs, for ENGENEs.</strong>
          <p>
            This is an unofficial, non-commercial fan-made game. It is not affiliated with, sponsored by, or endorsed by
            ENHYPEN, BELIFT LAB, or HYBE. ENHYPEN music and other third-party media featured in the game belong to their
            respective rights holders.
          </p>
          <p className="fan-links">
            <a href="https://ensite.org" target="_blank" rel="noopener noreferrer">
              ensite.org
            </a>
            <span aria-hidden="true"> | </span>
            <a href="https://x.com/pocketzarmy" target="_blank" rel="noopener noreferrer">
              @pocketzarmy
            </a>
          </p>
        </div>
      )}
      <button type="button" className="fan-pill" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="fan-heart" aria-hidden="true">♡</span> Made by ENGENEs, for ENGENEs
      </button>
    </div>,
    document.body,
  );
}
