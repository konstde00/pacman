import { Maze, Coordinate } from "types/global.types";

export const useMoveGenerator = (maze: Maze) => {
  const getRandomMove = (x: number, y: number, direction: { x: number; y: number; }): Coordinate => {
    // Check if the current direction is possible
    const newX = x + direction.x;
    const newY = y + direction.y;
    if (
      newX >= 0 &&
      newY >= 0 &&
      newX < maze.length &&
      newY < maze[0].length &&
      maze[newX][newY] !== "#"
    ) {
      return { x: newX, y: newY, direction, }; // Continue in the current direction
    }

    // If the current direction is blocked, pick a new random direction
    const possibleMoves: Coordinate[] = [];
    if (maze[x - 1][y] !== "#") possibleMoves.push({ x: -1, y: 0 }); // up
    if (maze[x + 1][y] !== "#") possibleMoves.push({ x: 1, y: 0 });  // down
    if (maze[x][y - 1] !== "#") possibleMoves.push({ x: 0, y: -1 }); // left
    if (maze[x][y + 1] !== "#") possibleMoves.push({ x: 0, y: 1 });  // right

    if (possibleMoves.length === 0) return { x, y }; // No possible moves, stay in place

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return { x: x + possibleMoves[randomIndex].x, y: y + possibleMoves[randomIndex].y, direction: possibleMoves[randomIndex] };
  };

  const bfs = (start: { x: number; y: number; path: Coordinate[] }, target: Coordinate | null, isFoodSearch = false): Coordinate => {
    const queue: { x: number; y: number; path: Coordinate[] }[] = [start];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    const directions: Coordinate[] = [
      { x: -1, y: 0 }, // up
      { x: 1, y: 0 },  // down
      { x: 0, y: -1 }, // left
      { x: 0, y: 1 },  // right
    ];

    while (queue.length > 0) {
      const { x, y, path } = queue.shift()!;

      if (!isFoodSearch && target && x === target.x && y === target.y) {
        return path.length > 0 ? path[0] : { x, y }; // Return the first step towards the target
      }

      if (isFoodSearch && maze[x][y] === ".") {
        return path.length > 0 ? path[0] : { x, y };
      }

      for (const dir of directions) {
        const newX = x + dir.x;
        const newY = y + dir.y;
        if (
          newX >= 0 &&
          newY >= 0 &&
          newX < maze.length &&
          newY < maze[0].length &&
          maze[newX][newY] !== "#" &&
          !visited.has(`${newX},${newY}`)
        ) {
          visited.add(`${newX},${newY}`);
          queue.push({ x: newX, y: newY, path: [...path, { x: newX, y: newY }] });
        }
      }
    }
    return { x: start.x, y: start.y };
  };

  const getMoveToPacMan = (ghostX: number, ghostY: number, pacmanX: number, pacmanY: number): Coordinate => {
    return bfs({ x: ghostX, y: ghostY, path: [] }, { x: pacmanX, y: pacmanY });
  };

  return { getRandomMove, getMoveToPacMan };
};
