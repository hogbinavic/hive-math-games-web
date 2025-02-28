import React, { useState, useEffect } from 'react';
import './HiveRisk.css';

const HiveRisk = () => {
  const [randomNumber, setRandomNumber] = useState(null);
  const [boxes, setBoxes] = useState([null, null, null, null, null]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [playerMessage, setPlayerMessage] = useState('');
  const [finalMessage, setFinalMessage] = useState('');
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [displayNumber, setDisplayNumber] = useState(0);
  const [isLargestMode, setIsLargestMode] = useState(true);

  useEffect(() => {
    if (randomNumber !== null) {
      let currentNum = 0;
      setDisplayNumber(currentNum);
      const interval = setInterval(() => {
        currentNum = (currentNum + 1) % 10;
        setDisplayNumber(currentNum);
        if (currentNum === randomNumber) {
          clearInterval(interval);
        }
      }, 100);
    }
  }, [randomNumber]);

  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 10);
    setRandomNumber(number);
    setIsButtonDisabled(true);
    setPlayerMessage('Click on a box to place the number!');
    setFinalMessage('');
    setGeneratedNumbers([...generatedNumbers, number]);
  };

  const placeNumberInBox = (index) => {
    if (randomNumber !== null && boxes[index] === null) {
      const newBoxes = [...boxes];
      newBoxes[index] = randomNumber;
      setBoxes(newBoxes);
      setRandomNumber(null);
      setIsButtonDisabled(false);

      if (newBoxes.every((box) => box !== null)) {
        const finalNumber = newBoxes.join('');
        const rank = getRank(finalNumber, newBoxes);
        setFinalMessage(`You got the ${rank} ${isLargestMode ? 'largest' : 'smallest'} number possible.`);
      }
    }
  };

  const resetGame = () => {
    setBoxes([null, null, null, null, null]);
    setRandomNumber(null);
    setIsButtonDisabled(false);
    setPlayerMessage('');
    setFinalMessage('');
    setGeneratedNumbers([]);
    setDisplayNumber(0);
  };

  const getRank = (number, boxes) => {
    const permutations = getPermutations(boxes);
    const sortedPermutations = Array.from(new Set(permutations.map((perm) => perm.join(''))))
      .sort((a, b) => (isLargestMode ? b - a : a - b));
    const rank = sortedPermutations.indexOf(number) + 1;
    return getOrdinalRank(rank);
  };

  const getPermutations = (array) => {
    if (array.length === 1) return [array];
    const permutations = [];
    for (let i = 0; i < array.length; i++) {
      const remaining = array.filter((_, index) => index !== i);
      const remainingPermutations = getPermutations(remaining);
      for (let perm of remainingPermutations) {
        permutations.push([array[i], ...perm]);
      }
    }
    return permutations;
  };

  const getOrdinalRank = (number) => {
    if (number % 10 === 1 && number !== 11) return `${number}st`;
    if (number % 10 === 2 && number !== 12) return `${number}nd`;
    if (number % 10 === 3 && number !== 13) return `${number}rd`;
    return `${number}th`;
  };

  return (
    <div className="hive-risk">
      <img src="/logo.png" alt="Number Hive Logo" className="logo" />
      <h1>Hive Risk</h1>
      <div className="flag">
        <p>Make the {isLargestMode ? 'largest' : 'smallest'} number you can by clicking on the box to place the generated number.</p>
      </div>
      <div className="number-display">
        <span className="animated-number">{displayNumber}</span>
        <span className="hint">Numbers 0-9</span>
      </div>
      <div className="mode-toggle">
        <input
          type="checkbox"
          checked={isLargestMode}
          onChange={() => setIsLargestMode(true)}
        />
        <span>Largest Number</span>
        <input
          type="checkbox"
          checked={!isLargestMode}
          onChange={() => setIsLargestMode(false)}
        />
        <span>Smallest Number</span>
      </div>
      {playerMessage && <p className="message">{playerMessage}</p>}
      <button
        onClick={generateRandomNumber}
        disabled={isButtonDisabled}
        className="generate-button"
      >
        Generate Random Number
      </button>
      <div className="boxes">
        {boxes.map((num, index) => (
          <button
            key={index}
            onClick={() => placeNumberInBox(index)}
            className={`box ${num !== null ? 'filled' : ''}`}
          >
            {num !== null ? num : ''}
          </button>
        ))}
      </div>
      {finalMessage && <p className="final-message">{finalMessage}</p>}
      <button onClick={resetGame} className="reset-button">Reset</button>
    </div>
  );
};

export default HiveRisk;