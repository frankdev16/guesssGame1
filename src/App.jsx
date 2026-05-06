import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const ranges = [10, 50, 200, 1000, 5000, 20000, 100000, 500000, 1000000];
  const [screen, setScreen] = useState('intro');
  const [level, setLevel] = useState(0);
  const [lives, setLives] = useState(4); // Stage 1 starts with 4
  const [target, setTarget] = useState(0);
  const [guess, setGuess] = useState('');
  const [hint, setHint] = useState('READY');
  const [history, setHistory] = useState([]);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [guessesInLevel, setGuessesInLevel] = useState(0);

  // Load High Score from local storage
  useEffect(() => {
    const saved = localStorage.getItem('magic_high_score');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const startGame = () => {
    setTarget(Math.floor(Math.random() * ranges[0]) + 1);
    setScreen('playing');
    setLives(4); // Ensure lives reset correctly if playing again
    setScore(0);
    setLevel(0);
    setHistory([]);
  };

  const handleGuess = () => {
    const val = parseInt(guess);
    if (isNaN(val)) return;

    setGuessesInLevel(prev => prev + 1);
    setHistory(prev => [val, ...prev].slice(0, 3));

    if (val === target) {
      // Score Calculation
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
        
        let radar = percent <= 10 ? "🔥 BURNING (Very close!)" : percent <= 30 ? "☁️ WARM (Getting closer)" : "❄️ COLD (Far away)";
        setHint(`${val > target ? 'LOWER' : 'HIGHER'} — ${radar}`);
      }
    }
    setGuess('');
  };

  const nextLevel = () => {
    const stagesCleared = level + 1;
    const nextIdx = level + 1;
    
    // GUARANTEED BASELINE LOGIC:
    // Stage 1 = 4, Stage 2 = 5, Stage 3 = 6
    let nextStageLives = 4 + nextIdx;
    
    // MILESTONE LOGIC: Add +1 extra permanent life for every 3 stages cleared
    const milestoneBonus = Math.floor(stagesCleared / 3);
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
            <div className="high-score-tag">HIGH SCORE: {highScore.toLocaleString()}</div>
            
            <div className="rules-container">
              <p className="rule-item"><strong>START</strong> Stage 1: 4 Lives</p>
              <p className="rule-item"><strong>SURVIVAL</strong> Lives scale up every stage</p>
              <p className="rule-item"><strong>MILESTONE</strong> Extra +1 Life every 3 stages</p>
            </div>

            <div className="rules-container" style={{ marginTop: '0', background: 'rgba(0,0,0,0.3)' }}>
                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                    Radar (Distance):
                </p>
                <p className="rule-item">🔥 <strong>BURNING</strong> Very close (10% range)</p>
                <p className="rule-item">☁️ <strong>WARM</strong> Getting closer (30% range)</p>
                <p className="rule-item">❄️ <strong>COLD</strong> Too far away</p>
            </div>

            <button className="main-btn" onClick={startGame}>Start Game</button>
          </div>
        )}

        {screen === 'playing' && (
          <>
            <div className="top-hud">
                <div className="score-label">SCORE: {score.toLocaleString()}</div>
                <div className="level-pill">LVL {level + 1}</div>
            </div>

            <div className="stat-row">
              <div className="stat-box">
                <span className="stat-label">Range 1 to</span>
                <span className="stat-value">{ranges[level].toLocaleString()}</span>
              </div>
              <div className="stat-box" style={{borderColor: lives === 1 ? 'var(--danger)' : 'var(--border)'}}>
                <span className="stat-label">Lives</span>
                <span className="stat-value">{lives}</span>
              </div>
            </div>

            <div className="center-focus">
                <div className="hint-text">{hint}</div>
                {/* PROPERLY REMOVED PLACEHOLDER - NO MORE CRASHES */}
                <input 
                    type="number" 
                    value={guess} 
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                    autoFocus
                />
                <div className="history-line">
                    {history.length > 0 ? history.join(' • ') : 'Enter a number'}
                </div>
            </div>

            <button className="main-btn" onClick={handleGuess}>Submit</button>
          </>
        )}

        {screen === 'won_level' && (
          <div className="center-content">
            <h2 className="title-brand">LEVEL<br/>CLEAR</h2>
            <div className="stat-box" style={{marginBottom: '20px'}}>
               <span className="stat-label">Points Earned</span>
               <span className="stat-value">{score.toLocaleString()}</span>
            </div>
            
            {/* Show exactly how many lives they are getting next */}
            <p style={{color: '#94a3b8', marginBottom: '30px'}}>
              Next Stage Guaranteed Lives: {4 + (level + 1) + Math.floor((level + 1) / 3)}
            </p>
            
            <button className="main-btn" onClick={nextLevel} style={{ background: (level + 1) % 3 === 0 ? 'var(--gold)' : 'white' }}>
                {(level + 1) % 3 === 0 ? "Next Stage (+Milestone Bonus!)" : "Next Stage"}
            </button>
          </div>
        )}

        {(screen === 'game_over' || screen === 'won_game') && (
            <div className="center-content">
                <h2 className="title-brand" style={{color: screen === 'won_game' ? 'var(--gold)' : 'var(--danger)'}}>
                    {screen === 'won_game' ? 'YOU WIN!' : <>GAME<br/>OVER</>}
                </h2>
                <div className="stat-box" style={{marginBottom: '20px'}}>
                    <span className="stat-label">Final Score</span>
                    <span className="stat-value">{score.toLocaleString()}</span>
                </div>
                <p style={{color: '#94a3b8', marginBottom: '30px'}}>
                    {screen === 'won_game' ? "Legendary!" : `The target was ${target.toLocaleString()}`}
                </p>
                <button className="main-btn" onClick={startGame}>Try Again</button>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;