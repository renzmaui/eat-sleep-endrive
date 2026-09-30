import { useState } from 'react';
import './MG2Quiz.css';

const ENCHINS = [
  {
    id: 'wonchu',
    name: 'WONCHU',
    image: '/images/wonchu-flower.png',
    driverImage: '/images/mg1driver-wonchu.png',
  },
  {
    id: 'noxstar',
    name: 'NOXSTAR',
    image: '/images/noxstar-flower.png',
    driverImage: '/images/mg1driver-noxstar.png',
  },
  {
    id: 'jakey',
    name: 'JAKEY',
    image: '/images/jakey-flower.png',
    driverImage: '/images/mg1driver-jakey.png',
  },
  {
    id: 'snowe',
    name: 'SNOWE',
    image: '/images/snowe-flower.png',
    driverImage: '/images/mg1driver-snowe.png',
  },
  {
    id: 'kishu',
    name: 'KISHU',
    image: '/images/kishu-flower.png',
    driverImage: '/images/mg1driver-kishu.png',
  },
  {
    id: 'puni',
    name: 'PU-NI',
    image: '/images/pu-ni-flower.png',
    driverImage: '/images/mg1driver-pu-ni.png',
  },
];

const QUESTIONS = [
  {
    q: 'Who would take pictures of every pretty view, funny sign, and random cow outside the window?',
  },
  {
    q: 'Before the trip begins, who would study the map so carefully that they know the route, rest stops, and possible detours?',
  },
  {
    q: 'Who would start a car game and invent new rules halfway through when they start losing?',
  },
  {
    q: 'Who would check the weather and traffic before leaving, just in case the road trip suddenly becomes a mission?',
  },
  {
    q: 'Who would lead a dramatic car sing-along while confidently singing the wrong lyrics?',
  },
  {
    q: 'Who would notice that the group is going the wrong way before anyone else?',
  },
  {
    q: 'Who would turn the entire trip into a travel vlog before the car even leaves the driveway?',
  },
  {
    q: 'Who would remain calm during heavy rain and act like they have everything completely under control?',
  },
  {
    q: 'Who would demand a detour every time they spotted an interesting roadside attraction?',
  },
  {
    q: 'Who would remember where the next gas station is, even though nobody asked them to?',
  },
  {
    q: 'Who would control the playlist and skip every song after listening to only three seconds?',
  },
  {
    q: 'Who would read a confusing road sign instead of confidently guessing what it means?',
  },
  {
    q: 'Who would give fake historical facts about every town, building, or cow the car passes?',
  },
  {
    q: 'Who would make sure everyone is ready before the trip starts instead of shouting, “Wait, I forgot something!” after leaving?',
  },
  {
    q: 'Who would become the unofficial photographer and take pictures of everyone while they are not looking?',
  },
];

const TIE_BREAKER = {
  q: 'The GPS stops working, the group misses the exit, and everyone starts panicking. Who would calmly figure out what to do next while everyone else says, “I thought you knew where we were going?”',
};

const INITIAL_SCORES = {
  wonchu: 0,
  snowe: 0,
  jakey: 0,
  noxstar: 0,
  puni: 0,
  kishu: 0,
};

