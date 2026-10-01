import { useEffect, useMemo, useRef, useState } from 'react';
import { ENCHINS, byId, img, video } from '../data';
import { Btn, Icon, SafeImg } from '../components/ui';
import Cutscene from '../components/Cutscene';
import { GameHead, SEATS } from './MG1Seating';
import { Scenery } from '../screens/Intro';
import { setTrack, sfx } from '../lib/sound';

function pickCast(driver, results) {
  const seating = results?.mg1?.seating || {};
  const used = new Set([driver.id]);
  const take = (...ids) => {
    const id = ids.find((x) => x && !used.has(x)) || ENCHINS.find((e) => !used.has(e.id)).id;
    used.add(id);
    return byId(id);
  };
  // Passenger princess = whoever sat in seat 2 (if they ended up driving, the seat-1 Enchin swaps over).
  const princess = take(seating.seat2, seating.seat1);
  const middle = take(seating.seat3, seating.seat4);
  const o1 = take(seating.seat4, seating.seat5, seating.seat6);
  const o2 = take(seating.seat5, seating.seat6, seating.seat3);
  const seatOf = (e) => Object.keys(seating).find((k) => seating[k] === e.id);
  const roleOf = (e, fallback) => SEATS.find((x) => x.id === seatOf(e))?.label || fallback;
  return { princess, middle, o1, o2, midRole: roleOf(middle, 'Middle Seat') };
}

function buildStory(driver, playerName, results) {
  const { princess, middle, o1, o2, midRole } = pickCast(driver, results);
  const you = playerName || 'You';
  const PP = 'Passenger Princess';
  const MID = midRole;
  return [
    { t: 'title', text: `Looks like ${driver.name} is driving!`, scene: 'road' },
    { t: 'driver', text: 'Everyone ready?', scene: 'road' },
    { t: 'other', who: princess, role: PP, text: 'NO.', scene: 'road' },
    { t: 'driver', text: 'Too late. Seatbelts on!', scene: 'road' },
    { t: 'chapter', text: `${driver.name.toUpperCase()}’S ROAD`, scene: 'road' },
    { t: 'narr', text: 'The island disappears behind you.', scene: 'road' },
    { t: 'narr', text: 'Open road. Sunset. Distant city lights.', scene: 'road' },
    { t: 'driver', text: 'ENCHIN… do you think there’s a high chance our Papas are together?', scene: 'road' },
    { t: 'other', who: o1, text: 'I thought of that too!', scene: 'road' },
    { t: 'other', who: o2, text: 'Me too!', scene: 'road' },
    { t: 'you', text: '…That’s actually possible.', scene: 'road' },
    { t: 'narr', text: 'Then… strange signs start appearing. Racing emblems. Checkered flags. Fresh tire tracks.', scene: 'signs' },
    { t: 'narr', text: 'A radio crackles to life: “…all drivers… converge…”', scene: 'signs' },
    { t: 'other', who: princess, role: PP, text: 'Why does the stuff around here look like Papa’s stuff? That’s the color of his shirts!', scene: 'signs' },
    { t: 'other', who: middle, role: MID, text: 'Wait, for real! That looks like the logo of the company Papa is working at…', scene: 'signs' },
    { t: 'narr', text: 'You follow the signs, turn after turn, until the road runs out.', scene: 'signs' },
    { t: 'narr', text: 'The road ends at a huge, dim garage.', scene: 'garage' },
    { t: 'driver', text: 'Dead end? We should go down.', scene: 'garage' },
    { t: 'narr', text: 'Under a dusty tarp: a broken E1 race car.', scene: 'garage-reveal' },
    { t: 'driver', text: 'Wait… that car… this helmet…', scene: 'garage-reveal' },
    { t: 'driver', text: `This helmet… it’s Papa ${driver.papa}’s. I’ve seen it in his room.`, scene: 'garage-reveal' },
    { t: 'driver', text: '…I really, really miss my Papa…', scene: 'garage-reveal' },
    { t: 'you', text: 'You’ll meet him soon.', scene: 'garage-reveal' },
    { t: 'title', text: 'Something tells you this isn’t the end…', scene: 'garage-reveal' },
  ].map((l) => ({ ...l, you }));
}

