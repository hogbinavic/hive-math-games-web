import React, { useState, useEffect } from 'react';
import './HiveAssess.css';

const HiveAssess = () => {
  const [firstNumber, setFirstNumber] = useState(1);
  const [secondNumber, setSecondNumber] = useState(1);
  const [product, setProduct] = useState(null);
  const [previousProduct, setPreviousProduct] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [questionsLeft, setQuestionsLeft] = useState(25);
  const [feedback, setFeedback] = useState(null);
  const [oldFactor, setOldFactor] = useState(null);
  const [showSetup, setShowSetup] = useState(true);
  const [selectedFactors, setSelectedFactors] = useState(Array(12).fill(true));
  const [isTimedMode, setIsTimedMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => localStorage.getItem('highScore') || 0);
  const [disablePads, setDisablePads] = useState(false);

  const numbers = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];

  useEffect(() => {
    let timer;
    if (gameActive && !isPaused && isTimedMode && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isTimedMode && timeLeft === 0) {
      setGameActive(false);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, isTimedMode, isPaused]);

  const startGame = () => {
    const selectedCount = selectedFactors.filter(Boolean).length;
    if (selectedCount < 6) {
      alert('Please select at least 6 factors to start the game.');
      return;
    }
    setShowSetup(false);
    setFirstNumber(1);
    setSecondNumber(1);
    setScore(0);
    setAttempts(0);
    setTimeLeft(60);
    setQuestionsLeft(25);
    setGameActive(true);
    setFeedback(null);
    setIsPaused(false);
    generateValidProduct(1, 1);
  };

  const generateValidProduct = (left, right) => {
    let possibleProducts = new Set();
    for (let i = 1; i <= 12; i++) {
      if (selectedFactors[i - 1]) {
        possibleProducts.add(left * i);
        possibleProducts.add(right * i);
      }
    }
    let validProducts = [...possibleProducts].filter((p) => p !== previousProduct);
    if (validProducts.length === 0) validProducts = [...possibleProducts];
    const newProduct = validProducts[Math.floor(Math.random() * validProducts.length)] || 1;
    setProduct(newProduct);
    setPreviousProduct(newProduct);
  };

  const checkAnswer = (selectedFirst, selectedSecond) => {
    setAttempts((prev) => prev + 1);
    const isCorrect = selectedFirst * selectedSecond === product;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setOldFactor(selectedFirst * selectedSecond);

    if (isCorrect) {
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('highScore', newScore);
        }
        return newScore;
      });
      setTimeout(() => {
        generateValidProduct(selectedFirst, selectedSecond);
        setFeedback(null);
        setOldFactor(null);
      }, 200);
      if (!isTimedMode) {
        setQuestionsLeft((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) setGameActive(false);
          return newCount;
        });
      }
    } else {
      setDisablePads(true);
      setTimeout(() => {
        setDisablePads(false);
        setFeedback(null);
        setOldFactor(null);
      }, 200);
    }
  };

  const togglePause = () => setIsPaused(!isPaused);

  const renderNumberPad = (setNumber, selectedNumber, isLeftPad) => (
    numbers.map((row, rowIndex) => (
      <div key={rowIndex} className="number-row">
        {row.map((num) => (
          <button
            key={num}
            className={`number-button ${selectedNumber === num ? 'selected' : ''} ${
              disablePads ? 'disabled' : ''
            }`}
            onClick={() => {
              setNumber(num);
              checkAnswer(isLeftPad ? num : firstNumber, isLeftPad ? secondNumber : num);
            }}
            disabled={disablePads}
          >
            {num}
          </button>
        ))}
      </div>
    ))
  );

  const toggleFactor = (index) => {
    const updatedFactors = [...selectedFactors];
    updatedFactors[index] = !updatedFactors[index];
    setSelectedFactors(updatedFactors);
  };

  const getAssessmentSummary = () => {
    const accuracy = attempts > 0 ? ((score / attempts) * 100).toFixed(1) : 0;
    return `Final Score: ${score}\nHigh Score: ${highScore}\nAttempts: ${attempts}\nAccuracy: ${accuracy}%`;
  };

  const ProgressBar = ({ current, max }) => (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="hive-assess">
      <img src="/logo.png" alt="Number Hive Logo" className="logo" />
      <h1>Hive Assess</h1>
      {showSetup ? (
        <div className="setup">
          <h2>Select Factors to Practice (minimum 6):</h2>
          <div className="factor-container">
            <div className="factor-column">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="factor-row">
                  <input
                    type="checkbox"
                    checked={selectedFactors[i]}
                    onChange={() => toggleFactor(i)}
                  />
                  <span>{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="factor-column">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i + 6} className="factor-row">
                  <input
                    type="checkbox"
                    checked={selectedFactors[i + 6]}
                    onChange={() => toggleFactor(i + 6)}
                  />
                  <span>{i + 7}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mode-toggle">
            <label>
              <input
                type="radio"
                name="mode"
                checked={isTimedMode}
                onChange={() => setIsTimedMode(true)}
              />
              Timed (1 min)
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                checked={!isTimedMode}
                onChange={() => setIsTimedMode(false)}
              />
              25 Questions
            </label>
          </div>
          <button onClick={startGame}>Start Assessment</button>
        </div>
      ) : gameActive ? (
        <>
          <p className="subheading">Make the product below by changing one of the factors on the number pads.</p>
          <div className="feedback-row">
            <span className="product">{product ?? '?'}</span>
            {feedback && (
              <span className={`feedback ${feedback}`}>
                {feedback === 'correct' ? '✓' : '✗'} {oldFactor}
              </span>
            )}
          </div>
          <div className="number-pad-row">
            <div className="number-pad">{renderNumberPad(setFirstNumber, firstNumber, true)}</div>
            <span className="multiply">×</span>
            <div className="number-pad">{renderNumberPad(setSecondNumber, secondNumber, false)}</div>
          </div>
          <div className="stats">
            <p>Score: {score}</p>
            <p>High Score: {highScore}</p>
            {isTimedMode ? (
              <>
                <p>Time Left: {timeLeft}s</p>
                <ProgressBar current={timeLeft} max={60} />
              </>
            ) : (
              <>
                <p>Questions Left: {questionsLeft}</p>
                <ProgressBar current={25 - questionsLeft} max={25} />
                <button onClick={togglePause} className="pause-button">
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <pre className="game-over">{getAssessmentSummary()}</pre>
          <button onClick={() => setShowSetup(true)}>Try Again</button>
        </>
      )}
    </div>
  );
};

export default HiveAssess;