import { useState, useEffect, useRef } from 'react';

export default function MG4Journey({ playerName, enchins, driverScores, onComplete }) {
  const [log, setLog] = useState([]);
  const [started, setStarted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  // Video state
  const [playingIntro, setPlayingIntro] = useState(false);
  const [playingFinal, setPlayingFinal] = useState(false);

  const introVideoRef = useRef(null);
  const finalVideoRef = useRef(null);

  const best = Object.entries(driverScores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'wonchu';
  const driver = enchins.find((e) => e.id === best);

  const addLog = (text, type = 'neutral') => {
    setLog((prev) => [...prev, { text, type }]);
  };

  // Start journey + intro video
  const handleStart = () => {
    setStarted(true);
    setPlayingIntro(true);
    // intro video will auto-play via ref effect
  };

  // When intro video ends, play final driver video
  const handleIntroEnded = () => {
    setPlayingIntro(false);
    setPlayingFinal(true);
    // final video will auto-play via ref effect
  };

  // When final driver video ends, start the text timeline
  const handleFinalEnded = () => {
    setPlayingFinal(false);
    // Now kick off the timeline
    startTimeline();
  };

  const startTimeline = () => {
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
  };

  // Auto-play videos when their "playing" state becomes true
  useEffect(() => {
    if (playingIntro && introVideoRef.current) {
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.play().catch(() => {
        // In case autoplay is blocked, you can show a "click to play" fallback if needed
      });
    }
  }, [playingIntro]);

  useEffect(() => {
    if (playingFinal && finalVideoRef.current) {
      finalVideoRef.current.currentTime = 0;
      finalVideoRef.current.play().catch(() => {
        // same as above
      });
    }
  }, [playingFinal]);

  if (!driver) return null;

  const introSrc = '/images/driver-reveal.mp4';
  const finalSrc = `/images/${driver.id}-final-driver.mp4`; // e.g. wonchu-final-driver.mp4

  return (
    <section className="game">
      <div className="game-box">
        <div className="game-head">
          <div className="game-location">HIT THE ROAD</div>
          <h1>{driver.name}'S ROAD</h1>
          <p>The journey begins.</p>
        </div>

        <div className="game-area">
          {/* Videos */}
          {(playingIntro || playingFinal) && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px' }}>
              {playingIntro && (
                <video
                  ref={introVideoRef}
                  src={introSrc}
                  style={{ maxWidth: '100%', maxHeight: '450px' }}
                  onEnded={handleIntroEnded}
                  controls={false}
                />
              )}
              {playingFinal && (
                <video
                  ref={finalVideoRef}
                  src={finalSrc}
                  style={{ maxWidth: '100%', maxHeight: '450px' }}
                  onEnded={handleFinalEnded}
                  controls={false}
                />
              )}
            </div>
          )}

          {/* Journey text */}
          {!playingIntro && !playingFinal && (
            <div
              className="journey-content"
              style={{
                padding: '30px',
                maxWidth: '800px',
                margin: '0 auto',
                maxHeight: '450px',
                overflow: 'auto',
              }}
            >
              {!started && (
                <div className="journey-start">
                  <button
                    className="game-btn"
                    onClick={handleStart}
                    style={{ padding: '16px 32px', fontSize: '14px' }}
                  >
                    Start Journey
                  </button>
                </div>
              )}

              {log.map((line, i) => (
                <div
                  key={i}
                  className={`journey-line ${line.type}`}
                  style={{
                    marginBottom: '10px',
                    color:
                      line.type === 'enchin'
                        ? '#fca5a5'
                        : line.type === 'player'
                        ? '#93c5fd'
                        : line.type === 'accent'
                        ? '#f43f5e'
                        : '#e2e8f0',
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
                <div className="journey-complete">
                  <button className="game-btn" onClick={onComplete} style={{ padding: '14px 28px' }}>
                    Continue to Mission 3
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="game-message">
          <span className="journey-status" style={{ fontSize: '12px', color: '#666' }}>
            {started
              ? playingIntro
                ? 'Playing driver reveal…'
                : playingFinal
                ? `Playing ${driver.name}'s reveal…`
                : 'Journey in progress...'
              : 'Click Start Journey'}
          </span>
        </div>
      </div>
    </section>
  );
}