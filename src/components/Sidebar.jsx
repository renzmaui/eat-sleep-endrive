import { useEffect, useState } from 'react';
import { STOPS, byId, img } from '../data';
import { leaderInfo } from '../lib/scoring';
import { Icon, Logo, SafeImg } from './ui';
import { sfx } from '../lib/sound';

function leaderLine(leaderId, tiedIds) {
  if (!leaderId) return { title: 'No one yet…', sub: 'Finish a stop to see who’s leading.' };
  if (tiedIds.length > 1) {
    const others = tiedIds.filter((id) => id !== leaderId).map((id) => byId(id).name);
    const list = others.length <= 2 ? others.join(' & ') : `${others.slice(0, -1).join(', ')} & ${others.at(-1)}`;
    return { title: `${byId(leaderId).name} is leading!`, sub: `Tied with ${list} but wins the tie-break.` };
  }
  return { title: `${byId(leaderId).name} is leading!`, sub: 'Your potential driver right now.' };
}

export default function Sidebar({
  playerName,
  results,
  step,
  gain,
  onNavigate,
  onRestart,
  music,
  sfxOn,
  onToggleMusic,
  onToggleSfx,
  volume = 0.8,
  onVolume,
}) {
  const [open, setOpen] = useState(false);
  const { leaderId, tiedIds, ranked } = leaderInfo(results);
  const maxPts = Math.max(10, ...ranked.map((r) => r.points));
  const done = { mg1: !!results.mg1, mg2: !!results.mg2, mg3: !!results.mg3, mg4: !!results.mg4 };
  const unlocked4 = done.mg1 && done.mg2 && done.mg3;
  const completedCount = ['mg1', 'mg2', 'mg3'].filter((k) => done[k]).length;
  const final = done.mg4 || step === 'ending';
  const line = final && leaderId
    ? { title: `${byId(leaderId).name} is your driver!`, sub: 'The chosen Enchin driver. Final result.' }
    : leaderLine(leaderId, tiedIds);
  const leader = leaderId ? byId(leaderId) : null;

  // close the mobile drawer whenever the screen changes
  useEffect(() => setOpen(false), [step]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const inGame = ['mg1', 'mg2', 'mg3', 'mg4'].includes(step);

  return (
    <>
      {/* ---------- Mobile / tablet top bar ---------- */}
      <div className="topbar">
        <button type="button" className="topbar-home" onClick={() => onNavigate('stops')} aria-label="Back to the route map">
          <Logo size={34} />
        </button>
        <button
          type="button"
          className="topbar-leader"
          onClick={() => {
            sfx.tap();
            setOpen(true);
          }}
          aria-expanded={open}
          aria-controls="progress-panel"
        >
          <span className="topbar-avatar" style={{ '--c': leader?.color || '#fffdf7' }}>
            {leader ? <SafeImg src={img.flower(leader.id)} alt="" enchinId={leader.id} /> : <Icon.wheel />}
          </span>
          <span className="topbar-text">
            <small>{final ? 'CHOSEN ENCHIN DRIVER' : 'POTENTIAL DRIVER'}</small>
            <strong>{leader ? leader.name : '—'}</strong>
          </span>
          <span className="topbar-dots" aria-label={`${completedCount} of 3 stops done`}>
            {STOPS.map((s) => (
              <i key={s.id} className={done[s.id] ? 'is-done' : s.id === step ? 'is-now' : ''} />
            ))}
          </span>
        </button>
      </div>

      {open && <div className="drawer-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      {/* ---------- Sidebar / drawer ---------- */}
      <aside id="progress-panel" className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Road trip progress">
        <div className="sb-head">
          <button type="button" className="sb-brand" onClick={() => onNavigate('stops')} aria-label="Back to the route map">
            <Logo size={42} />
            <span>
              <strong>Eat, Sleep…</strong>
              <em>EN-Drive</em>
            </span>
          </button>
          <button type="button" className="sb-close" onClick={() => setOpen(false)} aria-label="Close progress panel">
            <Icon.close />
          </button>
        </div>

        {playerName && (
          <div className="sb-ticket">
            <span>PASSENGER</span>
            <strong>{playerName}</strong>
          </div>
        )}

        {/* Potential driver card */}
        <section className="sb-card sb-leader" style={{ '--c': leader?.color || '#ffe8c9' }} aria-live="polite">
          <span className="sb-label">{final ? 'CHOSEN ENCHIN DRIVER · FINAL' : 'POTENTIAL DRIVER TRACKER'}</span>
          <div className="sb-leader-row">
            <div className={`sb-leader-avatar ${leader ? 'has-leader' : ''}`} key={leaderId || 'none'}>
              {leader ? <SafeImg src={img.flower(leader.id)} alt={leader.name} enchinId={leader.id} /> : <Icon.wheel width="34" height="34" />}
            </div>
            <div>
              <h3>{line.title}</h3>
              <p>{line.sub}</p>
            </div>
          </div>

          <ol className="sb-board">
            {ranked.map((r, idx) => {
              const e = byId(r.id);
              const g = gain?.scores?.[r.id];
              return (
                <li key={r.id} className={`sb-row ${r.id === leaderId ? 'is-leader' : ''}`} style={{ '--c': e.color }}>
                  <span className="sb-rank">{r.points > 0 ? idx + 1 : '·'}</span>
                  <SafeImg src={img.flower(r.id)} alt="" enchinId={r.id} className="sb-row-img" />
                  <span className="sb-row-main">
                    <span className="sb-row-name">{e.name}</span>
                    <span className="sb-bar">
                      <span style={{ width: `${(r.points / maxPts) * 100}%` }} />
                    </span>
                  </span>
                  <span className="sb-pts">
                    {r.points}
                    {g > 0 && (
                      <b className="sb-gain" key={`${gain.key}-${r.id}`}>
                        +{g}
                      </b>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Route checklist */}
        <section className="sb-card sb-route">
          <span className="sb-label">
            ROUTE · {completedCount}/3 STOPS
          </span>
          <ul>
            {STOPS.map((s) => {
              const locked = s.id === 'mg4' && !unlocked4;
              const isNow = step === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`sb-stop ${done[s.id] ? 'is-done' : ''} ${isNow ? 'is-now' : ''} ${locked ? 'is-locked' : ''}`}
                    disabled={locked || isNow}
                    onClick={() => onNavigate(s.id === 'mg4' || !done[s.id] ? s.id : 'stops')}
                  >
                    <span className="sb-stop-num">{done[s.id] ? <Icon.check /> : locked ? <Icon.lock /> : s.num}</span>
                    <span className="sb-stop-text">
                      <strong>{s.place}</strong>
                      <small>{isNow ? 'You are here' : done[s.id] ? 'Done' : locked ? 'Finish stops 1–3' : s.task}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <label className="sb-volume">
          <span className="sb-vol-label">
            {volume === 0 ? <Icon.mute /> : <Icon.sound />} Volume
            <b>{Math.round(volume * 100)}%</b>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(volume * 100)}
            onChange={(e) => onVolume?.(Number(e.target.value) / 100)}
            style={{ '--v': `${Math.round(volume * 100)}%` }}
            aria-label="Volume"
          />
        </label>

        <div className="sb-controls">
          <button type="button" className={`sb-toggle ${music ? 'is-on' : ''}`} onClick={onToggleMusic} aria-pressed={music}>
            <Icon.music /> Music {music ? 'on' : 'off'}
          </button>
          <button type="button" className={`sb-toggle ${sfxOn ? 'is-on' : ''}`} onClick={onToggleSfx} aria-pressed={sfxOn}>
            {sfxOn ? <Icon.sound /> : <Icon.mute />} Sounds {sfxOn ? 'on' : 'off'}
          </button>
          {inGame || step === 'stops' ? (
            <button type="button" className="sb-toggle sb-map" onClick={() => onNavigate('stops')} disabled={step === 'stops'}>
              <Icon.map /> Route map
            </button>
          ) : null}
          <button type="button" className="sb-toggle sb-restart" onClick={onRestart}>
            <Icon.restart /> Start over
          </button>
        </div>

        <p className="sb-foot">Progress saves automatically. Refresh anytime.</p>
      </aside>
    </>
  );
}

