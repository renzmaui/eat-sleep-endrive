import { useState } from 'react';
import './MG3Customize.css';

const ENCHINS = [
  {
    id: 'wonchu',
    name: 'Wonchu',
    carName: 'Mercedes',
    papa: 'Jungwon',
    carImage: '/images/wonchu-car.png',
    waterImage: '/images/wonchu-water.png',
    shirtImage: '/images/wonchu-shirt.png',
    capImage: '/images/wonchu-cap.png',
    driverImage: '/images/mg1driver-wonchu.png',
    color: '#f48fb1',
    fallback: '♡',
  },
  {
    id: 'noxstar',
    name: 'Noxstar',
    carName: 'Red Bull Racing',
    papa: 'Jay',
    carImage: '/images/noxstar-car.png',
    waterImage: '/images/noxstar-water.png',
    shirtImage: '/images/noxstar-shirt.png',
    capImage: '/images/noxstar-cap.png',
    driverImage: '/images/mg1driver-noxstar.png',
    color: '#9b87f5',
    fallback: '✦',
  },
  {
    id: 'jakey',
    name: 'Jakey',
    carName: 'McLaren',
    papa: 'Jake',
    carImage: '/images/jakey-car.png',
    waterImage: '/images/jakey-water.png',
    shirtImage: '/images/jakey-shirt.png',
    capImage: '/images/jakey-cap.png',
    driverImage: '/images/mg1driver-jakey.png',
    color: '#f8cf63',
    fallback: '★',
  },
  {
    id: 'snowe',
    name: 'Snowe',
    carName: 'Ferrari',
    papa: 'Sunghoon',
    carImage: '/images/snowe-car.png',
    waterImage: '/images/snowe-water.png',
    shirtImage: '/images/snowe-shirt.png',
    capImage: '/images/snowe-cap.png',
    driverImage: '/images/mg1driver-snowe.png',
    color: '#8ed8ef',
    fallback: '☁',
  },
  {
    id: 'kishu',
    name: 'Kishu',
    carName: 'Alpine',
    papa: 'Sunoo',
    carImage: '/images/kishu-car.png',
    waterImage: '/images/kishu-water.png',
    shirtImage: '/images/kishu-shirt.png',
    capImage: '/images/kishu-cap.png',
    driverImage: '/images/mg1driver-kishu.png',
    color: '#8ed9b2',
    fallback: '🍃',
  },
  {
    id: 'pu-ni',
    name: 'Pu-ni',
    carName: 'Aston Martin',
    papa: 'Ni-ki',
    carImage: '/images/pu-ni-car.png',
    waterImage: '/images/pu-ni-water.png',
    shirtImage: '/images/pu-ni-shirt.png',
    capImage: '/images/pu-ni-cap.png',
    driverImage: '/images/mg1driver-pu-ni.png',
    color: '#f4a36f',
    fallback: '🍑',
  },
];

const QUESTIONS = [
  {
    id: 'car',
    label: 'ROAD TRIP STYLE 01',
    title:
      'Six super-fast cars just zoomed past your ride. Which one caught your eye?',
    subtitle:
      'Choose the car that would make you turn your head at the next rest stop.',
  },
  {
    id: 'waterBottle',
    label: 'ROAD TRIP STYLE 02',
    title:
      'The road is long and the sun is shining. Which water bottle are you bringing?',
    subtitle:
      'Choose your trusty anti-dehydration companion for the journey.',
  },
  {
    id: 'shirt',
    label: 'ROAD TRIP STYLE 03',
    title:
      'The team is stopping for a group photo. Which shirt are you wearing?',
    subtitle:
      'Pick the shirt that belongs in your road-trip OOTD post.',
  },
  {
    id: 'cap',
    label: 'ROAD TRIP STYLE 04',
    title:
      'The sun is out and the cameras are ready. Which cap completes your look?',
    subtitle:
      'Choose your final accessory before the road-trip photo shoot.',
  },
];

const POINTS_PER_CHOICE = 2;

function getImageForQuestion(enchin, questionId) {
  if (questionId === 'car') return enchin.carImage;
  if (questionId === 'waterBottle') return enchin.waterImage;
  if (questionId === 'shirt') return enchin.shirtImage;
  return enchin.capImage;
}

function getAltText(enchin, questionId) {
  if (questionId === 'car') {
    return `${enchin.carName} race car`;
  }

  if (questionId === 'waterBottle') {
    return `${enchin.name} water bottle`;
  }

  if (questionId === 'shirt') {
    return `${enchin.name} road-trip shirt`;
  }

  return `${enchin.name} road-trip cap`;
}

