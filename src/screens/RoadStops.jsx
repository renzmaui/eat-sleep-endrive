import { img } from '../data';
import { Btn, Icon, SafeImg } from '../components/ui';
import { sfx } from '../lib/sound';

const CREW = { mg1: ['wonchu', 'noxstar'], mg2: ['kishu', 'snowe'], mg3: ['pu-ni', 'jakey'] };

function Pals({ id }) {
  return CREW[id].map((e, i) => (
    <SafeImg key={e} src={img.intro(e)} alt="" className={`pal pal${i}`} enchinId={e} />
  ));
}

function StopArt({ id }) {
  if (id === 'mg1')
    return (
      <div className="stop-art scene scene-shed">
        <span className="sc-sun" />
        <span className="sc-ground" />
        <span className="shed-roof" />
        <span className="shed-post l" />
        <span className="shed-post r" />
        <span className="shed-back" />
        <span className="shed-bench" />
        <Pals id={id} />
      </div>
    );
  if (id === 'mg2')
    return (
      <div className="stop-art scene scene-bus">
        <span className="sc-sun" />
        <span className="sc-ground" />
        <span className="bus-roof" />
        <span className="bus-glass" />
        <span className="bus-post l" />
        <span className="bus-post r" />
        <span className="bus-bench" />
        <span className="bus-sign">
          <b>BUS</b>
        </span>
        <span className="bus-pole" />
        <Pals id={id} />
      </div>
    );
  if (id === 'mg3')
    return (
      <div className="stop-art scene scene-gas">
        <span className="sc-sun" />
        <span className="sc-ground" />
        <span className="gas-canopy">
          <b>GAS</b>
        </span>
        <span className="gas-pillar l" />
        <span className="gas-pillar r" />
        <span className="gas-pump">
          <i />
        </span>
        <span className="gas-hose" />
        <Pals id={id} />
      </div>
    );
  return (
    <div className="stop-art art-journey">
      <SafeImg src={img.vehicle} alt="" />
    </div>
  );
}

const STOP_META = {
  mg1: { place: 'Waiting Shed', task: 'Seat the ENCHIN', blurb: 'Drag everyone into the van. Pick carefully… someone has to take the wheel.' },
  mg2: { place: 'Bus Stop', task: 'Road Trip Quiz', blurb: '15 “who would…?” questions about your road trip crew.' },
  mg3: { place: 'Gas Station', task: 'Pick Your Look', blurb: 'Car, water bottle, shirt and cap. Style the whole trip.' },
};

export default function RoadStops({ results, playerName, onSelect, onRedo }) {
  const done = { mg1: !!results.mg1, mg2: !!results.mg2, mg3: !!results.mg3 };
  const count = Object.values(done).filter(Boolean).length;
  const unlocked = count === 3;
  const nextId = ['mg1', 'mg2', 'mg3'].find((k) => !done[k]);

  return (
    <section className="page stops">
      <header className="page-head">
        <p className="eyebrow">EN-DRIVE ROUTE · {count}/3 STOPS</p>
        <h1 className="page-title">
          Three stops.
          <span> One road trip.</span>
        </h1>
        <p className="page-sub">
          {unlocked
            ? `All stops cleared, ${playerName}. The road is calling.`
            : count === 0
              ? `Hi ${playerName}! Visit each stop in any order. Every choice nudges who ends up driving.`
              : `Nice driving, ${playerName}. ${3 - count} stop${3 - count === 1 ? '' : 's'} to go.`}
        </p>
      </header>

      <div className={`roadmap ${unlocked ? 'is-unlocked' : ''}`} style={{ '--n': unlocked ? 4 : 3, '--van': unlocked ? 2.85 : ['mg1', 'mg2', 'mg3'].indexOf(nextId) }}>
        <div className="rm-road" aria-hidden="true">
          <div className="rm-dash" />
          <div className="rm-van">
            <SafeImg src={img.vehicle} alt="" />
          </div>
          {!unlocked && <div className="rm-fade" />}
        </div>

        <ol className="rm-stops">
          {['mg1', 'mg2', 'mg3'].map((id, i) => {
            const m = STOP_META[id];
            const isDone = done[id];
            const isNext = id === nextId;
            return (
              <li key={id} className={`rm-stop ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}>
                <article className={`stop-card ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`} style={{ '--i': i }}>
                  <button
                    type="button"
                    className="stop-hit"
                    onClick={() => {
                      if (isDone) return;
                      sfx.whoosh();
                      onSelect(id);
                    }}
                    disabled={isDone}
                    aria-label={`Stop ${i + 1}: ${m.place}. ${isDone ? 'Completed' : m.task}`}
                  >
                    <span className="stop-num">STOP 0{i + 1}</span>
                    <StopArt id={id} />
                    <span className="stop-text">
                      <strong>{m.place}</strong>
                      <em>{m.task}</em>
                      <small>{m.blurb}</small>
                    </span>
                    <span className="stop-cta">
                      {isDone ? (
                        <>
                          <Icon.check /> Completed
                        </>
                      ) : (
                        <>
                          {isNext ? 'Start here' : 'Play'} <Icon.arrow />
                        </>
                      )}
                    </span>
                  </button>
                  {isDone && (
                    <span className="stamp" aria-hidden="true">
                      DONE
                    </span>
                  )}
                </article>
                {isDone && !results.mg4 && (
                  <button type="button" className="redo-link" onClick={() => onRedo(id)}>
                    <Icon.restart width="14" height="14" /> Redo this stop
                  </button>
                )}
                <span className="rm-pole" aria-hidden="true" />
                <span className="rm-marker" aria-hidden="true">
                  {isDone ? <Icon.check /> : i + 1}
                </span>
              </li>
            );
          })}

          {unlocked && (
            <li className="rm-stop rm-arch-stop">
              <button
                type="button"
                className="rm-arch"
                onClick={() => {
                  sfx.fanfare();
                  onSelect('mg4');
                }}
                aria-label="The Journey: drive through the arch and find out who is driving"
              >
                <span className="arch-frame" aria-hidden="true">
                  <span className="arch-banner">
                    <span className="arch-check" />
                    <b>THE JOURNEY</b>
                    <span className="arch-check" />
                  </span>
                  <span className="arch-leg l" />
                  <span className="arch-leg r" />
                  <span className="arch-lights">
                    <i />
                    <i />
                    <i />
                  </span>
                </span>
                <span className="arch-text">
                  <em>All 3 stops cleared</em>
                  <strong>Who’s driving?</strong>
                </span>
                <span className="stop-cta arch-cta">
                  Drive through <Icon.arrow />
                </span>
              </button>
              <span className="rm-pole" aria-hidden="true" />
              <span className="rm-marker rm-finish" aria-hidden="true" />
            </li>
          )}
        </ol>
      </div>

      {nextId && (
        <div className="stops-cta">
          <Btn variant="primary" size="lg" sound="whoosh" onClick={() => onSelect(nextId)}>
            Go to {STOP_META[nextId].place} <Icon.arrow />
          </Btn>
        </div>
      )}
    </section>
  );
}
