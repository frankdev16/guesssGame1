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
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [guessesInLevel, setGuessesInLevel] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('magic_high_score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setTarget(Math.floor(Math.random() * ranges[0]) + 1);
    setScreen('playing');
    setLives(4); 
    setScore(0);
    setLevel(0);
    setHistory([]);
    setGuessesInLevel(0);
  };

  const handleGuess = () => {
    const val = parseInt(guess);
    if (isNaN(val)) return;

    setGuessesInLevel(prev => prev + 1);
    setHistory(prev => [val, ...prev].slice(0, 3));

    if (val === target) {
      const pointsEarned = Math.floor((ranges[level] * lives) / (guessesInLevel + 1));
      const newScore = score + pointsEarned;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('magic_high_score', newScore.toString());
      }

      setScreen(level === ranges.length - 1 ? 'won_game' : 'won_level');
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setScreen('game_over');
      } else {
        const diff = Math.abs(target - val);
        const percent = (diff / ranges[level]) * 100;
        let radar = percent <= 10 ? "🔥 BURNING" : percent <= 30 ? "☁️ WARM" : "❄️ COLD";
        setHint(`${val > target ? 'LOWER' : 'HIGHER'} — ${radar}`);
      }
    }
    setGuess('');
  };

  const nextLevel = () => {
    const nextIdx = level + 1;
    let nextStageLives = 4 + nextIdx;
    const milestoneBonus = Math.floor((level + 1) / 3);
    nextStageLives += milestoneBonus;
    
    setLives(nextStageLives);
    setLevel(nextIdx);
    setTarget(Math.floor(Math.random() * ranges[nextIdx]) + 1);
    setHistory([]);
    setGuessesInLevel(0);
    setHint('GO!');
    setScreen('playing');
  };

  return (
    <div className="app-viewport">
      <div className="game-card">
        
        {screen === 'intro' && (
          <div className="center-content">
            <h1 className="title-brand">MAGIC<br/>GUESSER</h1>
            <div className="high-score-tag">WORLD RECORD: {highScore.toLocaleString()}</div>
            
            <div className="instructions-box">
              <h3>HOW TO PLAY</h3>
              <ul className="step-list">
                <li><span>1</span> <strong>The Goal:</strong> Guess the number to clear the stage.</li>
                <li><span>2</span> <strong>The Ascent:</strong> Numbers grow every level up to 1,000,000!</li>
                <li><span>3</span> <strong>The Radar:</strong> Use <strong>Hot/Cold</strong> hints to find the target.</li>
                <li><span>4</span> <strong>Survival:</strong> You lose lives for every wrong guess.</li>
              </ul>
            </div>

            <div className="bonus-pill">🎁 +1 Life Every 3 Stages</div>
            <button className="main-btn" onClick={startGame}>Accept Mission</button>
          </div>
        )}

        {screen === 'playing' && (
          <>
            <div className="top-hud">
                <div className="score-label">SCORE: {score.toLocaleString()}</div>
                <div className="level-pill">LVL {level + 1}</div>
            </div>

            <div className="stat-row">
              <div className="stat-box main-range">
                <span className="stat-label">GUESS A NUMBER BETWEEN</span>
                <span className="stat-value">1 — {ranges[level].toLocaleString()}</span>
              </div>
              <div className="stat-box" style={{borderColor: lives === 1 ? 'var(--danger)' : 'var(--border)', minWidth: '80px'}}>
                <span className="stat-label">Lives</span>
                <span className="stat-value">{lives}</span>
              </div>
            </div>

            <div className="center-focus">
                <div className="hint-text">{hint}</div>
                <input 
                    type="number" 
                    value={guess} 
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                    placeholder="Type here..."
                    autoFocus
                />
                <div className="history-line">
                    {history.length > 0 ? history.join(' • ') : 'Numbers will appear here'}
                </div>
            </div>
            <button className="main-btn" onClick={handleGuess}>Submit Guess</button>
          </>
        )}

        {screen === 'won_level' && (
          <div className="center-content">
            <h2 className="title-brand">LEVEL<br/>CLEAR</h2>
            <div className="stat-box" style={{marginBottom: '20px'}}>
               <span className="stat-label">Current Score</span>
               <span className="stat-value">{score.toLocaleString()}</span>
            </div>
            <p style={{color: '#94a3b8', marginBottom: '30px', fontSize: '0.9rem'}}>
              Next stage starting lives: {4 + (level + 1) + Math.floor((level + 1) / 3)}
            </p>
            <button className="main-btn" onClick={nextLevel} style={{ background: (level + 1) % 3 === 0 ? 'var(--gold)' : 'white' }}>
                {(level + 1) % 3 === 0 ? "Next Level + Bonus!" : "Next Level"}
            </button>
          </div>
        )}

        {(screen === 'game_over' || screen === 'won_game') && (
            <div className="center-content">
                <h2 className="title-brand" style={{color: screen === 'won_game' ? 'var(--gold)' : 'var(--danger)'}}>
                    {screen === 'won_game' ? 'LEGENDARY!' : <>MISSION<br/>FAILED</>}
                </h2>
                <div className="stat-box" style={{marginBottom: '20px'}}>
                    <span className="stat-label">Final Score</span>
                    <span className="stat-value">{score.toLocaleString()}</span>
                </div>
                <p style={{color: '#94a3b8', marginBottom: '30px'}}>
                    {screen === 'won_game' ? "You conquered the 1 Million Ascent!" : `The target was ${target.toLocaleString()}`}
                </p>
                <button className="main-btn" onClick={startGame}>Re-deploy</button>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;