import { generateMaze } from 'utils/maze-generator';
import './App.css';
import React, { useState, useEffect, useRef } from "react";
import { useMoveGenerator } from 'utils/move-generator';

const CELL_SIZE = 30;
const INTERVAL = 150;
const BASE_HEIGHT = 10;
const BASE_WIDTH = 15;
const BASE_GHOSTS = 1;
const BASE_RANGE = 50;
const FOOD_RADIUS = 3;
const baseData = generateMaze(BASE_HEIGHT, BASE_WIDTH, BASE_GHOSTS, BASE_RANGE);

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [maze, setMaze] = useState(baseData.maze);
  const { getRandomMove, getMoveToPacMan } = useMoveGenerator(maze);
  const [level, setLevel] = useState(1);
  const [height, setHeight] = useState(BASE_HEIGHT);
  const [width, setWidth] = useState(BASE_WIDTH);
  const [ghostsNumber, setGhostsNumber] = useState(BASE_GHOSTS);
  const [pacman, setPacman] = useState(baseData.pacman);
  const [ghosts, setGhosts] = useState(baseData.ghosts);
  const [gameOver, setGameOver] = useState(false);

  const drawMaze = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let rowIndex = 0; rowIndex < height - 2; rowIndex++) {
      for (let colIndex = 0; colIndex < width - 2; colIndex++) {
        const cell = maze[rowIndex + 1][colIndex + 1];

        if (cell === "#") {
          ctx.fillStyle = "blue";
          ctx.fillRect(colIndex * CELL_SIZE, rowIndex * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (cell === "P") {
          ctx.fillStyle = "yellow";
          const centerX = colIndex * CELL_SIZE + CELL_SIZE / 2;
          const centerY = rowIndex * CELL_SIZE + CELL_SIZE / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, CELL_SIZE / 2.5, 0.2 * Math.PI, 1.8 * Math.PI);
          ctx.lineTo(centerX, centerY);
          ctx.fill();
        } else if (cell === "G" || cell === "U") {
          ctx.fillStyle = "red";
          const centerX = colIndex * CELL_SIZE + CELL_SIZE / 2;
          const centerY = rowIndex * CELL_SIZE + CELL_SIZE / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, CELL_SIZE / 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === ".") {
          ctx.fillStyle = "white";
          const dotX = colIndex * CELL_SIZE + CELL_SIZE / 2;
          const dotY = rowIndex * CELL_SIZE + CELL_SIZE / 2;
          ctx.beginPath();
          ctx.arc(dotX, dotY, FOOD_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  const checkCollision = () => {
    return ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y);
  };

  const checkLevelCompletion = () => {
    return maze.every(row => !row.includes("."));
  };

  const movePacManAndGhosts = () => {
    if (gameOver) return;

    const newPos = { ...pacman };
    const newMaze = maze.map((row) => row.slice());

    if (pacman.direction === "ArrowUp" && maze[newPos.x - 1][newPos.y] !== "#") newPos.x--;
    if (pacman.direction === "ArrowDown" && maze[newPos.x + 1][newPos.y] !== "#") newPos.x++;
    if (pacman.direction === "ArrowLeft" && maze[newPos.x][newPos.y - 1] !== "#") newPos.y--;
    if (pacman.direction === "ArrowRight" && maze[newPos.x][newPos.y + 1] !== "#") newPos.y++;
    if (maze[newPos.x][newPos.y] !== "#") {
      newMaze[pacman.x][pacman.y] = " ";
      newMaze[newPos.x][newPos.y] = "P";

      if (newMaze[newPos.x][newPos.y] === ".") {
        newMaze[newPos.x][newPos.y] = " ";
      }

      setPacman(newPos);
    }

    const newGhosts = ghosts.map((ghost) => {
      let newGhost = { x: ghost.x, y: ghost.y };
      if (level === 1) {
        newGhost = getRandomMove(ghost.x, ghost.y, ghost.direction ?? { x: -1, y: 0 });
      } else {
        newGhost = getMoveToPacMan(ghost.x, ghost.y, pacman.x, pacman.y);
      }
      newMaze[ghost.x][ghost.y] = newMaze[ghost.x][ghost.y] === "G" ? " " : ".";
      newMaze[newGhost.x][newGhost.y] = newMaze[newGhost.x][newGhost.y] === " " ? "G" : "U";
      return newGhost;
    });

    if (checkCollision()) {
      setGameOver(true);
    } else {
      setMaze(newMaze);
      setGhosts(newGhosts);
    }

    if (checkLevelCompletion()) {
      nextLevel()
    }
  };

  const nextLevel = () => {
    setLevel(prev => prev + 1);
    const newHeight = height + 5;
    const newWidth = width + 5;
    const newGhostsNumber = ghostsNumber + 1;
    const generatedData = generateMaze(newHeight, newWidth, newGhostsNumber, BASE_RANGE);
    setHeight(newHeight);
    setWidth(newWidth);
    setGhostsNumber(newGhostsNumber);
    setMaze(generatedData.maze);
    setPacman(generatedData.pacman);
    setGhosts(generatedData.ghosts);
  };

  const restartGame = () => {
    const generatedData = generateMaze(BASE_HEIGHT, BASE_WIDTH, BASE_GHOSTS, BASE_RANGE);
    setHeight(BASE_HEIGHT);
    setWidth(BASE_WIDTH);
    setGhostsNumber(BASE_GHOSTS);
    setMaze(generatedData.maze);
    setPacman(generatedData.pacman);
    setGhosts(generatedData.ghosts);
    setGameOver(false);
    setLevel(1);
  };

  const handleNextLevel = () => {
    nextLevel();
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameOver) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        if (
          (event.key === "ArrowUp" && maze[pacman.x - 1][pacman.y] !== "#") ||
          (event.key === "ArrowDown" && maze[pacman.x + 1][pacman.y] !== "#") ||
          (event.key === "ArrowLeft" && maze[pacman.x][pacman.y - 1] !== "#") ||
          (event.key === "ArrowRight" && maze[pacman.x][pacman.y + 1] !== "#")
        ) {
          setPacman((prev) => ({ ...prev, direction: event.key }));
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    const interval = setInterval(() => {
      movePacManAndGhosts();
    }, INTERVAL);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      clearInterval(interval);
    };
  }, [pacman, ghosts, maze, gameOver]);

  useEffect(() => {
    drawMaze();
  }, [maze]);

  return (
    <div className='container'>
      <h1>Pac-Man</h1>
      <h2>Level: {level}</h2>
      {gameOver && (
        <div className='game-over'>
          <h2>GAME OVER</h2>
          <button onClick={restartGame}>RESTART</button>
        </div>
      )}
      {level === 1 && <button onClick={handleNextLevel}>SKIP LEVEL</button>}
      <canvas
        ref={canvasRef}
        width={(width - 2) * CELL_SIZE}
        height={(height - 2) * CELL_SIZE}
        style={{ border: "5px solid blue" }}
      ></canvas>
    </div>
  );
}

export default App;
