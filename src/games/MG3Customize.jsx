import { useEffect, useState } from 'react';
import { ENCHINS, ENCHIN_IDS, byId, img } from '../data';
import { Btn, Confetti, Icon, SafeImg } from '../components/ui';
import { GameHead } from './MG1Seating';
import { usePersistentState } from '../lib/storage';
import { emptyScores } from '../lib/scoring';
import { sfx } from '../lib/sound';
import { renderInstaxCard, saveImage } from '../lib/exportImage';
import { useCard } from '../lib/useCard';

const POINTS = 2;

const QUESTIONS = [
  {
    id: 'car',
    label: 'The Car',
    title: 'Six super-fast cars just zoomed past your ride. Which one caught your eye?',
    sub: 'Choose the car that would make you turn your head at the next rest stop.',
    image: img.car,
  },
  {
    id: 'waterBottle',
    label: 'The Bottle',
    title: 'The road is long and the sun is shining. Which water bottle are you bringing?',
    sub: 'Choose your trusty anti-dehydration companion for the journey.',
    image: img.water,
  },
  {
    id: 'shirt',
    label: 'The Shirt',
    title: 'The team is stopping for a group photo. Which shirt are you wearing?',
    sub: 'Pick the shirt that belongs in your road-trip OOTD post.',
    image: img.shirt,
  },
  {
    id: 'cap',
    label: 'The Cap',
    title: 'The sun is out and the cameras are ready. Which cap completes your look?',
    sub: 'Choose your final accessory before the road-trip photo shoot.',
    image: img.cap,
  },
];

const EMPTY = { car: null, waterBottle: null, shirt: null, cap: null };

