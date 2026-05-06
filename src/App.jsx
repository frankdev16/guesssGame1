import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const ranges = [10, 50, 200, 1000, 5000, 20000, 100000, 500000, 1000000];
  const [screen, setScreen] = useState('intro');
  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(4);
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState('');
  const [hint, setHint] = useState('READY');
  const [accuracy, setAccuracy] = useState(0); 
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [minBound, setMinBound] = useState(1);
  const [maxBound, setMaxBound] = useState(ranges[0]);

  useEffect(() => {
    const saved = localStorage.getItem('magic_high_score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    const firstRange = ranges[0];
    setTarget(Math.floor(Math.random() * firstRange) + 1);
    setScreen('playing');
    setLives(4); 
    setScore(0); 
    setLevel(0);
    setHistory([]); 
    setAccuracy(0);
    setMinBound(1); 
    setMaxBound(firstRange);
    setHint('MAKE YOUR OPENING GUESS');
  };

  const handleGuess = () => {
    const val = parseInt(guess);
    if (isNaN(val) || val < 1 || val > ranges[level]) return;

    const diff = Math.abs(target - val);
    const currentRange = ranges[level];
    const rawAcc = 100 - (Math.log10(diff + 1) / Math.log10(currentRange) * 100);
    setAccuracy(Math.max(0, Math.min(100, rawAcc)));
    setHistory(prev => [val, ...prev].slice(0, 5));

    if (val === target) {
      const bonus = Math.floor((ranges[level] * lives) / (history.length + 1));
      const newScore = score + bonus;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('magic_high_score', newScore.toString());
      }
      setScreen(level === ranges.length - 1 ? 'won_game' : 'won_level');
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (val < target) setMinBound(Math.max(minBound, val + 1));
      else setMaxBound(Math.min(maxBound, val - 1));

      if (newLives <= 0) setScreen('game_over');
      else setHint(val > target ? 'AIM LOWER' : 'AIM HIGHER');
    }
    setGuess('');
  };

  const nextLevel = () => {
    const nextIdx = level + 1;
    const nextRange = ranges[nextIdx];
    setLives(4 + nextIdx + Math.floor(nextIdx / 3));
    setLevel(nextIdx);
    setTarget(Math.floor(Math.random() * nextRange) + 1);
    setMinBound(1); 
    setMaxBound(nextRange);
    setHistory([]); 
    setAccuracy(0);
    setHint('NEW TARGET ACQUIRED');
    setScreen('playing');
  };

  return (
    <div className="app-viewport">
      <div className={`game-card screen-${screen}`}>

        {screen === 'intro' && (
          <div className="center-content">
            <div className="badge">MISSION: 1 MILLION</div>
            <h1 className="title-brand">MAGIC<br/>GUESSER</h1>
            <div className="high-score-tag">WORLD RECORD: {highScore.toLocaleString()}</div>
            
            <div className="ultimate-guide">
               <div className="guide-item">
                 <span className="icon">🎯</span>
                 <p className="bright-text"><strong>Find the Target:</strong> Narrow down the secret number using the proximity meter.</p>
               </div>
               <div className="guide-item">
                 <span className="icon">📊</span>
                 <p className="bright-text"><strong>Watch the Meter:</strong> The bar moves right and glows gold as you get closer.</p>
               </div>
            </div>
            <button className="main-btn pulse" onClick={startGame}>Initialize Ascent</button>
          </div>
        )}

        {screen === 'playing' && (
          <>
            <div className="top-hud">
              <div className="hud-item">
                <span className="hud-label">SCORE</span>
                <span className="hud-val">{score.toLocaleString()}</span>
              </div>
              <div className="level-badge">LEVEL {level + 1}</div>
              <div className="hud-item">
                <span className="hud-label">LIVES</span>
                <span className="hud-val" style={{color: lives === 1 ? '#ef4444' : '#ffffff'}}>{lives}</span>
              </div>
            </div>

            <div className="accuracy-zone">
              <div className="meter-labels">
                <span>COLD</span>
                <span className="meter-percent">{Math.round(accuracy)}% MATCH</span>
                <span>HOT</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: `${accuracy}%` }}></div>
              </div>
            </div>

            <div className="range-display">
               <span className="range-label">THE NUMBER IS BETWEEN</span>
               <div className="range-box">
                  <span className="r-val">{minBound.toLocaleString()}</span>
                  <span className="r-sep">TO</span>
                  <span className="r-val">{maxBound.toLocaleString()}</span>
               </div>
            </div>

            <div className="input-section">
              <div className="hint-text">{hint}</div>
              <input 
                type="number" 
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="ENTER GUESS"
                autoFocus
              />
              <div className="history-pills">
                {history.map((h, i) => <span key={i} className="pill">{h.toLocaleString()}</span>)}
              </div>
            </div>
            <button className="main-btn" onClick={handleGuess}>Submit Analysis</button>
          </>
        )}

        {(screen === 'won_level' || screen === 'won_game' || screen === 'game_over') && (
          <div className="center-content result-screen">
            <h2 className="title-brand">
              {screen === 'game_over' ? 'MISSION FAILED' : 'STAGE CLEAR'}
            </h2>
            <div className="stat-summary">
                <span className="sum-label">FINAL SCORE</span>
                <span className="sum-val">{score.toLocaleString()}</span>
            </div>
            <button className="main-btn" onClick={screen === 'game_over' ? startGame : nextLevel}>
              {screen === 'game_over' ? 'Restart Mission' : 'Begin Next Ascent'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;