export default function MG4Journey({ playerName, driverId, results, onComplete }) {
  const driver = byId(driverId) || ENCHINS[0];
  const [phase, setPhase] = useState('ready'); // ready | reveal | final | story | cliff

  useEffect(() => {
    if (phase === 'story' || phase === 'cliff') setTrack('story');
    return undefined;
  }, [phase]);

  if (phase === 'reveal') {
    return (
      <section className="page game-page mg4" key={phase}>
        <GameHead num="04" place="The Journey" title="Who’s taking the wheel?" sub="Adding up every seat, vote and style pick…" />
        <Cutscene
          key="reveal"
          src={video.driverReveal.src}
          poster={video.driverReveal.poster}
          fallbackImage={img.carTop}
          label="Driver reveal"
          onEnd={() => {
            sfx.suspense();
            setPhase('final');
          }}
        />
      </section>
    );
  }

  if (phase === 'final') {
    const v = video.finalDriver(driver.id);
    return (
      <section className="page game-page mg4" key={phase}>
        <GameHead num="04" place="The Journey" title={`${driver.name} is driving!`} sub="Your potential driver is officially behind the wheel." />
        <Cutscene
          key={`final-${driver.id}`}
          src={v.src}
          poster={v.poster}
          missing={v.missing}
          fallbackImage={img.driver(driver.id)}
          fallbackAlt={`${driver.name} in the driver seat`}
          label={`${driver.name} takes the wheel`}
          onEnd={() => {
            sfx.fanfare();
            setPhase('story');
          }}
        />
      </section>
    );
  }

  if (phase === 'story') {
    return <Story driver={driver} playerName={playerName} results={results} onDone={() => setPhase('cliff')} />;
  }

  if (phase === 'cliff') {
    return (
      <section className="page game-page mg4 cliff">
        <div className="cliff-card">
          <div className="cliff-car">
            <SafeImg src={img.car(driver.id)} alt={`Papa ${driver.papa}’s broken race car`} />
          </div>
          <p className="eyebrow light">TO BE CONTINUED</p>
          <h1 className="cliff-title">
            <span>THE E1 GARAGE</span>
            The race isn’t over…
          </h1>
          <p className="cliff-wait">…wait. What do you mean, <em>race</em>?</p>
          <p className="cliff-sub">
            {driver.name} and the crew found Papa {driver.papa}’s broken E1 race car. Whatever happens next, ENHYPEN is out there somewhere…
          </p>
          <div className="action-buttons center">
            <Btn variant="ghost-light" onClick={() => setPhase('story')} sound={null}>
              <Icon.restart /> Read again
            </Btn>
            <Btn variant="primary" size="lg" sound="fanfare" onClick={onComplete}>
              Mission 2 : The Chosen Enchin Driver <Icon.arrow />
            </Btn>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page game-page mg4" key={phase}>
      <GameHead num="04" place="The Journey" title="The Journey" sub="All three stops cleared. The crew is packed. The engine is warm." />
      <div className="ready-card">
        <div className="ready-crew">
          {ENCHINS.map((e, i) => (
            <SafeImg key={e.id} src={img.flower(e.id)} alt="" enchinId={e.id} style={{ '--i': i }} />
          ))}
        </div>
        <h2>Ready to find out who’s driving?</h2>
        <p>Grab a snack. This part is a story, just sit back and read. Videos can be skipped anytime.</p>
        <Btn
          variant="primary"
          size="lg"
          sound={null}
          onClick={() => {
            sfx.engine();
            window.setTimeout(() => sfx.honk(), 600);
            setPhase('reveal');
          }}
        >
          Start the journey <Icon.arrow />
        </Btn>
      </div>
    </section>
  );
}

/* ---------------- Auto-playing story ---------------- */
function Story({ driver, playerName, results, onDone }) {
  const lines = useMemo(() => buildStory(driver, playerName, results), [driver, playerName, results]);
  const [shown, setShown] = useState(1);
  const [fast, setFast] = useState(false);
  const [paused, setPaused] = useState(false);
  const logRef = useRef(null);
  const done = shown >= lines.length;
  const scene = lines[Math.min(shown, lines.length) - 1].scene;

  useEffect(() => {
    if (done || paused) return undefined;
    const line = lines[shown - 1];
    const base = 1300 + line.text.length * 38;
    const t = window.setTimeout(() => setShown((n) => Math.min(lines.length, n + 1)), fast ? base * 0.45 : base);
    return () => window.clearTimeout(t);
  }, [shown, fast, paused, done, lines]);

  useEffect(() => {
    const l = lines[shown - 1];
    if (!l) return;
    if (l.t === 'title' || l.t === 'chapter') sfx.sparkle();
    else sfx.blip();
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [shown, lines]);

  useEffect(() => {
    if (scene === 'garage-reveal') sfx.whoosh();
    if (scene === 'signs') sfx.honk();
  }, [scene]);

  const nextLine = () => {
    if (!done) setShown((n) => Math.min(lines.length, n + 1));
  };

  return (
    <section className="page game-page mg4 story-page">
      <div className={`story-scene scene-${scene}`} aria-hidden="true">
        <Scenery night />
        <div className="scene-van">
          <SafeImg src={img.vehicle} alt="" />
        </div>
        <div className="scene-signs">
          <span className="sign s1">E1</span>
          <span className="sign s2 checker" />
          <span className="sign s3">→</span>
        </div>
        <div className="scene-garage">
          <div className="garage-door" />
          <div className="garage-light" />
          <div className="garage-car">
            <SafeImg src={img.car(driver.id)} alt="" />
            <span className="tarp" />
          </div>
        </div>
      </div>

      <div className="story-log" ref={logRef} onClick={nextLine} role="log" aria-live="polite">
        {lines.slice(0, shown).map((l, i) => {
          const speaker = l.t === 'driver' ? driver : l.t === 'other' ? l.who : null;
          if (l.t === 'chapter')
            return (
              <div key={i} className="line line-chapter">
                <span>{l.text}</span>
              </div>
            );
          if (l.t === 'title')
            return (
              <div key={i} className="line line-title">
                {l.text}
              </div>
            );
          if (l.t === 'narr')
            return (
              <p key={i} className="line line-narr">
                {l.text}
              </p>
            );
          if (l.t === 'you')
            return (
              <div key={i} className="line line-bubble is-you">
                <div className="bubble">
                  <small>{l.you}</small>
                  {l.text}
                </div>
                <span className="avatar you-avatar">{(l.you || 'Y').slice(0, 1).toUpperCase()}</span>
              </div>
            );
          return (
            <div key={i} className="line line-bubble" style={{ '--c': speaker.color }}>
              <span className="avatar">
                <SafeImg src={img.flower(speaker.id)} alt="" enchinId={speaker.id} />
              </span>
              <div className="bubble">
                <small>
                  {speaker.name}
                  {l.role ? ` · ${l.role}` : l.t === 'driver' ? ' · Driver' : ''}
                </small>
                {l.text}
              </div>
            </div>
          );
        })}
        {!done && (
          <div className="typing" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className="action-bar dark">
        <p className="action-hint">{done ? 'The road ends here… for now.' : 'Tap the story to read faster.'}</p>
        <div className="action-buttons">
          {!done && (
            <>
              <Btn variant="ghost-light" onClick={() => setPaused((p) => !p)} sound="tap">
                {paused ? 'Resume' : 'Pause'}
              </Btn>
              <Btn variant="ghost-light" onClick={() => setFast((f) => !f)} aria-pressed={fast}>
                {fast ? 'Normal speed' : 'Faster'}
              </Btn>
              <Btn variant="ghost-light" onClick={() => setShown(lines.length)}>
                Show all
              </Btn>
            </>
          )}
          {done && (
            <Btn variant="primary" size="lg" sound="suspense" onClick={onDone}>
              Keep going <Icon.arrow />
            </Btn>
          )}
        </div>
      </div>
    </section>
  );
}
