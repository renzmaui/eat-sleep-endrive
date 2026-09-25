import { useState } from 'react';
import './App.css';

import MG1Seating from './games/MG1Seating';
import MG2Quiz from './games/MG2Quiz';
import MG3Customize from './games/MG3Customize';
import MG4Journey from './games/MG4Journey';

const ENCHINS = [
  { id: 'wonchu', name: 'WONCHU', papaName: 'Jungwon' },
  { id: 'noxstar', name: 'NOXSTAR', papaName: 'Jay' },
  { id: 'jakey', name: 'JAKEY', papaName: 'Jake' },
  { id: 'snowe', name: 'SNOWE', papaName: 'Sunghoon' },
  { id: 'kishu', name: 'KISHU', papaName: 'Sunoo' },
  { id: 'puni', name: 'PU-NI', papaName: 'Ni-ki' },
];

function Intro({ onBegin }) {
  return (
    <section className="intro">
      <div className="intro-title-wrap">
        <h1 className="intro-title">Eat, Sleep… EN‑Drive</h1>
        <div className="intro-chapter">MISSION 2</div>
        <div className="intro-subtitle">WHO WILL DRIVE?</div>
      </div>

      <button
        className="begin-btn"
        onClick={() => {
          onBegin();
        }}
      >
        BEGIN
      </button>
    </section>
  );
}

function NameScreen({ onComplete }) {
  const [name, setName] = useState('');

  return (
    <section className="story">
      <div className="story-card">
        <div className="story-text">
          Before we start, what should the Enchins call you?
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            border: '3px solid #111',
            fontSize: '14px',
            width: 'min(320px, 90vw)',
            marginBottom: '14px',
            background: '#fff',
          }}
        />
        <br />
        <button
          className="story-btn"
          disabled={!name.trim()}
          onClick={() => onComplete(name.trim())}
        >
          Start Road Trip
        </button>
      </div>
    </section>
  );
}

function Ending({ onRestart }) {
  return (
    <section className="ending">
      <div>
        <h1>MISSION 2 COMPLETE</h1>
        <p>You hit the road and found Papa’s broken car.</p>
        <h2>NEXT: BUILD PAPA’S CAR</h2>
        <button className="game-btn" onClick={onRestart}>
          Replay
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [step, setStep] = useState('intro');
  const [playerName, setPlayerName] = useState('');
  const [driverScores, setDriverScores] = useState(
    Object.fromEntries(ENCHINS.map((e) => [e.id, 0]))
  );

  function beginIntro() {
    setStep('name');
  }

  function completeName(name) {
    setPlayerName(name);
    setStep('mg1');
  }

  function addScore(enchinId, delta) {
    setDriverScores((prev) => ({
      ...prev,
      [enchinId]: (prev[enchinId] || 0) + delta,
    }));
  }

  if (step === 'intro') {
    return <Intro onBegin={beginIntro} />;
  }

  if (step === 'name') {
    return <NameScreen onComplete={completeName} />;
  }

  if (step === 'mg1') {
    return (
      <MG1Seating
        playerName={playerName}
        enchins={ENCHINS}
        onNext={(scores) => {
          Object.entries(scores).forEach(([id, delta]) => addScore(id, delta));
          setStep('mg2');
        }}
      />
    );
  }

  if (step === 'mg2') {
    return (
      <MG2Quiz
        playerName={playerName}
        enchins={ENCHINS}
        onNext={(scores) => {
          Object.entries(scores).forEach(([id, delta]) => addScore(id, delta));
          setStep('mg3');
        }}
      />
    );
  }

  if (step === 'mg3') {
    return (
      <MG3Customize
        playerName={playerName}
        enchins={ENCHINS}
        onNext={(scores) => {
          Object.entries(scores).forEach(([id, delta]) => addScore(id, delta));
          setStep('mg4');
        }}
      />
    );
  }

  if (step === 'mg4') {
    return (
      <MG4Journey
        playerName={playerName}
        enchins={ENCHINS}
        driverScores={driverScores}
        onComplete={() => setStep('ending')}
      />
    );
  }

  if (step === 'ending') {
    return <Ending onRestart={() => setStep('intro')} />;
  }

  return null;
}