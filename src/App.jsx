import { Component, useCallback, useEffect, useRef, useState } from 'react';
import './styles/app.css';

import { ENCHIN_IDS, byId } from './data';
import { clearAll, remove, usePersistentState } from './lib/storage';
import { cleanScores, leaderInfo, rankEnchins } from './lib/scoring';
import { setMusicEnabled, setSfxEnabled, setTrack, setVolume, sfx } from './lib/sound';

import Sidebar from './components/Sidebar';
import { Btn, Modal } from './components/ui';
import Intro from './screens/Intro';
import NameScreen, { cleanName } from './screens/NameScreen';
import RoadStops from './screens/RoadStops';
import Ending from './screens/Ending';
import MG1Seating from './games/MG1Seating';
import MG2Quiz from './games/MG2Quiz';
import MG3Customize from './games/MG3Customize';
import MG4Journey from './games/MG4Journey';

const GAME_IDS = ['mg1', 'mg2', 'mg3'];
const STEPS = ['intro', 'name', 'stops', 'mg1', 'mg2', 'mg3', 'mg4', 'ending'];

const FRESH = { step: 'intro', playerName: '', results: {}, gain: null };

function repairState(v) {
  const playerName = cleanName(v?.playerName);
  const results = {};
  GAME_IDS.forEach((id) => {
    const r = v?.results?.[id];
    if (r && typeof r === 'object') results[id] = { ...r, scores: cleanScores(r.scores) };
  });
  if (v?.results?.mg4 && ENCHIN_IDS.includes(v.results.mg4.driverId)) results.mg4 = { driverId: v.results.mg4.driverId };
  let step = STEPS.includes(v?.step) ? v.step : 'intro';
  const all3 = GAME_IDS.every((id) => results[id]);
  if (!playerName && step !== 'intro') step = 'name';
  if (GAME_IDS.includes(step) && results[step]) step = 'stops';
  if (step === 'mg4' && !all3) step = 'stops';
  if (step === 'ending' && !results.mg4) step = all3 ? 'mg4' : 'stops';
  return { step, playerName, results, gain: null };
}

