import { useEffect, useRef, useState } from 'react';
import { Icon, SafeImg } from './ui';
import { duckMusic, sfx } from '../lib/sound';

/*
  Plays a video once, then calls onEnd. Foolproof by design:
  - always muted + playsInline, so mobile autoplay works
  - if the file is missing / errors / stalls, it shows the fallback image instead
  - if autoplay is blocked, a big "tap to play" button appears
  - a Skip button is always available
  - onEnd can only fire once
*/
export default function Cutscene({ src, poster, fallbackImage, fallbackAlt = '', missing = false, label, onEnd, holdLastFrame = false }) {
  const videoRef = useRef(null);
  const done = useRef(false);
  const [mode, setMode] = useState(missing || !src ? 'fallback' : 'video'); // video | fallback
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ended, setEnded] = useState(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onEnd?.();
  };

  useEffect(() => {
    duckMusic(true);
    return () => duckMusic(false);
  }, []);

  // Video playback + stall guard
  useEffect(() => {
    if (mode !== 'video') return undefined;
    const v = videoRef.current;
    if (!v) return undefined;
    let started = false;
    const onPlaying = () => {
      started = true;
      setBlocked(false);
    };
    v.addEventListener('playing', onPlaying);
    const p = v.play();
    if (p?.catch) p.catch(() => setBlocked(true));
    const guard = window.setTimeout(() => {
      if (!started && v.readyState < 2) setMode('fallback');
    }, 9000);
    return () => {
      v.removeEventListener('playing', onPlaying);
      window.clearTimeout(guard);
    };
  }, [mode]);

  // Fallback still: show for a few seconds with a slow zoom, then continue
  useEffect(() => {
    if (mode !== 'fallback') return undefined;
    let raf;
    const start = performance.now();
    const DUR = 3800;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / DUR);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else if (holdLastFrame) setEnded(true);
      else finish();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="cutscene" aria-label={label}>
      <div className="cutscene-frame">
        {mode === 'video' ? (
          <video
            ref={videoRef}
            className="cutscene-video"
            src={src}
            poster={poster}
            muted
            playsInline
            autoPlay
            preload="auto"
            disablePictureInPicture
            controls={false}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
            onEnded={() => {
              setProgress(1);
              if (holdLastFrame) setEnded(true);
              else finish();
            }}
            onError={() => setMode('fallback')}
          />
        ) : (
          <SafeImg src={fallbackImage || poster} alt={fallbackAlt} className="cutscene-still" />
        )}

        {blocked && mode === 'video' && (
          <button
            type="button"
            className="cutscene-play"
            onClick={() => {
              sfx.tap();
              videoRef.current?.play().then(() => setBlocked(false)).catch(() => setMode('fallback'));
            }}
          >
            <Icon.play />
            <span>Tap to play</span>
          </button>
        )}

        <div className="cutscene-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>

        {label && <div className="cutscene-label">{label}</div>}

        {!ended ? (
          <button type="button" className="cutscene-skip" onClick={() => { sfx.whoosh(); finish(); }}>
            Skip <Icon.skip />
          </button>
        ) : (
          <button type="button" className="cutscene-skip is-next" onClick={() => { sfx.tap(); finish(); }}>
            Continue <Icon.arrow />
          </button>
        )}
      </div>
    </div>
  );
}
