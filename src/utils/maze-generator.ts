import { Coordinate } from "types/global.types";

type Tetromino = {
  shape: number[][];
  width: number;
  height: number;
};

const TETROMINOS: Tetromino[] = [
  { shape: [[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]], width: 5, height: 3 },
  { shape: [[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [0, 1, 1, 1, 0]], width: 5, height: 4 },
  { shape: [[1, 1, 1], [1, 0, 1], [1, 0, 1], [1, 1, 1]], width: 3, height: 4 },
];

export function generateMaze(height: number, width: number, ghostNumber: number, minRange: number) {
  const maze = Array.from({ length: height }, () => Array.from({ length: width }, () => "#"));

  const placeTetromino = (tetromino: Tetromino) => {
    let placed = false;
    while (!placed) {
      // Ensure startX is between 1 and height - tetromino.height - 1
      const startX = Math.floor(Math.random() * (height - tetromino.height - 2)) + 1;
      // Ensure startY is between 1 and width - tetromino.width - 1
      const startY = Math.floor(Math.random() * (width - tetromino.width - 2)) + 1;

      let canPlace = true;
      for (let x = 0; x < tetromino.height; x++) {
        for (let y = 0; y < tetromino.width; y++) {
          if (tetromino.shape[x][y] === 1 && maze[startX + x][startY + y] === ".") {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) break;
      }
      if (canPlace) {
        for (let x = 0; x < tetromino.height; x++) {
          for (let y = 0; y < tetromino.width; y++) {
            if (tetromino.shape[x][y] === 1) {
              maze[startX + x][startY + y] = ".";
            }
          }
        }
        placed = true;
      } else {
        break;
      }
    }
    if (!placed) {
      // Recalculate startX and startY to ensure they are not on the edges
      const startX = Math.floor(Math.random() * (height - tetromino.height - 2)) + 1;
      const startY = Math.floor(Math.random() * (width - tetromino.width - 2)) + 1;
      for (let x = 0; x < tetromino.height; x++) {
        for (let y = 0; y < tetromino.width; y++) {
          if (tetromino.shape[x][y] === 1) {
            maze[startX + x][startY + y] = ".";
          }
        }
      }
    }
  };

  for (let i = 0; i < Math.floor((height * width) / 15 - height / 5); i++) {
    const randomTetromino = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    placeTetromino(randomTetromino);
  }
  let startX, startY;
  do {
    startX = Math.floor(Math.random() * (height - 2)) + 1;
    startY = Math.floor(Math.random() * (width - 2)) + 1;
  } while (maze[startX][startY] !== ".");

  const ghosts = [];
  for (let i = 0; i < ghostNumber; i++) {
    let ghostX, ghostY;
    do {
      ghostX = Math.floor(Math.random() * (height - 2)) + 1;
      ghostY = Math.floor(Math.random() * (width - 2)) + 1;
    } while (maze[ghostX][ghostY] !== ".");

    ghosts.push({ x: ghostX, y: ghostY, direction: { x: -1, y: 0, } } as Coordinate);
    maze[ghostX][ghostY] = "G";
  }

  function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  let isTooClose = true;
  let counter = 0;
  while (isTooClose || counter > 30) {
    isTooClose = false;
    for (const ghost of ghosts) {
      if (distance(startX, startY, ghost.x, ghost.y) < minRange) {
        do {
          startX = Math.floor(Math.random() * (height - 2)) + 1;
          startY = Math.floor(Math.random() * (width - 2)) + 1;
        } while (maze[startX][startY] !== ".");
        isTooClose = true;
        break;
      }
    }
    if (counter > 20) {
      minRange /= 2;
    }
    counter++;
  }

  let pacman = { x: startX, y: startY, direction: "ArrowRight" };
  maze[startX][startY] = "P";

  const directionsPacman = [
    { direction: "ArrowUp", dx: -1, dy: 0 },
    { direction: "ArrowDown", dx: 1, dy: 0 },
    { direction: "ArrowLeft", dx: 0, dy: -1 },
    { direction: "ArrowRight", dx: 0, dy: 1 },
  ];

  for (const { direction, dx, dy } of directionsPacman) {
    const newX = startX + dx;
    const newY = startY + dy;
    if (newX >= 0 && newX < height && newY >= 0 && newY < width && maze[newX][newY] === ".") {
      pacman.direction = direction;
      break;
    }
  }

  // Ensure connectivity
  const visited = Array.from({ length: height }, () => Array(width).fill(false));
  function floodFill(x: number, y: number) {
    if (x < 0 || x >= height || y < 0 || y >= width || maze[x][y] !== "." || visited[x][y]) return;
    visited[x][y] = true;
    floodFill(x + 1, y);
    floodFill(x - 1, y);
    floodFill(x, y + 1);
    floodFill(x, y - 1);
  }

  floodFill(startX, startY);

  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      if (maze[i][j] === "." && !visited[i][j]) {
        // Find the nearest reachable cell
        let queue: [number, number, number][] = [[i, j, 0]];
        let found = false;
        let nearestX = -1, nearestY = -1;

        const distanceMap = Array.from({ length: height }, () => Array(width).fill(Infinity));
        distanceMap[i][j] = 0;

        while (queue.length > 0 && !found) {
          const [x, y, d] = queue.shift()!;
          for (const { dx, dy } of directionsPacman) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < height && ny >= 0 && ny < width) {
              if (maze[nx][ny] === "." && visited[nx][ny]) {
                nearestX = nx;
                nearestY = ny;
                found = true;
                break;
              }
              if (maze[nx][ny] === "." && distanceMap[nx][ny] === Infinity) {
                queue.push([nx, ny, d + 1]);
                distanceMap[nx][ny] = d + 1;
              }
            }
          }
        }

        // Carve a path between the unreachable cell and the nearest reachable cell
        if (found) {
          let [cx, cy] = [i, j];
          while (cx !== nearestX || cy !== nearestY) {
            maze[cx][cy] = ".";
            visited[cx][cy] = true;
            let minDist = Infinity;
            let nextX = cx, nextY = cy;
            for (const { dx, dy } of directionsPacman) {
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < height && ny >= 0 && ny < width && distanceMap[nx][ny] < minDist) {
                minDist = distanceMap[nx][ny];
                nextX = nx;
                nextY = ny;
              }
            }
            cx = nextX;
            cy = nextY;
          }
        }
      }
    }
  }

  return { maze, pacman, ghosts };
}

