import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trophy, Heart, Clock, AlertCircle } from 'lucide-react';

interface PacManGameProps {
  onExit: (timeoutReached: boolean) => void;
}

// Classic 19x21 Pac-Man Maze Layout
// 1 = Wall, 0 = Pellet, 2 = Power Pellet, 3 = Empty, 4 = Ghost House
const INITIAL_MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1],
  [3,3,3,1,0,1,3,3,3,3,3,3,3,1,0,1,3,3,3],
  [1,1,1,1,0,1,3,1,1,4,1,1,3,1,0,1,1,1,1],
  [3,3,3,3,0,3,3,1,4,4,4,1,3,3,0,3,3,3,3],
  [1,1,1,1,0,1,3,1,1,1,1,1,3,1,0,1,1,1,1],
  [3,3,3,1,0,1,3,3,3,3,3,3,3,1,0,1,3,3,3],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,2,0,1,0,0,0,0,0,3,0,0,0,0,0,1,0,2,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

interface Ghost {
  x: number; // Pixel X
  y: number; // Pixel Y
  dx: number;
  dy: number;
  color: string;
  isFrightened: boolean;
}

const CELL_SIZE = 20;

export const PacManGame: React.FC<PacManGameProps> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // 5 Minute Timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);

  // Exact Integer Pixel coordinates: Tile center = col * CELL_SIZE + CELL_SIZE/2
  // Pac-Man starts at col 9, row 16 -> (190, 330)
  const gameStateRef = useRef({
    maze: INITIAL_MAZE.map(row => [...row]),
    pacman: { x: 190, y: 330, dx: 0, dy: 0, nextDx: 0, nextDy: 0, angle: 0, mouthOpen: 0 },
    ghosts: [
      { x: 170, y: 210, dx: 1, dy: 0, color: '#ef4444', isFrightened: false }, // Blinky (Red)
      { x: 190, y: 210, dx: -1, dy: 0, color: '#ec4899', isFrightened: false }, // Pinky (Pink)
      { x: 210, y: 210, dx: 0, dy: -1, color: '#06b6d4', isFrightened: false }, // Inky (Cyan)
      { x: 190, y: 190, dx: 0, dy: 1, color: '#f97316', isFrightened: false }   // Clyde (Orange)
    ] as Ghost[],
    frightenedTimer: null as NodeJS.Timeout | null,
    pelletsRemaining: 0
  });

  // Count initial pellets
  const countPellets = (maze: number[][]) => {
    let count = 0;
    for (let r = 0; r < maze.length; r++) {
      for (let c = 0; c < maze[r].length; c++) {
        if (maze[r][c] === 0 || maze[r][c] === 2) count++;
      }
    }
    return count;
  };

  // Reset positions for new life or level
  const resetPositions = useCallback(() => {
    const state = gameStateRef.current;
    state.pacman = { x: 190, y: 330, dx: 0, dy: 0, nextDx: 0, nextDy: 0, angle: 0, mouthOpen: 0 };
    state.ghosts = [
      { x: 170, y: 210, dx: 1, dy: 0, color: '#ef4444', isFrightened: false },
      { x: 190, y: 210, dx: -1, dy: 0, color: '#ec4899', isFrightened: false },
      { x: 210, y: 210, dx: 0, dy: -1, color: '#06b6d4', isFrightened: false },
      { x: 190, y: 190, dx: 0, dy: 1, color: '#f97316', isFrightened: false }
    ];
  }, []);

  // Restart new game
  const handleRestart = () => {
    const newMaze = INITIAL_MAZE.map(row => [...row]);
    gameStateRef.current.maze = newMaze;
    gameStateRef.current.pelletsRemaining = countPellets(newMaze);
    resetPositions();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
  };

  // 5 Minute countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExit(true); // Break over!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExit]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { pacman } = gameStateRef.current;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        pacman.nextDx = 0; pacman.nextDy = -1;
        e.preventDefault();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        pacman.nextDx = 0; pacman.nextDy = 1;
        e.preventDefault();
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        pacman.nextDx = -1; pacman.nextDy = 0;
        e.preventDefault();
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        pacman.nextDx = 1; pacman.nextDy = 0;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set directional control from buttons
  const setDirection = (dx: number, dy: number) => {
    const { pacman } = gameStateRef.current;
    pacman.nextDx = dx;
    pacman.nextDy = dy;
  };

  // Main game loop using exact Integer math
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameStateRef.current.pelletsRemaining === 0) {
      gameStateRef.current.pelletsRemaining = countPellets(gameStateRef.current.maze);
    }

    let animationFrameId: number;
    const pacSpeed = 2; // Exact 2 pixels per frame
    const ghostSpeed = 1; // Exact 1 pixel per frame

    const updateGame = () => {
      if (gameOver || gameWon) return;

      const state = gameStateRef.current;
      const { pacman, ghosts, maze } = state;

      // Check if Pac-Man is centered on a tile (col * 20 + 10)
      const isCentered = (pacman.x - 10) % CELL_SIZE === 0 && (pacman.y - 10) % CELL_SIZE === 0;
      const col = Math.floor(pacman.x / CELL_SIZE);
      const row = Math.floor(pacman.y / CELL_SIZE);

      // Try turning in queued direction
      if (pacman.nextDx !== 0 || pacman.nextDy !== 0) {
        if (isCentered) {
          const targetCol = col + pacman.nextDx;
          const targetRow = row + pacman.nextDy;
          if (
            targetRow >= 0 &&
            targetRow < maze.length &&
            targetCol >= 0 &&
            targetCol < maze[0].length &&
            maze[targetRow][targetCol] !== 1
          ) {
            pacman.dx = pacman.nextDx;
            pacman.dy = pacman.nextDy;
            pacman.nextDx = 0;
            pacman.nextDy = 0;
          }
        } else if (pacman.nextDx === -pacman.dx && pacman.nextDy === -pacman.dy) {
          // Allow instant 180-degree turn mid-tile
          pacman.dx = pacman.nextDx;
          pacman.dy = pacman.nextDy;
          pacman.nextDx = 0;
          pacman.nextDy = 0;
        }
      }

      // Check if current direction is blocked by a wall
      if (isCentered && (pacman.dx !== 0 || pacman.dy !== 0)) {
        const nextCol = col + pacman.dx;
        const nextRow = row + pacman.dy;
        if (
          nextRow >= 0 &&
          nextRow < maze.length &&
          nextCol >= 0 &&
          nextCol < maze[0].length &&
          maze[nextRow][nextCol] === 1
        ) {
          pacman.dx = 0;
          pacman.dy = 0;
        }
      }

      // Move Pac-Man
      pacman.x += pacman.dx * pacSpeed;
      pacman.y += pacman.dy * pacSpeed;

      // Handle wrap-around tunnel
      if (pacman.x < 0) pacman.x = 19 * CELL_SIZE - 10;
      if (pacman.x > 19 * CELL_SIZE) pacman.x = 10;

      // Update mouth animation
      if (pacman.dx !== 0 || pacman.dy !== 0) {
        pacman.mouthOpen = (Math.sin(Date.now() * 0.02) * 0.25 + 0.25);
        if (pacman.dx === 1) pacman.angle = 0;
        else if (pacman.dx === -1) pacman.angle = Math.PI;
        else if (pacman.dy === 1) pacman.angle = Math.PI / 2;
        else if (pacman.dy === -1) pacman.angle = -Math.PI / 2;
      }

      // Eat pellets when centered on tile
      if (isCentered && row >= 0 && row < maze.length && col >= 0 && col < maze[0].length) {
        const cell = maze[row][col];
        if (cell === 0 || cell === 2) {
          maze[row][col] = 3;
          state.pelletsRemaining -= 1;
          setScore((prev) => prev + (cell === 2 ? 50 : 10));

          if (cell === 2) {
            ghosts.forEach((g) => (g.isFrightened = true));
            if (state.frightenedTimer) clearTimeout(state.frightenedTimer);
            state.frightenedTimer = setTimeout(() => {
              gameStateRef.current.ghosts.forEach((g) => (g.isFrightened = false));
            }, 7000);
          }

          if (state.pelletsRemaining <= 0) {
            setGameWon(true);
            setTimeout(() => {
              setLevel((prev) => prev + 1);
              handleRestart();
            }, 2000);
          }
        }
      }

      // Ghost AI & Movement
      ghosts.forEach((g) => {
        const isGhostCentered = (g.x - 10) % CELL_SIZE === 0 && (g.y - 10) % CELL_SIZE === 0;
        if (isGhostCentered) {
          const gCol = Math.floor(g.x / CELL_SIZE);
          const gRow = Math.floor(g.y / CELL_SIZE);

          const dirs = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
          ];

          const validDirs = dirs.filter((d) => {
            const nr = gRow + d.dy;
            const nc = gCol + d.dx;
            if (nr < 0 || nr >= maze.length || nc < 0 || nc >= maze[0].length) return false;
            if (maze[nr][nc] === 1) return false;
            // Avoid immediate 180 turn unless dead end
            if (d.dx === -g.dx && d.dy === -g.dy && dirs.length > 1) return false;
            return true;
          });

          if (validDirs.length > 0) {
            if (g.isFrightened) {
              const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
              g.dx = chosen.dx;
              g.dy = chosen.dy;
            } else {
              validDirs.sort((a, b) => {
                const distA = Math.hypot(g.x + a.dx * 20 - pacman.x, g.y + a.dy * 20 - pacman.y);
                const distB = Math.hypot(g.x + b.dx * 20 - pacman.x, g.y + b.dy * 20 - pacman.y);
                return distA - distB;
              });
              g.dx = validDirs[0].dx;
              g.dy = validDirs[0].dy;
            }
          }
        }

        g.x += g.dx * ghostSpeed;
        g.y += g.dy * ghostSpeed;

        if (g.x < 0) g.x = 19 * CELL_SIZE - 10;
        if (g.x > 19 * CELL_SIZE) g.x = 10;

        // Collision with Pac-Man
        const dist = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        if (dist < 16) {
          if (g.isFrightened) {
            g.x = 9 * CELL_SIZE + 10;
            g.y = 10 * CELL_SIZE + 10;
            g.isFrightened = false;
            setScore((prev) => prev + 200);
          } else {
            setLives((prev) => {
              const next = prev - 1;
              if (next <= 0) {
                setGameOver(true);
              } else {
                setTimeout(() => resetPositions(), 500);
              }
              return next;
            });
          }
        }
      });
    };

    const drawGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { pacman, ghosts, maze } = gameStateRef.current;

      // Draw Maze
      for (let r = 0; r < maze.length; r++) {
        for (let c = 0; c < maze[r].length; c++) {
          const x = c * CELL_SIZE;
          const y = r * CELL_SIZE;
          const cell = maze[r][c];

          if (cell === 1) {
            // Elegant academic slate/blue wall styling
            ctx.fillStyle = '#1e293b'; // Slate 800
            ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#3b82f6'; // Blue 500 border accent
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          } else if (cell === 0) {
            // Pellet
            ctx.fillStyle = '#93c5fd'; // Soft blue
            ctx.beginPath();
            ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (cell === 2) {
            // Power Pellet
            ctx.fillStyle = '#f59e0b'; // Amber
            ctx.beginPath();
            ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw Pac-Man
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(
        pacman.x,
        pacman.y,
        CELL_SIZE / 2 - 2,
        pacman.angle + pacman.mouthOpen,
        pacman.angle + Math.PI * 2 - pacman.mouthOpen
      );
      ctx.lineTo(pacman.x, pacman.y);
      ctx.fill();

      // Draw Ghosts
      ghosts.forEach((ghost) => {
        const radius = CELL_SIZE / 2 - 2;
        ctx.fillStyle = ghost.isFrightened ? '#3b82f6' : ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y - 2, radius, Math.PI, 0, false);
        ctx.lineTo(ghost.x + radius, ghost.y + radius);
        ctx.lineTo(ghost.x + radius / 2, ghost.y + radius - 3);
        ctx.lineTo(ghost.x, ghost.y + radius);
        ctx.lineTo(ghost.x - radius / 2, ghost.y + radius - 3);
        ctx.lineTo(ghost.x - radius, ghost.y + radius);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ghost.x - 3, ghost.y - 3, 2.5, 0, Math.PI * 2);
        ctx.arc(ghost.x + 3, ghost.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = ghost.isFrightened ? '#ffffff' : '#1d4ed8';
        ctx.beginPath();
        ctx.arc(ghost.x - 3 + ghost.dx * 1.5, ghost.y - 3 + ghost.dy * 1.5, 1.2, 0, Math.PI * 2);
        ctx.arc(ghost.x + 3 + ghost.dx * 1.5, ghost.y - 3 + ghost.dy * 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const loop = () => {
      updateGame();
      drawGame();
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameOver, gameWon, resetPositions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-[#30363d] dark:bg-[#0d1117] transition-colors text-gray-900 dark:text-gray-100 font-sans w-full max-w-full overflow-hidden">
      
      {/* Top Banner: Perfectly harmonized with Light & Dark Mode Academic Theme */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100 dark:border-[#21262d]">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-[#1f6feb]/15 text-blue-600 dark:text-[#58a6ff] border border-blue-100 dark:border-[#1f6feb]/30 text-xl font-bold shadow-sm">
            🎮
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Vicharanashala Cognitive Focus Break
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-[#1f6feb]/20 text-[11px] font-semibold text-blue-700 dark:text-[#58a6ff]">
                Level {level}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8b949e] mt-0.5">
              Engage in a 5-minute cognitive reset. The tracker will automatically revert when the session concludes.
            </p>
          </div>
        </div>

        {/* Status Pills: Sleek, Clean, Modern UI without Clutter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* Timer Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-100 dark:bg-[#161b22] border border-gray-200/80 dark:border-[#30363d] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold shadow-sm font-mono">
            <Clock className="h-4 w-4 text-blue-600 dark:text-[#58a6ff] animate-spin" style={{ animationDuration: '6s' }} />
            <span>⏱️ {formatTime(timeLeft)}</span>
          </div>

          {/* Score Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-[#238636]/15 border border-emerald-200/80 dark:border-[#238636]/30 text-emerald-700 dark:text-[#39d353] text-xs sm:text-sm font-semibold shadow-sm">
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-[#39d353]" />
            <span>Score: {score}</span>
          </div>

          {/* Lives Pill */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-50 dark:bg-[#a371f7]/15 border border-purple-200/80 dark:border-[#a371f7]/30 text-purple-700 dark:text-[#d2a8ff] text-xs sm:text-sm font-semibold shadow-sm">
            <Heart className="h-4 w-4 text-purple-600 dark:text-[#d2a8ff] fill-current" />
            <span>× {lives}</span>
          </div>

          {/* Early Exit Button */}
          <button
            onClick={() => onExit(false)}
            className="px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-xs sm:text-sm font-bold transition-all shadow-sm shrink-0"
            title="End break and return to study dashboard"
          >
            End Break Early
          </button>
        </div>
      </div>

      {/* Game Canvas & On-Screen Controls: 100% Responsive Grid */}
      <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 py-2 w-full">
        
        {/* Canvas Board: Scaled responsively for any screen */}
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#30363d] shadow-md bg-[#0a0e17] shrink-0 w-full max-w-[380px] aspect-[19/21] mx-auto">
          <canvas
            ref={canvasRef}
            width={380}
            height={420}
            className="block w-full h-auto"
          />

          {/* Game Over / Won Overlay */}
          {(gameOver || gameWon) && (
            <div className="absolute inset-0 bg-gray-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3.5 text-center p-6 animate-in fade-in duration-200 z-30">
              <span className="text-4xl sm:text-5xl animate-bounce">{gameWon ? '🏆' : '💀'}</span>
              <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {gameWon ? 'Level Cleared! Excellent Focus!' : 'Session Concluded'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xs font-normal leading-relaxed">
                {gameWon ? `Advancing to Level ${level + 1} with heightened cognitive challenge...` : `You scored ${score} points! Take a deep breath or try another round within your break time.`}
              </p>
              {gameOver && (
                <button
                  onClick={handleRestart}
                  className="mt-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-105 flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* On-Screen D-Pad & Focus Rule Sidebar */}
        <div className="flex flex-col items-center justify-between gap-5 w-full max-w-xs shrink-0 mx-auto">
          
          <div className="w-full p-5 rounded-xl bg-gray-50 dark:bg-[#161b22] border border-gray-200/80 dark:border-[#30363d] text-center shadow-sm">
            <h5 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-4">
              On-Screen Controls
            </h5>
            
            {/* Directional D-Pad: Responsive & Ergonomic */}
            <div className="inline-grid grid-cols-3 gap-2 w-40 mx-auto">
              <div />
              <button
                onClick={() => setDirection(0, -1)}
                className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl bg-white dark:bg-[#21262d] hover:bg-blue-600 dark:hover:bg-[#1f6feb] hover:text-white active:bg-blue-700 text-gray-800 dark:text-gray-100 flex items-center justify-center border border-gray-200 dark:border-[#30363d] shadow-sm transition-all active:scale-95 cursor-pointer"
                aria-label="Move Up"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <div />
              
              <button
                onClick={() => setDirection(-1, 0)}
                className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl bg-white dark:bg-[#21262d] hover:bg-blue-600 dark:hover:bg-[#1f6feb] hover:text-white active:bg-blue-700 text-gray-800 dark:text-gray-100 flex items-center justify-center border border-gray-200 dark:border-[#30363d] shadow-sm transition-all active:scale-95 cursor-pointer"
                aria-label="Move Left"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl bg-blue-50 dark:bg-[#1f6feb]/20 flex items-center justify-center border border-blue-200 dark:border-[#1f6feb]/40">
                <span className="text-[10px] text-blue-700 dark:text-[#58a6ff] font-bold tracking-tight">PAC</span>
              </div>
              
              <button
                onClick={() => setDirection(1, 0)}
                className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl bg-white dark:bg-[#21262d] hover:bg-blue-600 dark:hover:bg-[#1f6feb] hover:text-white active:bg-blue-700 text-gray-800 dark:text-gray-100 flex items-center justify-center border border-gray-200 dark:border-[#30363d] shadow-sm transition-all active:scale-95 cursor-pointer"
                aria-label="Move Right"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <div />
              <button
                onClick={() => setDirection(0, 1)}
                className="h-12 w-12 sm:h-13 sm:w-13 rounded-xl bg-white dark:bg-[#21262d] hover:bg-blue-600 dark:hover:bg-[#1f6feb] hover:text-white active:bg-blue-700 text-gray-800 dark:text-gray-100 flex items-center justify-center border border-gray-200 dark:border-[#30363d] shadow-sm transition-all active:scale-95 cursor-pointer"
                aria-label="Move Down"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
              <div />
            </div>
            
            <p className="text-[11px] text-gray-500 dark:text-[#8b949e] mt-3.5 leading-normal">
              Use <strong>Arrow Keys</strong> or <strong>WASD</strong> on keyboard, or tap the D-Pad buttons above!
            </p>
          </div>

          {/* Quick Study Break Note */}
          <div className="w-full p-4 rounded-xl bg-blue-50/60 dark:bg-[#1f6feb]/10 border border-blue-100 dark:border-[#1f6feb]/20 text-xs text-gray-700 dark:text-gray-300 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-[#58a6ff] mb-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>5-Minute Cognitive Reset</span>
            </div>
            <p className="leading-relaxed text-[11px] font-normal text-gray-600 dark:text-gray-400">
              Short, structured study breaks prevent cognitive fatigue. When the timer reaches 00:00, this view automatically reverts so you can return refreshed to your Vicharanashala learning milestones!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
