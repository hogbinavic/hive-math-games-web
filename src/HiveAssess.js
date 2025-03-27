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
  const [showSetup, setShowSetup] = useState(false);
  const [showVersionSelect, setShowVersionSelect] = useState(true);
  const [selectedFactors, setSelectedFactors] = useState(Array(12).fill(true));
  const [isTimedMode, setIsTimedMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(() => localStorage.getItem('highScore') || 0);
  const [disablePads, setDisablePads] = useState(false);
  const [version, setVersion] = useState(null);
  const [missedFactors, setMissedFactors] = useState(new Set());
  const [productStats, setProductStats] = useState(() => {
    const saved = localStorage.getItem('productStats');
    return saved ? JSON.parse(saved) : {};
  });

  const positiveNumbers = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];

  const mixedNumbers = [
    [-6, -5, -4, -3],
    [-2, -1, 1, 2],
    [3, 4, 5, 6],
  ];

  const algebraNumbers = [
    [1, 2, 3, 4],
    [5, 6, '𝓍', '2𝓍'],
    ['3𝓍', '4𝓍', '5𝓍', '6𝓍'],
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

  useEffect(() => {
    localStorage.setItem('productStats', JSON.stringify(productStats));
  }, [productStats]);

  const selectVersion = (chosenVersion) => {
    setVersion(chosenVersion);
    setShowVersionSelect(false);
    setShowSetup(true);
  };

  const startGame = () => {
    const selectedCount = selectedFactors.filter(Boolean).length;
    if (selectedCount < 6) {
      alert('Please select at least 6 factors to start the game.');
      return;
    }
    setShowSetup(false);
    setFirstNumber(version === 'positive' ? 1 : version === 'mixed' ? -6 : 1);
    setSecondNumber(version === 'positive' ? 1 : version === 'mixed' ? -6 : 1);
    setScore(0);
    setAttempts(0);
    setTimeLeft(60);
    setQuestionsLeft(25);
    setGameActive(true);
    setFeedback(null);
    setIsPaused(false);
    setMissedFactors(new Set());
    generateValidProduct(version === 'positive' ? 1 : version === 'mixed' ? -6 : 1, version === 'positive' ? 1 : version === 'mixed' ? -6 : 1);
  };

  const generateValidProduct = (left, right) => {
    let possibleProducts = new Set();
    const range = version === 'positive' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] :
                  version === 'mixed' ? [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6] :
                  [1, 2, 3, 4, 5, 6, '𝓍', '2𝓍', '3𝓍', '4𝓍', '5𝓍', '6𝓍'];
    const selectedRange = range.filter((i, idx) => selectedFactors[idx]);

    if (version === 'algebra') {
      const leftCoef = typeof left === 'string' ? (left === '𝓍' ? 1 : parseInt(left)) : left;
      const rightCoef = typeof right === 'string' ? (right === '𝓍' ? 1 : parseInt(right)) : right;
      const leftVar = typeof left === 'string' && left.includes('𝓍') ? 1 : 0;
      const rightVar = typeof right === 'string' && right.includes('𝓍') ? 1 : 0;
      const changeLeft = Math.random() < 0.5;
      const fixedFactor = changeLeft ? right : left;
      const fixedCoef = changeLeft ? rightCoef : leftCoef;
      const fixedVar = changeLeft ? rightVar : leftVar;

      selectedRange.forEach((i) => {
        const coef = typeof i === 'string' ? (i === '𝓍' ? 1 : parseInt(i)) : i;
        const varCount = (typeof i === 'string' && i.includes('𝓍') ? 1 : 0) + fixedVar;
        const newCoef = coef * fixedCoef;
        if (varCount === 2) {
          possibleProducts.add(`${newCoef}𝓍²`);
        } else if (varCount === 1) {
          possibleProducts.add(`${newCoef}𝓍`);
        } else {
          possibleProducts.add(newCoef);
        }
      });
    } else {
      selectedRange.forEach((i) => {
        possibleProducts.add(left * i);
        possibleProducts.add(right * i);
      });
    }

    let validProducts = [...possibleProducts].filter((p) => p !== previousProduct);
    if (validProducts.length === 0) validProducts = [...possibleProducts];
    const newProduct = validProducts[Math.floor(Math.random() * validProducts.length)] || (version === 'positive' ? 1 : version === 'mixed' ? -36 : '𝓍');
    setProduct(newProduct);
    setPreviousProduct(newProduct);
  };

  const checkAnswer = (selectedFirst, selectedSecond) => {
    setAttempts((prev) => prev + 1);
    let isCorrect = false;
    let displayFactor = null;

    if (version === 'algebra') {
      const coef1 = typeof selectedFirst === 'string' ? (selectedFirst === '𝓍' ? 1 : parseInt(selectedFirst)) : selectedFirst;
      const coef2 = typeof selectedSecond === 'string' ? (selectedSecond === '𝓍' ? 1 : parseInt(selectedSecond)) : selectedSecond;
      const var1 = typeof selectedFirst === 'string' && selectedFirst.includes('𝓍') ? 1 : 0;
      const var2 = typeof selectedSecond === 'string' && selectedSecond.includes('𝓍') ? 1 : 0;
      const totalCoef = coef1 * coef2;
      const totalVar = var1 + var2;

      if (typeof product === 'string') {
        if (product.includes('²')) {
          isCorrect = totalCoef === parseInt(product) && totalVar === 2;
        } else if (product.includes('𝓍')) {
          isCorrect = totalCoef === parseInt(product) && totalVar === 1;
        }
      } else {
        isCorrect = totalCoef === product && totalVar === 0;
      }

      if (totalVar === 2) {
        displayFactor = `${totalCoef}𝓍²`;
      } else if (totalVar === 1) {
        displayFactor = `${totalCoef}𝓍`;
      } else {
        displayFactor = totalCoef;
      }

      if (!isCorrect) {
        const missed = [selectedFirst, selectedSecond].filter(f => typeof f === 'number' || f.includes('𝓍'));
        missed.forEach(f => setMissedFactors(prev => new Set(prev).add(f)));
      }
    } else {
      isCorrect = selectedFirst * selectedSecond === product;
      displayFactor = selectedFirst * selectedSecond;
      if (!isCorrect) {
        setMissedFactors(prev => new Set(prev).add(selectedFirst).add(selectedSecond));
        if (version === 'positive') {
          setProductStats(prev => ({
            ...prev,
            [`${selectedFirst}x${selectedSecond}`]: {
              correct: prev[`${selectedFirst}x${selectedSecond}`]?.correct || 0,
              total: (prev[`${selectedFirst}x${selectedSecond}`]?.total || 0) + 1
            }
          }));
        }
      } else if (version === 'positive') {
        setProductStats(prev => ({
          ...prev,
          [`${selectedFirst}x${selectedSecond}`]: {
            correct: (prev[`${selectedFirst}x${selectedSecond}`]?.correct || 0) + 1,
            total: (prev[`${selectedFirst}x${selectedSecond}`]?.total || 0) + 1
          }
        }));
      }
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setOldFactor(isCorrect ? null : displayFactor);

    setTimeout(() => {
      generateValidProduct(selectedFirst, selectedSecond);
      setFeedback(null);
      setOldFactor(null);
      setDisablePads(false);
    }, isTimedMode ? 200 : 500);

    if (isCorrect) {
      setScore((prev) => {
        const newScore = prev + 1;
        if (isTimedMode && newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('highScore', newScore);
        }
        return newScore;
      });
      if (!isTimedMode) {
        setQuestionsLeft((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) setGameActive(false);
          return newCount;
        });
      }
    } else {
      setDisablePads(true);
      if (!isTimedMode) {
        setQuestionsLeft((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) setGameActive(false);
          return newCount;
        });
      }
    }
  };

  const exitGame = () => {
    setGameActive(false);
    setShowVersionSelect(true);
  };

  const renderNumberPad = (setNumber, selectedNumber, isLeftPad) => {
    const numbersToUse = version === 'positive' ? positiveNumbers : version === 'mixed' ? mixedNumbers : algebraNumbers;
    return numbersToUse.map((row, rowIndex) => (
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
    ));
  };

  const toggleFactor = (index) => {
    const updatedFactors = [...selectedFactors];
    updatedFactors[index] = !updatedFactors[index];
    setSelectedFactors(updatedFactors);
  };

  const getAssessmentSummary = () => {
    const totalQuestions = isTimedMode ? attempts : 25;
    const accuracy = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : 0;
    let summary = isTimedMode 
      ? `<strong>Final Score: ${score}</strong>\n<strong>Attempts: ${attempts}</strong>\n<strong>Accuracy: ${accuracy}%</strong>\nHigh Score: ${highScore}`
      : `Final Score: ${score}/25\nAccuracy: ${accuracy}%`;
    
    if (missedFactors.size > 0 || Object.keys(productStats).length > 0) {
      summary += '\n\n';
      if (version === 'positive') {
        summary += '<div class="heatmap-container">';
        summary += '<div class="heatmap-label right-factor">Right Factor</div>';
        summary += '<div class="heatmap"><table><tr><th></th>';
        for (let i = 1; i <= 12; i++) summary += `<th>${i}</th>`;
        summary += '</tr>';
        for (let i = 1; i <= 12; i++) {
          summary += `<tr><th>${i}</th>`;
          for (let j = 1; j <= 12; j++) {
            const key = `${i}x${j}`;
            const stats = productStats[key] || { correct: 0, total: 0 };
            const percent = stats.total > 0 ? (stats.correct / stats.total) * 100 : -1;
            const color = percent === 100 ? 'green' : percent >= 50 ? 'orange' : percent >= 0 ? 'red' : 'gray';
            summary += `<td class="${color}">${percent >= 0 ? i * j : ''}</td>`;
          }
          summary += '</tr>';
        }
        summary += '</table></div>';
        summary += '<div class="heatmap-label left-factor">Left Factor</div>';
        summary += '</div>';
      }
      const factorsList = Array.from(missedFactors).join(', ');
      summary += `<div class="advice">To improve, try working on the following factors: ${factorsList}</div>`;
    }
    return summary;
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
      {showVersionSelect ? (
        <div className="version-select">
          <h2>Choose a Version</h2>
          <div className="version-buttons">
            <button onClick={() => selectVersion('positive')}>Positive Integers 1-12</button>
            <button onClick={() => selectVersion('mixed')}>Integers -6 to +6</button>
            <button onClick={() => selectVersion('algebra')}>Algebra</button>
          </div>
        </div>
      ) : showSetup ? (
        <div className="setup">
          <h2>Select Factors to Practice (minimum 6):</h2>
          <div className="factor-container">
            <div className="factor-column">
              {Array.from({ length: 6 }, (_, i) => {
                const factor = version === 'positive' ? i + 1 : version === 'mixed' ? i - 6 : i + 1;
                return (
                  <div key={i} className="factor-row">
                    <input
                      type="checkbox"
                      checked={selectedFactors[i]}
                      onChange={() => toggleFactor(i)}
                    />
                    <span>{version === 'algebra' && i >= 6 ? `${i - 4}𝓍` : factor}</span>
                  </div>
                );
              })}
            </div>
            <div className="factor-column">
              {Array.from({ length: 6 }, (_, i) => {
                const factor = version === 'positive' ? i + 7 : version === 'mixed' ? i + 1 : i >= 0 && i < 6 ? '𝓍' : `${i}𝓍`;
                return (
                  <div key={i + 6} className="factor-row">
                    <input
                      type="checkbox"
                      checked={selectedFactors[i + 6]}
                      onChange={() => toggleFactor(i + 6)}
                    />
                    <span>{version === 'algebra' && i === 0 ? '𝓍' : version === 'algebra' && i > 0 ? `${i + 1}𝓍` : factor}</span>
                  </div>
                );
              })}
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
          <button onClick={startGame} className="start-button">Start Assessment</button>
          <button onClick={() => { setShowSetup(false); setShowVersionSelect(true); }} className="back-button">Back to Version Select</button>
        </div>
      ) : gameActive ? (
        <>
          <p className="subheading">Make the product below by changing one of the factors on the number pads.</p>
          <div className="feedback-row">
            <span className="product">{typeof product === 'string' && product.includes('²') ? <span>{product.split('²')[0]}<sup>2</sup></span> : product ?? '?'}</span>
            {feedback && (
              <span className={`feedback ${feedback}`}>
                {feedback === 'correct' ? '✓' : feedback === 'incorrect' && typeof oldFactor === 'string' && oldFactor.includes('²') ? <span>✗ {oldFactor.split('²')[0]}<sup>2</sup></span> : feedback === 'incorrect' ? `✗ ${oldFactor}` : '✓'}
              </span>
            )}
          </div>
          <div className="number-pad-row">
            <div className="number-pad">{renderNumberPad(setFirstNumber, firstNumber, true)}</div>
            <span className="multiply">×</span>
            <div className="number-pad">{renderNumberPad(setSecondNumber, secondNumber, false)}</div>
          </div>
          <div className="stats">
            <p>Score: {score}/{isTimedMode ? '' : attempts}</p>
            {isTimedMode && <p>High Score: {highScore}</p>}
            {isTimedMode ? (
              <>
                <p>Time Left: {timeLeft}s</p>
                <ProgressBar current={timeLeft} max={60} />
              </>
            ) : (
              <>
                <p>Questions Left: {questionsLeft}</p>
                <ProgressBar current={25 - questionsLeft} max={25} />
              </>
            )}
            <button onClick={exitGame} className="exit-button">Exit</button>
          </div>
        </>
      ) : (
        <>
          <div className="game-over" dangerouslySetInnerHTML={{ __html: getAssessmentSummary() }} />
          <div className="nav-buttons">
            <button onClick={() => { setShowSetup(true); setGameActive(false); }}>Play Again</button>
            <button onClick={() => { setShowVersionSelect(true); setGameActive(false); setShowSetup(false); }}>Home Page</button>
          </div>
        </>
      )}
      <footer className="footer">
        <p>© Number Hive 2025</p>
        <p>Please give us feedback on this test version - <a href="mailto:chris@numberhive.app">chris@numberhive.app</a></p>
      </footer>
    </div>
  );
};

export default HiveAssess;