export default function App() {
  const [game, setGame] = usePersistentState('app', FRESH, repairState);
  const [settings, setSettings] = usePersistentState('settings', { music: true, sfx: true, volume: 0.8 }, (v) => ({
    music: v.music !== false,
    sfx: v.sfx !== false,
    volume: Number.isFinite(Number(v.volume)) ? Math.max(0, Math.min(1, Number(v.volume))) : 0.8,
  }));
  // A reload always lands on the title screen (it also unlocks audio with a tap),
  // then "Continue" jumps back to wherever the player was.
  const [booted, setBooted] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [redoId, setRedoId] = useState(null);
  const [toast, setToast] = useState(null);
  const [storyKey, setStoryKey] = useState(0);
  const mainRef = useRef(null);

  const { step, playerName, results } = game;
  const all3 = GAME_IDS.every((id) => results[id]);
  const view = booted ? step : 'intro';

  /* ---------------- sound settings ---------------- */
  useEffect(() => setMusicEnabled(settings.music), [settings.music]);
  useEffect(() => setSfxEnabled(settings.sfx), [settings.sfx]);
  useEffect(() => setVolume(settings.volume), [settings.volume]);
  useEffect(() => {
    // The uploaded song plays continuously on the route map and mini games 1–3,
    // and stops once the journey (mini game 4) begins.
    if (['stops', 'mg1', 'mg2', 'mg3'].includes(view)) setTrack('song');
    else if (view === 'mg4') setTrack(null);
    else setTrack('road');
  }, [view]);

  /* ---------------- navigation ---------------- */
  const go = useCallback(
    (target) => {
      setGame((g) => {
        const done3 = GAME_IDS.every((id) => g.results[id]);
        let t = target;
        if (!g.playerName && !['intro', 'name'].includes(t)) t = 'name';
        if (GAME_IDS.includes(t) && g.results[t]) t = 'stops';
        if (t === 'mg4' && !done3) t = 'stops';
        if (t === 'ending' && !g.results.mg4) t = 'stops';
        return g.step === t ? g : { ...g, step: t };
      });
    },
    [setGame],
  );

  // scroll to top on every screen change
  useEffect(() => {
    window.scrollTo({ top: 0 });
    mainRef.current?.scrollTo?.({ top: 0 });
  }, [view]);

  // Browser/phone back button: from a mini-game, go back to the route map instead of leaving the site.
  const stepRef = useRef(view);
  stepRef.current = view;
  useEffect(() => {
    if (['mg1', 'mg2', 'mg3', 'mg4'].includes(view)) window.history.pushState({ endrive: view }, '');
  }, [view]);
  useEffect(() => {
    const onPop = () => {
      if (['mg1', 'mg2', 'mg3', 'mg4'].includes(stepRef.current)) {
        sfx.back();
        go('stops');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [go]);

  /* ---------------- game flow ---------------- */
  const completing = useRef(false);
  const completeGame = (id, payload) => {
    if (completing.current) return;
    completing.current = true;
    window.setTimeout(() => (completing.current = false), 800);
    const scores = cleanScores(payload?.scores);
    setGame((g) => {
      if (g.results[id]) return { ...g, step: 'stops' }; // already counted — never double-score
      return {
        ...g,
        step: 'stops',
        results: { ...g.results, [id]: { ...payload, scores } },
        gain: { key: Date.now(), id, scores },
      };
    });
    remove(`draft:${id}`);
    const gains = ENCHIN_IDS.filter((e) => scores[e] > 0).map((e) => `${byId(e).name} +${scores[e]}`);
    setToast({ key: Date.now(), title: 'Stop complete!', text: gains.join(' · ') || 'Points added.' });
    window.setTimeout(() => sfx.points(), 250);
  };

  const redo = (id) => {
    setRedoId(null);
    remove(`draft:${id}`);
    setGame((g) => {
      const next = { ...g.results };
      delete next[id];
      return { ...g, results: next, step: id, gain: null };
    });
  };

  const restart = () => {
    setConfirmRestart(false);
    clearAll();
    setSettings((s) => ({ ...s }));
    setGame({ ...FRESH });
    setBooted(false);
    setToast(null);
    sfx.whoosh();
  };

  useEffect(() => {
    if (view !== 'stops') setToast(null);
  }, [view]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const driverId = results.mg4?.driverId || rankEnchins(results)[0]?.id;

  /* ---------------- screens ---------------- */
  const toggleMusic = () => {
    setSettings((s) => ({ ...s, music: !s.music }));
    sfx.tap();
  };
  const toggleSfx = () => {
    setSettings((s) => ({ ...s, sfx: !s.sfx }));
    window.setTimeout(() => sfx.tap(), 30);
  };

  const restartModal = (
    <Modal
      open={confirmRestart}
      title="Start the whole trip over?"
      tone="warn"
      onClose={() => setConfirmRestart(false)}
      actions={
        <>
          <Btn variant="ghost" onClick={() => setConfirmRestart(false)} data-autofocus>
            Keep playing
          </Btn>
          <Btn variant="danger" onClick={restart} sound={null}>
            Yes, start over
          </Btn>
        </>
      }
    >
      <p>This clears your name, every stop and all driver points. It can’t be undone.</p>
    </Modal>
  );

  if (view === 'intro') {
    const hasSave = !!playerName && step !== 'intro';
    return (
      <>
        <Intro
          hasSave={hasSave}
          savedName={playerName}
          music={settings.music}
          onToggleMusic={toggleMusic}
          onBegin={() => {
            setBooted(true);
            go(playerName ? 'stops' : 'name');
          }}
          onContinue={() => setBooted(true)}
          onNewGame={() => setConfirmRestart(true)}
        />
        {restartModal}
      </>
    );
  }

  if (view === 'name') {
    return (
      <NameScreen
        onBack={() => {
          setBooted(false);
          setGame((g) => ({ ...g, step: 'intro' }));
        }}
        onComplete={(name) => setGame((g) => ({ ...g, playerName: name, step: 'stops' }))}
      />
    );
  }

  let screen = null;
  if (view === 'stops') screen = <RoadStops results={results} playerName={playerName} onSelect={go} onRedo={(id) => setRedoId(id)} />;
  if (view === 'mg1') screen = <MG1Seating playerName={playerName} onComplete={(p) => completeGame('mg1', p)} />;
  if (view === 'mg2') screen = <MG2Quiz playerName={playerName} onComplete={(p) => completeGame('mg2', p)} />;
  if (view === 'mg3') screen = <MG3Customize playerName={playerName} onComplete={(p) => completeGame('mg3', p)} />;
  if (view === 'mg4' && all3)
    screen = (
      <MG4Journey
        key={storyKey}
        playerName={playerName}
        driverId={driverId}
        results={results}
        onComplete={() => setGame((g) => ({ ...g, results: { ...g.results, mg4: { driverId } }, step: 'ending' }))}
      />
    );
  if (view === 'ending')
    screen = (
      <Ending
        playerName={playerName}
        results={results}
        driverId={driverId}
        onReplay={() => setConfirmRestart(true)}
        onReplayStory={() => {
          setStoryKey((k) => k + 1);
          setGame((g) => ({ ...g, step: 'mg4' }));
        }}
      />
    );

  const leader = leaderInfo(results);

  return (
    <div className={`shell view-${view}`}>
      <Sidebar
        playerName={playerName}
        results={results}
        step={view}
        gain={game.gain}
        onNavigate={(t) => {
          sfx.tap();
          go(t);
        }}
        onRestart={() => setConfirmRestart(true)}
        music={settings.music}
        sfxOn={settings.sfx}
        onToggleMusic={toggleMusic}
        onToggleSfx={toggleSfx}
        volume={settings.volume}
        onVolume={(v) => setSettings((st) => ({ ...st, volume: v }))}
      />
      <main className="main" ref={mainRef} key={view}>
        {screen || (
          <div className="page">
            <p>Hmm, that road is closed.</p>
            <Btn onClick={() => go('stops')}>Back to the route</Btn>
          </div>
        )}
      </main>

      {toast && (
        <div className="toast" key={toast.key} role="status">
          <strong>{toast.title}</strong>
          <span>{toast.text}</span>
          {leader.leaderId && <em>{leader.tiedIds.length > 1 ? `${byId(leader.leaderId).name} leads on the tie-break!` : `${byId(leader.leaderId).name} is leading!`}</em>}
        </div>
      )}

      <Modal
        open={!!redoId}
        title="Redo this stop?"
        onClose={() => setRedoId(null)}
        actions={
          <>
            <Btn variant="ghost" onClick={() => setRedoId(null)} data-autofocus>
              Never mind
            </Btn>
            <Btn variant="primary" onClick={() => redo(redoId)}>
              Redo it
            </Btn>
          </>
        }
      >
        <p>Your points from this stop will be removed and replaced by your new answers. Points from other stops stay safe.</p>
      </Modal>
      {restartModal}
    </div>
  );
}

/* ---------------- Crash guard ---------------- */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error(error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="crash">
        <div className="modal">
          <h2 className="modal-title">Oops, we hit a pothole.</h2>
          <p>Something went wrong. Your progress is saved, so reloading usually fixes it.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { clearAll(); window.location.reload(); }}>
              Reset game
            </button>
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
