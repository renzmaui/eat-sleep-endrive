import { useState } from "react";
import "./App.css";

import MG1Seating from "./games/MG1Seating";
import MG2Quiz from "./games/MG2Quiz";
import MG3Customize from "./games/MG3Customize";
import MG4Journey from "./games/MG4Journey";
import RoadStops from "./RoadStops";

const ENCHINS = [
  { id: "wonchu", name: "WONCHU", papaName: "Jungwon" },
  { id: "noxstar", name: "NOXSTAR", papaName: "Jay" },
  { id: "jakey", name: "JAKEY", papaName: "Jake" },
  { id: "snowe", name: "SNOWE", papaName: "Sunghoon" },
  { id: "kishu", name: "KISHU", papaName: "Sunoo" },
  { id: "puni", name: "PU-NI", papaName: "Ni-ki" },
];

function EnchinGroup() {
  return (
    <div className="story-enchin-group" aria-hidden="true">
      <img
        className="story-enchin-image story-enchin-puni"
        src="/images/intro-pu-ni.png"
        alt=""
      />

      <img
        className="story-enchin-image story-enchin-noxstar"
        src="/images/intro-noxstar.png"
        alt=""
      />

      <img
        className="story-enchin-image story-enchin-wonchu"
        src="/images/intro-wonchu.png"
        alt=""
      />

      <img
        className="story-enchin-image story-enchin-kishu"
        src="/images/intro-kishu.png"
        alt=""
      />

      <img
        className="story-enchin-image story-enchin-snowe"
        src="/images/intro-snowe.png"
        alt=""
      />

      <img
        className="story-enchin-image story-enchin-jakey"
        src="/images/intro-jakey.png"
        alt=""
      />
    </div>
  );
}

function Guardrail({ prefix = "" }) {
  return (
    <div className={`${prefix}road-guardrail`}>
      <div className={`${prefix}guardrail-beam`} />

      <div className={`${prefix}guardrail-post ${prefix}post-1`} />
      <div className={`${prefix}guardrail-post ${prefix}post-2`} />
      <div className={`${prefix}guardrail-post ${prefix}post-3`} />
      <div className={`${prefix}guardrail-post ${prefix}post-4`} />
      <div className={`${prefix}guardrail-post ${prefix}post-5`} />
      <div className={`${prefix}guardrail-post ${prefix}post-6`} />
      <div className={`${prefix}guardrail-post ${prefix}post-7`} />
      <div className={`${prefix}guardrail-post ${prefix}post-8`} />
    </div>
  );
}

function RoadScene({ prefix = "" }) {
  return (
    <div className={`${prefix}road`} aria-hidden="true">
      <Guardrail prefix={prefix} />

      <div className={`${prefix}road-line ${prefix}road-line-1`} />
      <div className={`${prefix}road-line ${prefix}road-line-2`} />
      <div className={`${prefix}road-line ${prefix}road-line-3`} />
    </div>
  );
}

function SeaScene({ prefix = "" }) {
  return (
    <div className={`${prefix}sea`} aria-hidden="true">
      <div className={`${prefix}sea-horizon`} />
      <div className={`${prefix}sea-glint ${prefix}sea-glint-1`} />
      <div className={`${prefix}sea-glint ${prefix}sea-glint-2`} />
      <div className={`${prefix}sea-glint ${prefix}sea-glint-3`} />
    </div>
  );
}

function VehicleScene({ prefix = "" }) {
  return (
    <div className={`${prefix}vehicle-scene`} aria-hidden="true">
      <div className={`${prefix}vehicle-shadow`} />

      <img
        className={`${prefix}vehicle-image`}
        src="/images/intro-vehicle.png"
        alt=""
      />

      <div className={`${prefix}enchin-line`}>
        <img
          className={`${prefix}enchin ${prefix}enchin-puni`}
          src="/images/intro-pu-ni.png"
          alt=""
        />

        <img
          className={`${prefix}enchin ${prefix}enchin-noxstar`}
          src="/images/intro-noxstar.png"
          alt=""
        />

        <img
          className={`${prefix}enchin ${prefix}enchin-wonchu`}
          src="/images/intro-wonchu.png"
          alt=""
        />

        <img
          className={`${prefix}enchin ${prefix}enchin-kishu`}
          src="/images/intro-kishu.png"
          alt=""
        />

        <img
          className={`${prefix}enchin ${prefix}enchin-snowe`}
          src="/images/intro-snowe.png"
          alt=""
        />

        <img
          className={`${prefix}enchin ${prefix}enchin-jakey`}
          src="/images/intro-jakey.png"
          alt=""
        />
      </div>
    </div>
  );
}

function IntroBackground() {
  return (
    <>
      <div className="intro-sky-glow" aria-hidden="true" />
      <div className="intro-stars" aria-hidden="true" />
      <div className="intro-clouds" aria-hidden="true" />

      <div className="intro-cloud cloud-left" aria-hidden="true" />
      <div className="intro-cloud cloud-right" aria-hidden="true" />

      <SeaScene prefix="intro-" />
      <RoadScene prefix="intro-" />
    </>
  );
}

