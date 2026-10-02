import { useEffect, useState } from 'react';
import { ENCHIN_IDS, PRELOAD, img } from '../data';
import { Btn, FanDisclaimer, Icon, SafeImg } from '../components/ui';
import { sfx } from '../lib/sound';

export function Scenery({ night = false }) {
  return (
    <div className={`scenery ${night ? 'is-night' : ''}`} aria-hidden="true">
      <div className="sky" />
      <div className="sun" />
      <div className="stars" />
      <div className="cloud c1" />
      <div className="cloud c2" />
      <div className="cloud c3" />
      <div className="hills h1" />
      <div className="hills h2" />
      <div className="sea">
        <i />
        <i />
        <i />
      </div>
      <div className="road">
        <div className="road-dash" />
      </div>
    </div>
  );
}

function usePreload(list) {
  const [loaded, setLoaded] = useState(0);
  useEffect(() => {
    let alive = true;
    list.forEach((src) => {
      const i = new Image();
      const done = () => alive && setLoaded((n) => n + 1);
      i.onload = done;
      i.onerror = done;
      i.src = src;
    });
    return () => {
      alive = false;
    };
  }, [list]);
  return Math.min(1, loaded / list.length);
}

export default function Intro({ onBegin, hasSave, savedName, onContinue, onNewGame, music, onToggleMusic }) {
  const pct = usePreload(PRELOAD);
  const [leaving, setLeaving] = useState(false);

  const go = (fn) => {
    if (leaving) return;
    setLeaving(true);
    sfx.honk();
    window.setTimeout(() => sfx.engine(), 350);
    window.setTimeout(fn, 900);
  };

  return (
    <section className={`screen intro ${leaving ? 'is-leaving' : ''}`}>
      <Scenery />

      <button type="button" className="float-toggle" onClick={onToggleMusic} aria-pressed={music}>
        {music ? <Icon.music /> : <Icon.mute />}
        <span>{music ? 'Music on' : 'Music off'}</span>
      </button>

      <div className="intro-copy">
        <p className="eyebrow">MISSION 2 · AFTER THE SIX KEYS…</p>
        <h1 className="intro-title">
          <span className="t1">Eat, Sleep…</span>
          <span className="t2">EN-Drive</span>
        </h1>
        <p className="intro-sub">Six ENCHIN. One van. Nobody agreed on who’s driving.</p>
      </div>

      <div className="intro-van">
        <div className="van-shadow" />
        <SafeImg src={img.vehicle} alt="The road trip van" className="van-img" />
        <div className="van-crew">
          {['pu-ni', 'noxstar', 'wonchu', 'kishu', 'snowe', 'jakey'].map((id, i) => (
            <SafeImg key={id} src={img.intro(id)} alt="" enchinId={id} className={`crew crew-${i}`} style={{ '--i': i }} />
          ))}
        </div>
      </div>

      <div className="intro-actions">
        {hasSave ? (
          <>
            <Btn variant="primary" size="lg" sound={null} onClick={() => go(onContinue)}>
              Continue as {savedName} <Icon.arrow />
            </Btn>
            <Btn variant="ghost" onClick={onNewGame}>
              Start a new trip
            </Btn>
          </>
        ) : (
          <Btn variant="primary" size="lg" sound={null} onClick={() => go(onBegin)}>
            Start the journey <Icon.arrow />
          </Btn>
        )}
        <div className="preload" aria-hidden={pct >= 1}>
          {pct < 1 ? (
            <>
              <span className="preload-bar">
                <span style={{ transform: `scaleX(${pct})` }} />
              </span>
              <small>Packing the van… {Math.round(pct * 100)}%</small>
            </>
          ) : (
            <small>
              <Icon.sound width="14" height="14" /> Best with sound on
            </small>
          )}
        </div>
      </div>

      <div className="intro-route">
        <span className="dot" /> LEAVING THE ISLAND <Icon.arrow width="14" height="14" /> CITY UNKNOWN
      </div>
      <FanDisclaimer />
      <span className="sr-only">{ENCHIN_IDS.length} ENCHIN are ready for the trip.</span>
    </section>
  );
}