export default function MG3Customize({ playerName, onComplete }) {
  const [draft, setDraft] = usePersistentState(
    'draft:mg3',
    { index: 0, answers: EMPTY, locked: false },
    (v) => {
      const answers = { ...EMPTY };
      Object.keys(EMPTY).forEach((k) => {
        if (ENCHIN_IDS.includes(v.answers?.[k])) answers[k] = v.answers[k];
      });
      const index = Math.max(0, Math.min(QUESTIONS.length - 1, Number(v.index) || 0));
      const locked = !!v.locked && Object.values(answers).every(Boolean);
      return { index, answers, locked };
    },
  );
  const { index, answers, locked } = draft;
  const q = QUESTIONS[index];
  const current = answers[q.id];
  const isLast = index === QUESTIONS.length - 1;
  const [dir, setDir] = useState(1);

  const choose = (id) => {
    sfx.pop();
    setDraft((d) => ({ ...d, answers: { ...d.answers, [q.id]: id } }));
  };

  const next = () => {
    if (!current) {
      sfx.error();
      return;
    }
    if (isLast) {
      sfx.lock();
      setDraft((d) => ({ ...d, locked: true }));
      return;
    }
    sfx.whoosh();
    setDir(1);
    setDraft((d) => ({ ...d, index: d.index + 1 }));
  };

  const back = () => {
    sfx.back();
    setDir(-1);
    setDraft((d) => ({ ...d, index: Math.max(0, d.index - 1) }));
  };

  const jump = (i) => {
    // only allow jumping to answered questions or the first unanswered one
    const firstOpen = QUESTIONS.findIndex((qq) => !answers[qq.id]);
    if (firstOpen !== -1 && i > firstOpen) return;
    sfx.tap();
    setDir(i > index ? 1 : -1);
    setDraft((d) => ({ ...d, index: i }));
  };

  if (locked) {
    const scores = emptyScores();
    Object.values(answers).forEach((id) => (scores[id] += POINTS));
    return (
      <StyleResult
        playerName={playerName}
        answers={answers}
        scores={scores}
        onEdit={() => {
          sfx.back();
          setDraft((d) => ({ ...d, locked: false }));
        }}
        onContinue={() => onComplete({ answers, scores })}
      />
    );
  }

  return (
    <section className="page game-page mg3">
      <GameHead num="03" place="Gas Station" title="Road trip ready!" sub={`${playerName ? `${playerName}, p` : 'P'}ick your road-trip look. Four picks, zero wrong answers.`} />

      <div className="mg3-layout">
        <nav className="look-board" aria-label="Your look so far">
          {QUESTIONS.map((qq, i) => {
            const a = answers[qq.id];
            return (
              <button
                key={qq.id}
                type="button"
                className={`look-slot ${i === index ? 'is-now' : ''} ${a ? 'is-filled' : ''}`}
                style={{ '--c': a ? byId(a).color : '#fffdf7' }}
                onClick={() => jump(i)}
                aria-label={`${qq.label}${a ? ': picked' : ': not picked yet'}`}
              >
                <span className="look-img">{a ? <SafeImg src={qq.image(a)} alt="" /> : <span className="look-q">{i + 1}</span>}</span>
                <small>{qq.label}</small>
              </button>
            );
          })}
        </nav>

        <div className={`style-card slide-${dir > 0 ? 'in' : 'back'}`} key={q.id}>
          <p className="style-step">
            PICK {index + 1} OF {QUESTIONS.length} · {q.label.toUpperCase()}
          </p>
          <h2 className="style-q">{q.title}</h2>
          <p className="style-sub">{q.sub}</p>

          <div className={`style-grid grid-${q.id}`}>
            {ENCHINS.map((e) => {
              const sel = current === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  className={`style-opt ${sel ? 'is-selected' : ''}`}
                  style={{ '--c': e.color }}
                  onClick={() => choose(e.id)}
                  onPointerEnter={() => sfx.hover()}
                  aria-pressed={sel}
                  aria-label={`${q.label.replace('The ', '')} option ${ENCHINS.indexOf(e) + 1}`}
                >
                  <span className="style-img">
                    <SafeImg src={q.image(e.id)} alt="" />
                  </span>
                  {sel && (
                    <span className="style-check" aria-hidden="true">
                      <Icon.check />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="action-bar">
        <p className="action-hint" aria-live="polite">
          {current ? `Nice pick. ${isLast ? 'Ready to lock in your look?' : 'On to the next pick!'}` : 'Tap one to choose it.'}
        </p>
        <div className="action-buttons">
          <Btn variant="ghost" onClick={back} disabled={index === 0} sound={null}>
            <Icon.back /> Back
          </Btn>
          <Btn variant="primary" onClick={next} disabled={!current} sound={null}>
            {isLast ? (
              <>
                Lock in look <Icon.lock />
              </>
            ) : (
              <>
                Next pick <Icon.arrow />
              </>
            )}
          </Btn>
        </div>
      </div>
    </section>
  );
}

function StyleResult({ playerName, answers, scores, onEdit, onContinue }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => sfx.fanfare(), []);
  const max = Math.max(...Object.values(scores));
  const tops = ENCHINS.filter((e) => scores[e.id] === max);
  const lead = tops.find((t) => t.id === answers.car) || tops[0];
  const [saving, setSaving] = useState(false);
  const picks = QUESTIONS.filter((q) => answers[q.id] === lead.id).map((q) => ({ kind: q.id === 'waterBottle' ? 'water' : q.id }));
  const photo = useCard(() => renderInstaxCard({ kind: 'mg3', enchinId: lead.id, playerName, picks }), [lead.id, playerName, JSON.stringify(answers)]);
  const headline = tops.length === 1 ? `Team ${lead.name} vibes!` : 'A mix-and-match icon!';

  return (
    <section className="page game-page mg3 result-page">
      <Confetti />
      <GameHead num="03" place="Gas Station" title="Look locked in!" sub={`${playerName ? `${playerName}, y` : 'Y'}our road-trip style is ready for the photo shoot.`} />

      <div className="outfit">
        {QUESTIONS.map((q, i) => {
          const e = byId(answers[q.id]);
          return (
            <figure key={q.id} className="outfit-item" style={{ '--c': e.color, '--i': i }}>
              <SafeImg src={q.image(e.id)} alt={q.label} />
              <figcaption>
                <strong>{q.label}</strong>
              </figcaption>
            </figure>
          );
        })}
      </div>

      <div className="style-verdict" style={{ '--c': lead.color }}>
        <SafeImg src={img.flower(lead.id)} alt="" enchinId={lead.id} />
        <div>
          <h2>{headline}</h2>
          <p>
            {tops.length === 1
              ? `${lead.name} matches your style best (+${scores[lead.id]} points).`
              : `Your picks split between ${tops.map((t) => t.name).join(', ')}.`}{' '}
            Every pick gave its Enchin +{POINTS}.
          </p>
          <ul className="chip-row">
            {ENCHINS.filter((e) => scores[e.id] > 0).map((e) => (
              <li key={e.id} style={{ '--c': e.color }}>
                {e.name} +{scores[e.id]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="action-bar">
        <div className="action-buttons wrap">
          <Btn variant="ghost" onClick={onEdit} sound={null}>
            <Icon.back /> Change my look
          </Btn>
          <Btn
            variant="soft"
            disabled={!photo || saving}
            onClick={async () => {
              setSaving(true);
              await saveImage({ blob: photo.blob, filename: `endrive-mg3-team-${lead.id}.png` });
              setSaving(false);
            }}
          >
            <Icon.save /> {saving ? 'Saving…' : photo ? 'Save photo' : 'Developing…'}
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