export default function MG3Customize({ playerName, onNext }) {
  const [questionIndex, setQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState({
    car: null,
    waterBottle: null,
    shirt: null,
    cap: null,
  });

  const [showResult, setShowResult] = useState(false);

  const currentQuestion = QUESTIONS[questionIndex];
  const currentAnswer = answers[currentQuestion.id];

  const isLastQuestion =
    questionIndex === QUESTIONS.length - 1;

  const selectedCar = ENCHINS.find(
    (enchin) => enchin.id === answers.car
  );

  const selectedBottle = ENCHINS.find(
    (enchin) => enchin.id === answers.waterBottle
  );

  const selectedShirt = ENCHINS.find(
    (enchin) => enchin.id === answers.shirt
  );

  const selectedCap = ENCHINS.find(
    (enchin) => enchin.id === answers.cap
  );

  const scores = ENCHINS.reduce((result, enchin) => {
    result[enchin.id] = 0;
    return result;
  }, {});

  Object.values(answers).forEach((enchinId) => {
    if (enchinId) {
      scores[enchinId] =
        (scores[enchinId] || 0) + POINTS_PER_CHOICE;
    }
  });

  const potentialDriver = ENCHINS.reduce(
    (leader, enchin) => {
      if (!leader) return enchin;

      return scores[enchin.id] > scores[leader.id]
        ? enchin
        : leader;
    },
    null
  );

  const chooseAnswer = (enchinId) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: enchinId,
    }));
  };

  const handleNext = () => {
    if (!currentAnswer) return;

    if (isLastQuestion) {
      setShowResult(true);
      return;
    }

    setQuestionIndex((previous) => previous + 1);
  };

  const handleBack = () => {
    setQuestionIndex((previous) =>
      Math.max(previous - 1, 0)
    );
  };

  const handleContinue = () => {
    if (!potentialDriver) return;

    onNext({
      ...scores,

      miniGame: 'mg3',
      completed: true,

      carId: selectedCar?.id || null,
      carName: selectedCar?.carName || null,
      carPapa: selectedCar?.papa || null,
      carEnchinId: selectedCar?.id || null,

      waterBottleId: selectedBottle?.id || null,
      waterBottleName: selectedBottle?.name || null,
      bottleEnchinId: selectedBottle?.id || null,

      shirtId: selectedShirt?.id || null,
      shirtEnchinId: selectedShirt?.id || null,

      capId: selectedCap?.id || null,
      capEnchinId: selectedCap?.id || null,

      choices: {
        car: answers.car,
        waterBottle: answers.waterBottle,
        shirt: answers.shirt,
        cap: answers.cap,
      },

      miniGame3Scores: scores,
      potentialDriver: potentialDriver.id,
      potentialDriverName: potentialDriver.name,
    });
  };

  if (showResult) {
  return (
    <section className="mg3">
      <div className="mg3-shell mg3-result-screen">
        <span className="mg3-location">
          MISSION 2 · MINI-GAME 3 COMPLETE
        </span>

        <h1>Road Trip Look Locked In!</h1>

        <p className="mg3-result-intro">
          {playerName ? `${playerName}, ` : ''}
          your team style is ready.
        </p>

        <div
          className="mg3-driver-result"
          style={{
            '--driver-color':
              potentialDriver?.color || '#fda4af',
          }}
        >
          {potentialDriver?.driverImage && (
            <img
              className="mg3-driver-image"
              src={potentialDriver.driverImage}
              alt={`${potentialDriver.name} potential driver`}
            />
          )}

          <span>YOUR POTENTIAL DRIVER</span>

          <h2>
            {potentialDriver?.name || 'Your team'} is leading!
          </h2>

          <p>
            {potentialDriver?.name || 'Your chosen Enchin'} has
            the highest Mini-Game 3 score.
          </p>
        </div>

        <div className="mg3-score-list">
          {ENCHINS.filter(
            (enchin) => scores[enchin.id] > 0
          ).map((enchin) => (
            <div
              key={enchin.id}
              className={`mg3-score-row ${
                potentialDriver?.id === enchin.id
                  ? 'is-winner'
                  : ''
              }`}
            >
              <span>{enchin.name}</span>

              <strong>
                {scores[enchin.id]} points
              </strong>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mg3-continue-button"
          onClick={handleContinue}
        >
          Continue Journey →
        </button>
      </div>
    </section>
  );
}

  return (
    <section className="mg3">
      <div className="mg3-shell">
        <header className="mg3-header">
          <span className="mg3-location">
            MISSION 2 · MINI-GAME 3
          </span>

          <h1>Road Trip Ready!</h1>

          <p>
            {playerName ? `${playerName}, ` : ''}
            choose your road-trip style.
          </p>

          <div className="mg3-progress">
            QUESTION {questionIndex + 1} OF {QUESTIONS.length}

            <div className="mg3-progress-track">
              <div
                className="mg3-progress-fill"
                style={{
                  width: `${
                    ((questionIndex + 1) /
                      QUESTIONS.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </header>

        <main className="mg3-main">
          <div className="mg3-question">
            <span>{currentQuestion.label}</span>

            <h2>{currentQuestion.title}</h2>

            <p>{currentQuestion.subtitle}</p>
          </div>

          <div className="mg3-choice-grid">
            {ENCHINS.map((enchin) => {
              const selected =
                currentAnswer === enchin.id;

              const image = getImageForQuestion(
                enchin,
                currentQuestion.id
              );

              const choiceLabel =
                currentQuestion.id === 'car'
                  ? enchin.carName
                  : enchin.name;

              return (
                <button
                  key={enchin.id}
                  type="button"
                  className={`mg3-choice ${
                    selected ? 'is-selected' : ''
                  }`}
                  style={{
                    '--choice-color': enchin.color,
                  }}
                  onClick={() => chooseAnswer(enchin.id)}
                  aria-label={`Choose ${choiceLabel}`}
                  aria-pressed={selected}
                >
                  <span className="mg3-choice-media">
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className={`mg3-choice-image mg3-choice-image-${currentQuestion.id}`}
                        width="120"
                        height="80"
                        draggable="false"
                      />
                    ) : (
                      <span
                        className="mg3-choice-fallback"
                        aria-hidden="true"
                      >
                        {enchin.fallback}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </main>

        <footer className="mg3-footer">
          <button
            type="button"
            className="mg3-back-button"
            onClick={handleBack}
            disabled={questionIndex === 0}
          >
            ← Back
          </button>

          <button
            type="button"
            className="mg3-next-button"
            onClick={handleNext}
            disabled={!currentAnswer}
          >
            {isLastQuestion
              ? 'Lock In Look ✨'
              : 'Next Question →'}
          </button>
        </footer>
      </div>
    </section>
  );
}