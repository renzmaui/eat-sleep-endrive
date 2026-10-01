import { useEffect, useRef, useState } from 'react';
import { Scenery } from './Intro';
import { Btn, Icon, SafeImg } from '../components/ui';
import { img } from '../data';
import { sfx } from '../lib/sound';

const MAX = 16;

export function cleanName(raw) {
  return String(raw || '')
    .replace(/[<>{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX);
}

export default function NameScreen({ onComplete, onBack }) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);
  const clean = cleanName(name);
  const valid = clean.length >= 1;

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 400);
    return () => window.clearTimeout(t);
  }, []);

  const submit = (e) => {
    e?.preventDefault();
    setTouched(true);
    if (!valid) {
      sfx.error();
      inputRef.current?.focus();
      return;
    }
    sfx.lock();
    onComplete(clean);
  };

  return (
    <section className="screen name-screen">
      <Scenery />
      <form className="ticket" onSubmit={submit} noValidate>
        <div className="ticket-top">
          <span>BOARDING PASS</span>
          <span>SEAT: ???</span>
        </div>
        <div className="ticket-body">
          <p className="ticket-lead">
            The island is behind us. The trip is ahead of us.
            <br />
            What name should we put on the passenger list?
          </p>
          <label className="field">
            <span className="field-label">PASSENGER NAME</span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              maxLength={MAX + 4}
              autoComplete="nickname"
              enterKeyHint="go"
              placeholder="Type your name"
              aria-invalid={touched && !valid}
              aria-describedby="name-hint"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={() => sfx.blip()}
            />
            <span id="name-hint" className={`field-hint ${touched && !valid ? 'is-error' : ''}`}>
              {touched && !valid ? 'Pop a name in first, so the ENCHIN know who you are.' : `${clean.length}/${MAX} characters`}
            </span>
          </label>
        </div>
        <div className="ticket-perf" aria-hidden="true" />
        <div className="ticket-actions">
          <Btn variant="ghost" onClick={onBack}>
            <Icon.back /> Back
          </Btn>
          <button type="submit" className={`btn btn-primary btn-lg ${!valid ? 'is-soft-disabled' : ''}`}>
            Let’s go <Icon.arrow />
          </button>
        </div>
      </form>
      <div className="name-crew" aria-hidden="true">
        {['pu-ni', 'noxstar', 'wonchu', 'kishu', 'snowe', 'jakey'].map((id, i) => (
          <SafeImg key={id} src={img.intro(id)} alt="" enchinId={id} className="name-crew-item" style={{ '--i': i }} />
        ))}
      </div>
    </section>
  );
}
