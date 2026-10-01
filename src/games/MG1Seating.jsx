import { useCallback, useEffect, useRef, useState } from 'react';
import { ENCHINS, ENCHIN_IDS, byId, img, video } from '../data';
import { Btn, Confetti, Icon, Modal, Portal, SafeImg } from '../components/ui';
import Cutscene from '../components/Cutscene';
import { usePersistentState } from '../lib/storage';
import { canvasToBlob, renderInstaxCard, renderSeatingCard, saveImage } from '../lib/exportImage';
import { useCard } from '../lib/useCard';
import { sfx } from '../lib/sound';

// Seat hotspots, as % of the top-down car photo (car facing right).
export const SEATS = [
  { id: 'seat1', label: 'Coolest Driver', x: 68.2, y: 30.5 },
  { id: 'seat2', label: 'Passenger Princess', x: 68.2, y: 69 },
  { id: 'seat3', label: 'Snack Distributor', x: 48.6, y: 31 },
  { id: 'seat4', label: 'Sleep Catcher', x: 48.6, y: 68.5 },
  { id: 'seat5', label: 'Dizzy During the Ride', x: 25.5, y: 31.5 },
  { id: 'seat6', label: 'Road Trip Photographer', x: 25.5, y: 67.5 },
];

function useIsPortrait() {
  const q = '(max-width: 760px) and (orientation: portrait)';
  const [p, setP] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setP(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return p;
}

function validSeating(s) {
  const out = {};
  const used = new Set();
  if (!s || typeof s !== 'object') return out;
  for (const seat of SEATS) {
    const id = s[seat.id];
    if (ENCHIN_IDS.includes(id) && !used.has(id)) {
      out[seat.id] = id;
      used.add(id);
    }
  }
  return out;
}

export default function MG1Seating({ playerName, onComplete, onExit }) {
  const [draft, setDraft] = usePersistentState(
    'draft:mg1',
    { phase: 'intro', seating: {} },
    (v, init) => ({ phase: ['intro', 'seat', 'result'].includes(v.phase) ? v.phase : init.phase, seating: validSeating(v.seating) }),
  );
  const { phase, seating } = draft;
  const setSeating = useCallback((fn) => setDraft((d) => ({ ...d, seating: typeof fn === 'function' ? fn(d.seating) : fn })), [setDraft]);
  const setPhase = (p) => setDraft((d) => ({ ...d, phase: p }));

  if (phase === 'intro') {
    return (
      <section className="page game-page mg1">
        <GameHead num="01" place="Waiting Shed" title="Seat the ENCHIN" sub="Your ride just pulled up. Take a look inside…" />
        <Cutscene
          src={video.seatingIntro.src}
          poster={video.seatingIntro.poster}
          fallbackImage={img.carTop}
          label="Checking out the ride"
          onEnd={() => {
            sfx.pop();
            setPhase('seat');
          }}
        />
      </section>
    );
  }

  if (phase === 'result' && Object.keys(seating).length === 6) {
    return (
      <SeatingResult
        playerName={playerName}
        seating={seating}
        onBack={() => {
          sfx.back();
          setPhase('seat');
        }}
        onContinue={() => {
          const driverId = seating.seat1;
          onComplete({ seating, driverId, scores: { [driverId]: 3 } });
        }}
      />
    );
  }

  return (
    <SeatingBoard
      playerName={playerName}
      seating={seating}
      setSeating={setSeating}
      onReplayIntro={() => setPhase('intro')}
      onLocked={() => setPhase('result')}
      onExit={onExit}
    />
  );
}

export function GameHead({ num, place, title, sub, children }) {
  return (
    <header className="game-head">
      <p className="eyebrow">
        STOP {num} · {place.toUpperCase()}
      </p>
      <h1 className="game-title">{title}</h1>
      {sub && <p className="game-sub">{sub}</p>}
      {children}
    </header>
  );
}

/* ================================================================== */
/*  Seating board: drag & drop (mouse + touch + pen) AND tap-to-place */
/* ================================================================== */
function SeatingBoard({ playerName, seating, setSeating, onReplayIntro, onLocked }) {
  const portrait = useIsPortrait();
  const [selected, setSelected] = useState(null); // enchin id
  const [drag, setDrag] = useState(null); // { id, x, y, over }
  const [confirm, setConfirm] = useState(false);
  const [nudge, setNudge] = useState(0);
  const [justPlaced, setJustPlaced] = useState(null);
  const dragRef = useRef(null);
  const suppressClick = useRef(false);

  const seatOf = useCallback((id) => Object.keys(seating).find((k) => seating[k] === id) || null, [seating]);
  const filled = Object.keys(seating).length;
  const isFull = filled === SEATS.length;
  const unseated = ENCHINS.filter((e) => !Object.values(seating).includes(e.id));

  const place = useCallback(
    (id, seatId) => {
      if (!id || !seatId) return;
      setSeating((prev) => {
        const next = { ...prev };
        const from = Object.keys(prev).find((k) => prev[k] === id) || null;
        const occupant = prev[seatId];
        if (from === seatId) return prev;
        if (from) delete next[from];
        next[seatId] = id;
        if (occupant && occupant !== id) {
          if (from) next[from] = occupant; // swap seats; otherwise the occupant simply returns to the tray
        }
        return next;
      });
      const occupant = seating[seatId];
      if (occupant && occupant !== id) sfx.swap();
      else sfx.drop();
      setJustPlaced(seatId);
      window.setTimeout(() => setJustPlaced((s) => (s === seatId ? null : s)), 500);
    },
    [seating, setSeating],
  );

  const unseat = useCallback(
    (id) => {
      const from = seatOf(id);
      if (!from) return;
      setSeating((prev) => {
        const next = { ...prev };
        delete next[from];
        return next;
      });
      sfx.back();
    },
    [seatOf, setSeating],
  );

  /* ---------------- pointer drag ---------------- */
  const onPointerDown = (e, id) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, pid: e.pointerId, moved: false };
  };

  useEffect(() => {
    const move = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pid) return;
      const dist = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);
      if (!d.moved && dist < 7) return;
      if (!d.moved) {
        d.moved = true;
        sfx.pick();
        setSelected(null);
      }
      e.preventDefault();
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const over = el?.closest?.('[data-drop]')?.getAttribute('data-drop') || null;
      setDrag({ id: d.id, x: e.clientX, y: e.clientY, over });
    };
    const up = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pid) return;
      dragRef.current = null;
      if (!d.moved) return; // it was a tap — let onClick handle it
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 60);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const over = el?.closest?.('[data-drop]')?.getAttribute('data-drop') || null;
      setDrag(null);
      if (over && over.startsWith('seat')) place(d.id, over);
      else if (over === 'tray') unseat(d.id);
      else sfx.back();
    };
    const cancel = () => {
      dragRef.current = null;
      setDrag(null);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, [place, unseat]);

  useEffect(() => {
    document.body.classList.toggle('is-dragging', !!drag);
    return () => document.body.classList.remove('is-dragging');
  }, [drag]);

  /* ---------------- tap / keyboard ---------------- */
  const tapToken = (id) => {
    if (suppressClick.current) return;
    if (selected === id) {
      setSelected(null);
      sfx.back();
      return;
    }
    setSelected(id);
    sfx.pick();
  };

  const tapSeat = (seatId) => {
    if (suppressClick.current) return;
    const occupant = seating[seatId];
    if (selected) {
      if (selected === occupant) {
        setSelected(null);
        sfx.back();
        return;
      }
      place(selected, seatId);
      setSelected(null);
      return;
    }
    if (occupant) {
      setSelected(occupant);
      sfx.pick();
      return;
    }
    // Empty seat tapped with nobody picked: auto-pick the next Enchin in the tray.
    if (unseated[0]) {
      place(unseated[0].id, seatId);
      return;
    }
    sfx.error();
    setNudge((n) => n + 1);
  };

  const tapTray = () => {
    if (suppressClick.current) return;
    if (selected && seatOf(selected)) {
      unseat(selected);
      setSelected(null);
    }
  };

  const quickFill = () => {
    const free = SEATS.filter((s) => !seating[s.id]).map((s) => s.id);
    const pool = [...unseated.map((e) => e.id)].sort(() => Math.random() - 0.5);
    if (!free.length) return;
    setSeating((prev) => {
      const next = { ...prev };
      free.forEach((sid, i) => {
        if (pool[i]) next[sid] = pool[i];
      });
      return next;
    });
    sfx.sparkle();
    setSelected(null);
  };

  const clearAll = () => {
    setSeating({});
    setSelected(null);
    sfx.whoosh();
  };

  const seatStyle = (s) =>
    portrait ? { left: `${s.y}%`, top: `${100 - s.x}%` } : { left: `${s.x}%`, top: `${s.y}%` };

  const hint = drag
    ? drag.over?.startsWith('seat')
      ? `Make ${byId(drag.id).name} the ${SEATS.find((s) => s.id === drag.over).label}`
      : drag.over === 'tray'
        ? `Drop to take ${byId(drag.id).name} out of the van`
        : 'Drag onto a seat'
    : selected
      ? seatOf(selected)
        ? `${byId(selected).name} selected — tap another seat to swap, or tap the tray to take them out`
        : `${byId(selected).name} selected — now tap a seat`
      : isFull
        ? 'Everyone’s buckled in! Lock it in when you’re happy.'
        : `Drag an Enchin into a seat, or tap one then tap a seat · ${filled}/6 seated`;

  return (
    <section className="page game-page mg1">
      <GameHead num="01" place="Waiting Shed" title="Seat the ENCHIN" sub="Everyone needs a seat. Swap by dropping one ENCHIN onto another.">
        <button type="button" className="link-btn" onClick={onReplayIntro}>
          <Icon.play width="14" height="14" /> Replay intro
        </button>
      </GameHead>

      <div className="mg1-layout">
        <div
          className={`tray ${drag && seatOf(drag.id) ? 'is-target' : ''} ${drag?.over === 'tray' ? 'is-over' : ''}`}
          data-drop="tray"
          onClick={tapTray}
          key={`tray-${nudge}`}
        >
          <span className="tray-label">{unseated.length ? 'WAITING AT THE SHED' : 'ALL ABOARD'}</span>
          <div className="tray-list">
            {ENCHINS.map((e) => {
              const seated = !!seatOf(e.id);
              if (seated) return <span key={e.id} className="token-slot" aria-hidden="true" />;
              return (
                <button
                  key={e.id}
                  type="button"
                  className={`token ${selected === e.id ? 'is-selected' : ''} ${drag?.id === e.id ? 'is-ghosted' : ''}`}
                  style={{ '--c': e.color }}
                  onPointerDown={(ev) => onPointerDown(ev, e.id)}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    tapToken(e.id);
                  }}
                  aria-pressed={selected === e.id}
                  aria-label={`${e.name}. ${selected === e.id ? 'Selected. Now choose a seat.' : 'Pick to seat.'}`}
                >
                  <SafeImg src={img.flower(e.id)} alt="" enchinId={e.id} />
                  <span>{e.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`car-stage ${portrait ? 'is-portrait' : ''} ${drag || selected ? 'is-armed' : ''}`}>
          <SafeImg src={portrait ? img.carTopPortrait : img.carTop} alt="Top-down view of the six-seat car" className="car-photo" />
          <span className="car-front" aria-hidden="true">
            FRONT <Icon.arrow width="14" height="14" />
          </span>
          {SEATS.map((s) => {
            const occ = seating[s.id] ? byId(seating[s.id]) : null;
            const over = drag?.over === s.id;
            return (
              <button
                key={s.id}
                type="button"
                data-drop={s.id}
                className={`seat ${s.id === 'seat1' ? 'is-driver' : ''} ${occ ? 'is-filled' : ''} ${over ? 'is-over' : ''} ${
                  selected && selected === occ?.id ? 'is-selected' : ''
                } ${justPlaced === s.id ? 'is-bounce' : ''}`}
                style={{ ...seatStyle(s), '--c': occ?.color || '#fffdf7' }}
                onClick={() => tapSeat(s.id)}
                onPointerDown={occ ? (ev) => onPointerDown(ev, occ.id) : undefined}
                aria-label={`${s.label} seat${occ ? `, ${occ.name} is sitting here` : ', empty'}`}
              >
                {occ ? (
                  <SafeImg src={img.flower(occ.id)} alt="" enchinId={occ.id} className={`seat-enchin ${drag?.id === occ.id ? 'is-ghosted' : ''}`} />
                ) : (
                  <span className="seat-empty">+</span>
                )}
                <span className="seat-label">
                  {s.id === 'seat1' && <Icon.wheel width="12" height="12" />}
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="action-bar">
        <p className="action-hint" aria-live="polite">
          {hint}
        </p>
        <div className="action-buttons">
          <Btn variant="ghost" onClick={clearAll} disabled={!filled}>
            Clear
          </Btn>
          {!isFull && (
            <Btn variant="ghost" onClick={quickFill} sound={null}>
              <Icon.shuffle /> Fill the rest
            </Btn>
          )}
          <Btn
            variant="primary"
            disabled={!isFull}
            onClick={() => {
              setConfirm(true);
            }}
          >
            Lock in seats <Icon.lock />
          </Btn>
        </div>
      </div>

      {drag && (
        <Portal>
        <div className="drag-ghost" style={{ transform: `translate(${drag.x}px, ${drag.y}px)`, '--c': byId(drag.id).color }} aria-hidden="true">
          <SafeImg src={img.flower(drag.id)} alt="" enchinId={drag.id} />
        </div>
        </Portal>
      )}

      <Modal
        open={confirm}
        title="Lock in the seating chart?"
        onClose={() => setConfirm(false)}
        actions={
          <>
            <Btn variant="ghost" onClick={() => setConfirm(false)} data-autofocus>
              Keep editing
            </Btn>
            <Btn
              variant="primary"
              sound="lock"
              onClick={() => {
                setConfirm(false);
                onLocked();
              }}
            >
              Lock it in
            </Btn>
          </>
        }
      >
        <p>
          {playerName ? <strong>{playerName}</strong> : 'Hey'}, is this the crew you want? You can still come back and change it
          before you continue.
        </p>
        <ul className="mini-seats">
          {SEATS.map((s) => (
            <li key={s.id} className={s.id === 'seat1' ? 'is-driver' : ''}>
              <SafeImg src={img.flower(seating[s.id])} alt="" enchinId={seating[s.id]} />
              <span>
                <small>{s.label}</small>
                <strong>{byId(seating[s.id])?.name}</strong>
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </section>
  );
}

/* ================================================================== */
/*  Result: driver reveal + generated seating chart photo              */
/* ================================================================== */
function SeatingResult({ playerName, seating, onBack, onContinue }) {
  const driver = byId(seating.seat1);
  const [card, setCard] = useState(null); // { url, blob }
  const [saving, setSaving] = useState('');
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    sfx.fanfare();
  }, []);

  useEffect(() => {
    let alive = true;
    let url;
    renderSeatingCard({ seating, seats: SEATS, playerName })
      .then(async (canvas) => {
        const blob = await canvasToBlob(canvas);
        if (!alive || !blob) return;
        url = URL.createObjectURL(blob);
        setCard({ url, blob });
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [seating, playerName]);

  const photo = useCard(() => renderInstaxCard({ kind: 'mg1', enchinId: driver.id, playerName }), [driver.id, playerName]);

  const save = async (which) => {
    setSaving(which);
    if (which === 'card' && card) await saveImage({ blob: card.blob, filename: 'endrive-seating-chart.png' });
    if (which === 'driver') await saveImage(photo ? { blob: photo.blob, filename: `endrive-mg1-${driver.id}.png` } : { url: img.driverPng(driver.id), filename: `${driver.id}-driver.png` });
    setSaving('');
  };

  return (
    <section className="page game-page mg1 result-page">
      <Confetti />
      <GameHead num="01" place="Waiting Shed" title={`${driver.name} took the wheel!`} sub="Whoever you seat as driver is your subconscious pick…" />

      <div className="result-grid">
        <figure className="polaroid tilt-l">
          <SafeImg src={img.driver(driver.id)} alt={`${driver.name} in the driver seat`} enchinId={driver.id} />
          <figcaption>
            <span className="points-chip" style={{ '--c': driver.color }}>
              +3 driver points · {driver.name}
            </span>
          </figcaption>
        </figure>
        <figure className="polaroid tilt-r">
          {card ? <img src={card.url} alt="Your generated seating chart" /> : <div className="card-loading">Developing your photo…</div>}
          <figcaption>Your seating chart</figcaption>
        </figure>
      </div>

      <div className="action-bar">
        <div className="action-buttons wrap">
          <Btn variant="ghost" onClick={onBack} sound={null}>
            <Icon.back /> Change seats
          </Btn>
          <Btn variant="soft" onClick={() => save('card')} disabled={!card || !!saving}>
            <Icon.save /> {saving === 'card' ? 'Saving…' : 'Save seating chart'}
          </Btn>
          <Btn variant="soft" onClick={() => save('driver')} disabled={!!saving}>
            <Icon.save /> {saving === 'driver' ? 'Saving…' : 'Save driver photo'}
          </Btn>
          <Btn
            variant="primary"
            sound="points"
            disabled={leaving}
            onClick={() => {
              setLeaving(true);
              onContinue();
            }}
          >
            Continue journey <Icon.arrow />
          </Btn>
        </div>
      </div>
    </section>
  );
}
