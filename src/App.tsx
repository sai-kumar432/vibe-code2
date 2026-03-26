import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Gamepad2 } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

const TRACKS = [
  {
    id: 1,
    title: 'Neon Drive (AI Gen)',
    artist: 'Cyber Synth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'Digital Dreams (AI Gen)',
    artist: 'Neural Network',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'Cyberpunk City (AI Gen)',
    artist: 'Algorithm Audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  
  const lastProcessedDirection = useRef(INITIAL_DIRECTION);
  
  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Game Loop
  useEffect(() => {
    if (!isGameRunning || gameOver) return;

    const moveSnake = () => {
      const head = snake[0];
      const newHead = { x: head.x + direction.x, y: head.y + direction.y };

      // Update last processed direction
      lastProcessedDirection.current = direction;

      // Collision checks
      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        setIsGameRunning(false);
        if (score > highScore) setHighScore(score);
        return;
      }

      const newSnake = [newHead, ...snake];
      
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        let newFood;
        while (true) {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          };
          if (!newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
            break;
          }
        }
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const timeoutId = setTimeout(moveSnake, Math.max(50, INITIAL_SPEED - Math.floor(score / 50) * 5));
    return () => clearTimeout(timeoutId);
  }, [snake, direction, isGameRunning, gameOver, food, score, highScore]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && (gameOver || !isGameRunning)) {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        lastProcessedDirection.current = INITIAL_DIRECTION;
        setScore(0);
        setGameOver(false);
        setFood({ x: 5, y: 5 });
        setIsGameRunning(true);
        return;
      }

      setDirection(prev => {
        const lastDir = lastProcessedDirection.current;
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return lastDir.y === 1 ? prev : { x: 0, y: -1 };
          case 'ArrowDown':
          case 's':
          case 'S':
            return lastDir.y === -1 ? prev : { x: 0, y: 1 };
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return lastDir.x === 1 ? prev : { x: -1, y: 0 };
          case 'ArrowRight':
          case 'd':
          case 'D':
            return lastDir.x === -1 ? prev : { x: 1, y: 0 };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isGameRunning]);

  // Music Controls
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [currentTrackIndex, isPlaying]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono flex flex-col items-center justify-center p-4 selection:bg-pink-500/30">
      {/* Header */}
      <header className="w-full max-w-3xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
          <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            NEON SNAKE
          </h1>
        </div>
        <div className="flex gap-6 text-xl font-bold">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Score</span>
            <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">{score.toString().padStart(4, '0')}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-widest">High Score</span>
            <span className="text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">{highScore.toString().padStart(4, '0')}</span>
          </div>
        </div>
      </header>

      {/* Game Board */}
      <div className="relative bg-slate-900/50 border-2 border-slate-800 rounded-xl p-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-sm mb-8">
        <div 
          className="grid gap-[1px] bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(80vw, 500px)',
            height: 'min(80vw, 500px)'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.some((segment, idx) => idx !== 0 && segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className={`
                  w-full h-full rounded-sm transition-all duration-75
                  ${isSnakeHead ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-10' : ''}
                  ${isSnakeBody ? 'bg-cyan-500/80 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : ''}
                  ${isFood ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)] animate-pulse' : ''}
                  ${!isSnakeHead && !isSnakeBody && !isFood ? 'bg-slate-900/40' : ''}
                `}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {(!isGameRunning && !gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-xl">
            <div className="text-center animate-pulse">
              <p className="text-2xl font-bold text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">PRESS SPACE TO START</p>
              <p className="text-sm text-slate-400">Use WASD or Arrow Keys to move</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-xl">
            <div className="text-center">
              <h2 className="text-4xl font-black text-pink-500 mb-2 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">GAME OVER</h2>
              <p className="text-xl text-cyan-400 mb-6">Final Score: {score}</p>
              <button 
                onClick={() => {
                  setSnake(INITIAL_SNAKE);
                  setDirection(INITIAL_DIRECTION);
                  lastProcessedDirection.current = INITIAL_DIRECTION;
                  setScore(0);
                  setGameOver(false);
                  setFood({ x: 5, y: 5 });
                  setIsGameRunning(true);
                }}
                className="px-6 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold rounded-lg hover:bg-cyan-400 hover:text-slate-950 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Music Player */}
      <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.5)] animate-[spin_4s_linear_infinite]" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
            <div className="w-4 h-4 rounded-full bg-slate-900" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-200 truncate">{TRACKS[currentTrackIndex].title}</p>
            <p className="text-xs text-cyan-400/80 truncate">{TRACKS[currentTrackIndex].artist}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 w-1/3">
          <button onClick={playPrevTrack} className="text-slate-400 hover:text-cyan-400 transition-colors">
            <SkipBack className="w-6 h-6" />
          </button>
          <button 
            onClick={togglePlayPause} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-pink-500 hover:border-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          <button onClick={playNextTrack} className="text-slate-400 hover:text-cyan-400 transition-colors">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 w-1/3">
          <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-cyan-400 transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={TRACKS[currentTrackIndex].url} 
        onEnded={playNextTrack}
      />
    </div>
  );
}