function Intro({ onBegin }) {
  return (
    <section className="intro">
      <IntroBackground />

      <div className="intro-content">
        <div className="intro-eyebrow">
          AFTER THE SIX KEYS...
        </div>

        <h1 className="intro-title">
          Eat, Sleep...
          <span>EN-Drive</span>
        </h1>

        <div className="intro-divider" aria-hidden="true">
          <span />
          <b>✦</b>
          <span />
        </div>

        <p className="intro-subtitle">
          THE ROAD TRIP BEGINS
        </p>
      </div>

      <div className="intro-bottom">
        <div className="intro-location">
          <span className="location-dot" aria-hidden="true" />
          <span>LEAVING THE ISLAND</span>

          <span className="location-arrow" aria-hidden="true">
            →
          </span>

          <span>CITY UNKNOWN</span>
        </div>

        <button className="begin-btn" onClick={onBegin}>
          START THE JOURNEY

          <span className="begin-arrow" aria-hidden="true">
            →
          </span>
        </button>

        <div className="intro-hint">
          WHO WILL END UP DRIVING?
        </div>

        <VehicleScene prefix="intro-" />
      </div>
    </section>
  );
}

function NameScreen({ onComplete }) {
  const [name, setName] = useState("");

  function submitName() {
    const trimmedName = name.trim();

    if (trimmedName) {
      onComplete(trimmedName);
    }
  }

  return (
    <section className="story">
      <div className="story-background" aria-hidden="true">
        <div className="story-sky-glow" />
        <div className="story-stars" />

        <div className="story-clouds" />
        <div className="story-cloud story-cloud-left" />
        <div className="story-cloud story-cloud-right" />

        <SeaScene prefix="story-" />
        <RoadScene prefix="story-" />
      </div>

      <VehicleScene prefix="story-" />

      <div className="story-card">
        <div className="story-text">
          <div>
            The island is behind us.
            <br />
            The trip is ahead of us.
            <br />
            What name should we put on the passenger list?
          </div>
          <div className="story-speaker">
            <span></span>
          </div>
        </div>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submitName();
            }
          }}
        />

        <button
          className="story-btn"
          disabled={!name.trim()}
          onClick={submitName}
        >
          LET&apos;S GO!
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

        <p>
          You hit the road and uncovered a secret from Papa’s past.
        </p>

        <h2>NEXT: BUILD PAPA’S CAR</h2>

        <button className="game-btn" onClick={onRestart}>
          REPLAY
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const [step, setStep] = useState("intro");
  const [playerName, setPlayerName] = useState("");

  const [completedGames, setCompletedGames] = useState({
    mg1: false,
    mg2: false,
    mg3: false,
  });

  const [driverScores, setDriverScores] = useState(
    Object.fromEntries(
      ENCHINS.map((enchin) => [enchin.id, 0])
    )
  );

  function beginIntro() {
    setStep("name");
  }

  function completeName(name) {
    setPlayerName(name);

    setCompletedGames({
      mg1: false,
      mg2: false,
      mg3: false,
    });

    setStep("stops");
  }

  function addScores(scoreDeltas) {
    setDriverScores((previousScores) => {
      const updatedScores = { ...previousScores };

      Object.entries(scoreDeltas || {}).forEach(
        ([enchinId, delta]) => {
          if (typeof delta !== "number") {
            return;
          }

          updatedScores[enchinId] =
            (updatedScores[enchinId] || 0) + delta;
        }
      );

      return updatedScores;
    });
  }

function completeMiniGame(gameId, scoreDeltas) {
  addScores(scoreDeltas);

  setCompletedGames((previousGames) => ({
    ...previousGames,
    [gameId]: true,
  }));

  setStep("stops");
}

  function restartMission() {
    setStep("intro");
    setPlayerName("");

    setCompletedGames({
      mg1: false,
      mg2: false,
      mg3: false,
    });

    setDriverScores(
      Object.fromEntries(
        ENCHINS.map((enchin) => [enchin.id, 0])
      )
    );
  }

  if (step === "intro") {
    return <Intro onBegin={beginIntro} />;
  }

  if (step === "name") {
    return <NameScreen onComplete={completeName} />;
  }

  if (step === "stops") {
    return (
      <RoadStops
        completedGames={completedGames}
        onSelectGame={(gameId) => setStep(gameId)}
      />
    );
  }

  if (step === "mg1") {
    return (
      <MG1Seating
        playerName={playerName}
        enchins={ENCHINS}
        onNext={(scores) => {
          completeMiniGame("mg1", scores);
        }}
      />
    );
  }

  if (step === "mg2") {
    return (
      <MG2Quiz
        playerName={playerName}
        enchins={ENCHINS}
        onNext={(scores) => {
          completeMiniGame("mg2", scores);
        }}
      />
    );
  }

  if (step === "mg3") {
    return (
      <MG3Customize
        playerName={playerName}
        enchins={ENCHINS}
        onNext={(scores) => {
          completeMiniGame("mg3", scores);
        }}
      />
    );
  }

  if (step === "mg4") {
    return (
      <MG4Journey
        playerName={playerName}
        enchins={ENCHINS}
        driverScores={driverScores}
        onComplete={() => setStep("ending")}
      />
    );
  }

  if (step === "ending") {
    return <Ending onRestart={restartMission} />;
  }

  return null;
}