export default function MG2Quiz({ enchins, onNext }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState({ ...INITIAL_SCORES });
  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [result, setResult] = useState(null);

  const getEnchin = (enchinId) => {
    const localEnchin = ENCHINS.find(
      (enchin) => enchin.id === enchinId,
    );

    const parentEnchin = enchins?.find(
      (enchin) => enchin.id === enchinId,
    );

    return {
      ...localEnchin,
      ...parentEnchin,
      id: enchinId,
      name: localEnchin?.name || parentEnchin?.name,
      image: localEnchin?.image || parentEnchin?.image,
      driverImage: localEnchin?.driverImage,
    };
  };

  const calculateResult = (finalScores, tieBreakerId = null) => {
    const highestScore = Math.max(...Object.values(finalScores));

    const tiedWinners = Object.entries(finalScores)
      .filter(([, score]) => score === highestScore)
      .map(([id]) => id);

    const winnerId =
      tieBreakerId && tiedWinners.includes(tieBreakerId)
        ? tieBreakerId
        : tiedWinners[0];

    return {
      winnerId,
      chosenDriver: getEnchin(winnerId),
      finalScores,
    };
  };

  const finishQuiz = (finalScores, tieBreakerId = null) => {
    const quizResult = calculateResult(finalScores, tieBreakerId);
    setResult(quizResult);
  };

  const handleAnswer = (enchinId) => {
    const updatedScores = {
      ...scores,
      [enchinId]: scores[enchinId] + 1,
    };

    setScores(updatedScores);

    const isLastQuestion =
      questionIndex === QUESTIONS.length - 1;

    if (!isLastQuestion) {
      setQuestionIndex((currentIndex) => currentIndex + 1);
      return;
    }

    const highestScore = Math.max(...Object.values(updatedScores));

    const numberOfLeaders = Object.values(updatedScores).filter(
      (score) => score === highestScore,
    ).length;

    if (numberOfLeaders > 1) {
      setShowTieBreaker(true);
    } else {
      finishQuiz(updatedScores);
    }
  };

  const handleTieBreaker = (enchinId) => {
    const finalScores = {
      ...scores,
      [enchinId]: scores[enchinId] + 1,
    };

    finishQuiz(finalScores, enchinId);
  };

  const saveResultImage = () => {
    if (!result?.chosenDriver?.driverImage) {
      return;
    }

    const link = document.createElement('a');

    link.href = result.chosenDriver.driverImage;
    link.download = `${result.chosenDriver.id}-chosen-driver.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const continueJourney = () => {
    onNext({
      scores: result.finalScores,
      driverId: result.winnerId,
      chosenDriver: result.chosenDriver,
    });
  };

  /*
    Final result screen.
    The repeated title and driver name have been removed.
  */
  if (result) {
    return (
      <section className="game mg2-game">
        <div className="game-box">
          <div className="game-area">
            <div className="quiz-result">
              <img
                src={result.chosenDriver.driverImage}
                alt={`${result.chosenDriver.name} as the chosen driver`}
                className="quiz-result-image"
              />

              <p className="quiz-result-message">
                Looks like {result.chosenDriver.name} is driving!
              </p>

              <div className="quiz-score-list">
                {ENCHINS.map((enchin) => (
                  <div
                    key={enchin.id}
                    className={`quiz-score-row ${
                      enchin.id === result.winnerId
                        ? 'quiz-score-row-winner'
                        : ''
                    }`}
                  >
                    <span>{enchin.name}</span>

                    <span>
                      {result.finalScores[enchin.id]} vote
                      {result.finalScores[enchin.id] === 1
                        ? ''
                        : 's'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="quiz-result-actions">
                <button
                  type="button"
                  className="quiz-save-button"
                  onClick={saveResultImage}
                >
                  Save Image
                </button>

                <button
                  type="button"
                  className="quiz-continue-button"
                  onClick={continueJourney}
                >
                  Continue Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentQuestion = showTieBreaker
    ? TIE_BREAKER
    : QUESTIONS[questionIndex];

  const progress = showTieBreaker
    ? 100
    : ((questionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <section className="game mg2-game">
      <div className="game-box">
        <div className="game-head">
          <div className="game-location">
            ROAD TRIP QUIZ
          </div>

          <h1>Who Would Do It on the Road Trip?</h1>

          <p>
            Choose the Enchin who best fits each road-trip moment.
          </p>
        </div>

        <div className="game-area">
          <div className="quiz-content">
            <div className="quiz-progress-label">
              {showTieBreaker
                ? 'FINAL TIE-BREAKER'
                : `QUESTION ${questionIndex + 1} OF ${QUESTIONS.length}`}
            </div>

            <h2 className="quiz-question">
              {currentQuestion.q}
            </h2>

            <div className="quiz-options">
              {ENCHINS.map((enchin) => (
                <button
                  key={enchin.id}
                  type="button"
                  className="quiz-option"
                  onClick={() =>
                    showTieBreaker
                      ? handleTieBreaker(enchin.id)
                      : handleAnswer(enchin.id)
                  }
                  aria-label={`Choose ${enchin.name}`}
                >
                  <img
                    src={enchin.image}
                    alt={enchin.name}
                    className="quiz-option-image"
                  />

                  <span className="quiz-option-name">
                    {enchin.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="game-message">
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}