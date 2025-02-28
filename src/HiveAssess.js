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
  const [showSetup, setShowSetup] = useState(true);
  const [selectedFactors, setSelectedFactors] = useState(Array(12).fill(true));
  const [isTimedMode, setIsTimedMode] = useState(true);

  const numbers = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];

  useEffect(() => {
    let timer;
    if (gameActive && isTimedMode && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isTimedMode && timeLeft === 0) {
      setGameActive(false);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, isTimedMode]);

  const startGame = () => {
    setShowSetup(false);
    setFirstNumber(1);
    setSecondNumber(1);
    setScore(0);
    setAttempts(0);
    setTimeLeft(60);
    setQuestionsLeft(25);
    setGameActive(true);
    setFeedback(null);
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
    if (selectedFirst * selectedSecond === product) {
      setScore((prev) => prev + 1);
      setFeedback('✔️');
      generateValidProduct(selectedFirst, selectedSecond);
      if (!isTimedMode) {
        setQuestionsLeft((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) setGameActive(false);
          return newCount;
        });
      }
    } else {
      setFeedback('❌');
    }
    setTimeout(() => setFeedback(null), 1000);
  };

  const renderNumberPad = (setNumber, selectedNumber, isLeftPad) => (
    numbers.map((row, rowIndex) => (
      <div key={rowIndex} className="number-row">
        {row.map((num) => (
          <button
            key={num}
            className={`number-button ${selectedNumber === num ? 'selected' : ''}`}
            onClick={() => {
              setNumber(num);
              checkAnswer(isLeftPad ? num : firstNumber, isLeftPad ? secondNumber : num);
            }}
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
    return `Final Score: ${score}\nAttempts: ${attempts}\nAccuracy: ${accuracy}%`;
  };

  return (
    <div className="hive-assess">
      <h1>Hive Assess</h1>
      {showSetup ? (
        <div className="setup">
          <h2>Select Factors to Practice:</h2>
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
            <span>Mode:</span>
            <input
              type="checkbox"
              checked={isTimedMode}
              onChange={() => setIsTimedMode(!isTimedMode)}
            />
            <span>{isTimedMode ? 'Timed (1 min)' : '25 Questions'}</span>
          </div>
          <button onClick={startGame}>Start Assessment</button>
        </div>
      ) : gameActive ? (
        <>
          <div className="feedback-row">
            <span className="product">{product ?? '?'}</span>
            <span className="feedback">{feedback}</span>
          </div>
          <div className="number-pad-row">
            <div>{renderNumberPad(setFirstNumber, firstNumber, true)}</div>
            <span className="multiply">×</span>
            <div>{renderNumberPad(setSecondNumber, secondNumber, false)}</div>
          </div>
          <p>Score: {score}</p>
          <p>{isTimedMode ? `Time Left: ${timeLeft}s` : `Questions Left: ${questionsLeft}`}</p>
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