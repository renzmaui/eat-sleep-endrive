import { useEffect, useRef, useState } from 'react';
import { ENCHINS, ENCHIN_IDS, byId, img } from '../data';
import { Btn, Confetti, Icon, SafeImg } from '../components/ui';
import { GameHead } from './MG1Seating';
import { usePersistentState } from '../lib/storage';
import { emptyScores } from '../lib/scoring';
import { renderInstaxCard, saveImage } from '../lib/exportImage';
import { useCard } from '../lib/useCard';
import { sfx } from '../lib/sound';

const QUESTIONS = [
  'Who would take pictures of every pretty view, funny sign, and random cow outside the window?',
  'Before the trip begins, who would study the map so carefully that they know the route, rest stops, and possible detours?',
  'Who would start a car game and invent new rules halfway through when they start losing?',
  'Who would check the weather and traffic before leaving, just in case the road trip suddenly becomes a mission?',
  'Who would lead a dramatic car sing-along while confidently singing the wrong lyrics?',
  'Who would notice that the group is going the wrong way before anyone else?',
  'Who would turn the entire trip into a travel vlog before the car even leaves the driveway?',
  'Who would remain calm during heavy rain and act like they have everything completely under control?',
  'Who would demand a detour every time they spotted an interesting roadside attraction?',
  'Who would remember where the next gas station is, even though nobody asked them to?',
  'Who would control the playlist and skip every song after listening to only three seconds?',
  'Who would read a confusing road sign instead of confidently guessing what it means?',
  'Who would give fake historical facts about every town, building, or cow the car passes?',
  'Who would make sure everyone is ready before the trip starts instead of shouting, “Wait, I forgot something!” after leaving?',
  'Who would become the unofficial photographer and take pictures of everyone while they are not looking?',
];

const TIE_BREAKER =
  'The GPS stops working, the group misses the exit, and everyone starts panicking. Who would calmly figure out what to do next while everyone else says, “I thought you knew where we were going?”';

function joinNames(ids) {
  const n = ids.map((id) => byId(id).name);
  return n.length <= 2 ? n.join(' & ') : `${n.slice(0, -1).join(', ')} & ${n.at(-1)}`;
}

function tally(answers, tie) {
  const s = emptyScores();
  answers.forEach((id) => {
    if (id in s) s[id] += 1;
  });
  if (tie && tie in s) s[tie] += 1;
  return s;
}

function topIds(scores) {
  const max = Math.max(...Object.values(scores));
  return ENCHIN_IDS.filter((id) => scores[id] === max);
}

