import { useState } from 'react';

const QUESTIONS = [
  {
    q: 'You have a 6-hour drive ahead of you. What are you doing?',
    options: [
      { text: 'Sleeping. Wake me up when we arrive.', type: 'sleeper' },
      { text: 'Controlling the playlist.', type: 'dj' },
      { text: 'Looking at the map every 30 seconds.', type: 'navigator' },
      { text: 'Talking to literally everyone.', type: 'yapper' },
      { text: 'Eating.', type: 'snack' },
      { text: 'Taking pictures.', type: 'camera' },
    ],
  },
  {
    q: 'The driver missed the exit. What do you do?',
    options: [
      { text: '"It\'s okay. We\'ll turn around."', type: 'chill' },
      { text: '"I TOLD YOU."', type: 'yapper' },
      { text: 'Immediately open maps.', type: 'navigator' },
      { text: 'Start laughing.', type: 'dj' },
      { text: 'Offer snacks.', type: 'snack' },
      { text: 'Take a picture.', type: 'camera' },
    ],
  },
  {
    q: 'You stop at a gas station. What\'s first?',
    options: [
      { text: 'Bathroom.', type: 'chill' },
      { text: 'Snacks.', type: 'snack' },
      { text: 'Coffee.', type: 'dj' },
      { text: 'Stretch.', type: 'navigator' },
      { text: 'Explore the store.', type: 'camera' },
      { text: 'Ask where everyone is.', type: 'yapper' },
    ],
  },
];

const ARCHETYPES = {
  sleeper: { label: '💤 The Sleeper', desc: 'Sleep first, questions later.', enchin: 'snowe' },
  dj: { label: '🎧 The DJ', desc: 'Nobody touches the AUX.', enchin: 'noxstar' },
  navigator: { label: '🗺️ The Navigator', desc: 'You WILL get everyone there.', enchin: 'wonchu' },
  yapper: { label: '🗣️ The Yapper', desc: 'Silence is unacceptable.', enchin: 'kishu' },
  snack: { label: '🍪 The Snack Guardian', desc: 'Nobody gets hungry.', enchin: 'jakey' },
  camera: { label: '📸 The Memory Maker', desc: 'Document EVERYTHING.', enchin: 'puni' },
  chill: { label: '😌 The Chill Passenger', desc: 'Go with the flow.', enchin: 'snowe' },
};

export default function MG2Quiz({ playerName, enchins, onNext }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const handleAnswer = (type) => {
    const newAnswers = [...answers, type];
    if (qIndex >= QUESTIONS.length - 1) {
      const counts = {};
      newAnswers.forEach((t) => { counts[t] = (counts[t] || 0) + 1; });
      const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'chill';
      const arch = ARCHETYPES[best];
      onNext({ [arch.enchin]: 2, archetype: arch });
    } else {
      setAnswers(newAnswers);
      setQIndex(qIndex + 1);
    }
  };

  const q = QUESTIONS[qIndex];

  return (
    <section className="game">
      <div className="game-box">
        <div className="game-head">
          <div className="game-location">ROAD TRIP QUIZ</div>
          <h1>What Kind of Road‑Trip Enchin Are You?</h1>
          <p>Answer to find your style.</p>
        </div>

        <div className="game-area">
          <div style={{ padding: '30px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px', fontFamily: 'Space Mono', fontSize: '11px', color: '#666' }}>
              QUESTION {qIndex + 1} OF {QUESTIONS.length}
            </div>
            <h2 style={{ marginBottom: '28px', fontSize: 'clamp(18px, 3vw, 24px)' }}>{q.q}</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className="game-btn"
                  onClick={() => handleAnswer(opt.type)}
                  style={{
                    background: 'linear-gradient(90deg, #60a5fa, #34d399)',
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 20px',
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="game-message">
          <div style={{ width: '100%', maxWidth: '500px', background: '#eee', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f43f5e, #8b5cf6)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}