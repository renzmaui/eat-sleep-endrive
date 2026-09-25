import { useState, useEffect } from 'react';

export default function MG4Journey({ playerName, enchins, driverScores, onComplete }) {
  const [log, setLog] = useState([]);
  const [started, setStarted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const best = Object.entries(driverScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'wonchu';
  const driver = enchins.find((e) => e.id === best);

  const addLog = (text, type = 'neutral') => {
    setLog((prev) => [...prev, { text, type }]);
  };

  useEffect(() => {
    if (!started) return;

    const timeline = [
      { t: 500, text: `Looks like ${driver.name} is driving!`, type: 'accent' },
      { t: 1200, text: `${driver.name}: "Everyone ready?"`, type: 'enchin' },
      { t: 2000, text: `Someone: "NO."`, type: 'enchin' },
      { t: 2800, text: `${driver.name}: "Too late." 😂`, type: 'enchin' },
      { t: 3800, text: '', type: 'neutral' },
      { t: 4200, text: `[ ${driver.name}'S ROAD ]`, type: 'accent' },
      { t: 5200, text: '', type: 'neutral' },
      { t: 5800, text: `The island disappears behind you.`, type: 'neutral' },
      { t: 6800, text: `Open road. Sunset. Distant lights.`, type: 'neutral' },
      { t: 7800, text: `You see strange signs… racing emblems, tire tracks.`, type: 'neutral' },
      { t: 8800, text: `A radio crackles: "…all drivers… converge…"`, type: 'neutral' },
      { t: 9800, text: '', type: 'neutral' },
      { t: 10400, text: `You recognize colors from Papa ${driver.papaName}'s world…`, type: 'player' },
      { t: 11400, text: `but you don't fully understand it yet.`, type: 'player' },
      { t: 12400, text: '', type: 'neutral' },
      { t: 13000, text: `The road leads to a huge, dim garage.`, type: 'neutral' },
      { t: 14000, text: `Under a tarp: a broken race car.`, type: 'neutral' },
      { t: 15000, text: `${driver.name}: "…This helmet… it's Papa ${driver.papaName}."`, type: 'enchin' },
      { t: 16200, text: `${driver.name}: "I miss my Papa… Do you miss my Papa too, ${playerName}?"`, type: 'enchin' },
      { t: 17400, text: `You: "More than anything. We'll bring him back."`, type: 'player' },
      { t: 18600, text: '', type: 'neutral' },
      { t: 19200, text: `MISSION 3 — BUILD PAPA'S CAR`, type: 'accent' },
    ];

    let timeouts = [];

    timeline.forEach(({ t, text, type }) => {
      const timeout = setTimeout(() => {
        addLog(text, type);
        if (t === 19200) {
          setShowComplete(true);
        }
      }, t);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [started, driver, playerName]);

  return (
    <section className="game">
      <div className="game-box">
        <div className="game-head">
          <div className="game-location">HIT THE ROAD</div>
          <h1>{driver?.name}'S ROAD</h1>
          <p>The journey begins.</p>
        </div>

        <div className="game-area">
          <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', maxHeight: '450px', overflow: 'auto' }}>
            {!started && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <button className="game-btn" onClick={() => setStarted(true)} style={{ padding: '16px 32px', fontSize: '14px' }}>
                  Start Journey
                </button>
              </div>
            )}

            {log.map((line, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '10px',
                  color: line.type === 'enchin' ? '#fca5a5' : line.type === 'player' ? '#93c5fd' : line.type === 'accent' ? '#f43f5e' : '#e2e8f0',
                  fontFamily: line.type === 'accent' ? 'Space Mono' : 'DM Sans',
                  fontWeight: line.type === 'accent' ? '700' : '400',
                  fontSize: line.type === 'accent' ? '16px' : '15px',
                  animation: 'fadeIn 0.4s ease',
                }}
              >
                {line.text}
              </div>
            ))}

            {showComplete && (
              <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '2px dashed rgba(255,255,255,0.2)' }}>
                <button className="game-btn" onClick={onComplete} style={{ padding: '14px 28px' }}>
                  Continue to Mission 3
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="game-message">
          <span style={{ fontSize: '12px', color: '#666' }}>
            {started ? 'Journey in progress...' : 'Click Start Journey'}
          </span>
        </div>
      </div>
    </section>
  );
}