export default function MG2Quiz({ playerName, onComplete }) {
  const [draft, setDraft] = usePersistentState(
    'draft:mg2',
    { answers: [], tie: null },
    (v) => ({
      answers: Array.isArray(v.answers) ? v.answers.filter((a) => ENCHIN_IDS.includes(a)).slice(0, QUESTIONS.length) : [],
      tie: ENCHIN_IDS.includes(v.tie) ? v.tie : null,
    }),
  );
  const { answers, tie } = draft;
  const [picked, setPicked] = useState(null);
  const lock = useRef(false);

  const base = tally(answers, null);
  const allAnswered = answers.length >= QUESTIONS.length;
  const tiedIds = allAnswered ? topIds(base) : [];
  const needsTie = allAnswered && tiedIds.length > 1 && !tie;
  const finished = allAnswered && (tiedIds.length === 1 || !!tie);

  const qIndex = Math.min(answers.length, QUESTIONS.length - 1);
  const question = needsTie ? TIE_BREAKER : QUESTIONS[qIndex];
  const options = needsTie ? ENCHINS.filter((e) => tiedIds.includes(e.id)) : ENCHINS;

  useEffect(() => setPicked(null), [answers.length, needsTie]);

  const answer = (id) => {
    if (lock.current) return;
    lock.current = true;
    setPicked(id);
    sfx.pop();
    window.setTimeout(() => {
      setDraft((d) => (needsTie ? { ...d, tie: id } : { ...d, answers: [...d.answers, id].slice(0, QUESTIONS.length) }));
      lock.current = false;
    }, 380);
  };

  const back = () => {
    if (lock.current) return;
    sfx.back();
    setDraft((d) => (d.tie ? { ...d, tie: null } : { answers: d.answers.slice(0, -1), tie: null }));
  };

  if (finished) {
    const scores = tally(answers, tie);
    const winnerId = tie && tiedIds.includes(tie) ? tie : topIds(scores)[0];
    return (
      <QuizResult
        playerName={playerName}
        scores={scores}
        winnerId={winnerId}
        onRetake={() => {
          sfx.whoosh();
          setDraft({ answers: [], tie: null });
        }}
        onBack={back}
        onContinue={() => onComplete({ answers, tie, winnerId, scores })}
      />
    );
  }

  const progress = needsTie ? 1 : answers.length / QUESTIONS.length;

  return (
    <section className="page game-page mg2">
      <GameHead num="02" place="Bus Stop" title="Who would do it?" sub="Pick the Enchin who fits each road-trip moment best. Go with your gut." />

      <div className="quiz-card" key={needsTie ? 'tie' : answers.length}>
        <div className="quiz-meta">
          <span className={`quiz-count ${needsTie ? 'is-tie' : ''}`}>{needsTie ? 'TIE-BREAKER!' : `QUESTION ${answers.length + 1} / ${QUESTIONS.length}`}</span>
          <span className="quiz-track" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </span>
        </div>
        {needsTie && <p className="tie-note">It’s a tie between {joinNames(tiedIds)}. One last question…</p>}
        <h2 className="quiz-q">{question}</h2>

        <div className={`quiz-options n${options.length}`}>
          {options.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`quiz-opt ${picked === e.id ? 'is-picked' : ''} ${picked && picked !== e.id ? 'is-dim' : ''}`}
              style={{ '--c': e.color }}
              onClick={() => answer(e.id)}
              onPointerEnter={() => sfx.hover()}
              disabled={!!picked}
              aria-label={`Choose ${e.name}`}
            >
              <SafeImg src={img.flower(e.id)} alt="" enchinId={e.id} />
              <span>{e.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="action-bar">
        <div className="action-buttons spread">
          <Btn variant="ghost" onClick={back} disabled={answers.length === 0 && !tie} sound={null}>
            <Icon.back /> Previous
          </Btn>
          <span className="quiz-dots" aria-hidden="true">
            {QUESTIONS.map((_, i) => (
              <i key={i} className={i < answers.length ? 'is-done' : i === answers.length ? 'is-now' : ''} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}

function QuizResult({ playerName, scores, winnerId, onRetake, onBack, onContinue }) {
  const winner = byId(winnerId);
  const max = Math.max(1, ...Object.values(scores));
  const [leaving, setLeaving] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => sfx.fanfare(), []);
  const sorted = [...ENCHINS].sort((a, b) => scores[b.id] - scores[a.id]);
  const photo = useCard(() => renderInstaxCard({ kind: 'mg2', enchinId: winner.id, playerName }), [winner.id, playerName]);

  return (
    <section className="page game-page mg2 result-page">
      <Confetti />
      <GameHead num="02" place="Bus Stop" title={`The quiz picks ${winner.name}!`} sub={`${playerName ? `${playerName}, y` : 'Y'}our answers point to one very capable Enchin.`} />

      <div className="result-grid">
        <figure className="polaroid tilt-l">
          <SafeImg src={img.driver(winner.id)} alt={`${winner.name} as the chosen driver`} enchinId={winner.id} />
          <figcaption>Looks like {winner.name} could be driving…</figcaption>
        </figure>
        <div className="vote-board">
          <span className="sb-label">QUIZ VOTES · +1 POINT EACH</span>
          <ul>
            {sorted.map((e) => (
              <li key={e.id} className={e.id === winnerId ? 'is-winner' : ''} style={{ '--c': e.color }}>
                <SafeImg src={img.flower(e.id)} alt="" enchinId={e.id} />
                <span className="vb-name">{e.name}</span>
                <span className="vb-bar">
                  <span style={{ width: `${(scores[e.id] / max) * 100}%` }} />
                </span>
                <strong>{scores[e.id]}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="action-bar">
        <div className="action-buttons wrap">
          <Btn variant="ghost" onClick={onBack} sound={null}>
            <Icon.back /> Change last answer
          </Btn>
          <Btn variant="ghost" onClick={onRetake} sound={null}>
            <Icon.restart /> Retake quiz
          </Btn>
          <Btn
            variant="soft"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await saveImage(photo ? { blob: photo.blob, filename: `endrive-mg2-${winner.id}.png` } : { url: img.driverPng(winner.id), filename: `${winner.id}-chosen-driver.png` });
              setSaving(false);
            }}
          >
            <Icon.save /> {saving ? 'Saving…' : 'Save photo'}
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
