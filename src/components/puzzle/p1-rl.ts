export type NodeId = string;

export type Node = {
  x: number;
  y: number;
  kind: "room" | "junction" | "deadend";
  /** Display name for rooms, matching the label painted on the map. */
  name?: string;
  neighbors: NodeId[];
};

export type Maze = {
  start: NodeId;
  goal: NodeId;
  nodes: Record<NodeId, Node>;
};

export type Memory = Record<string, { correct: number; incorrect: number }>;

/** How strongly one piece of feedback shifts Glitch's choices (e^2 ≈ 7x). */
const FEEDBACK_WEIGHT = 2;
/** Small chance of exploring a random option, so Glitch never fully stops trying things. */
const EPSILON = 0.05;

export function edgeKey(from: NodeId, to: NodeId): string {
  return `${from}->${to}`;
}

export function atGoal(id: NodeId, maze: Maze): boolean {
  return id === maze.goal;
}

export function isDeadEndNode(id: NodeId, maze: Maze): boolean {
  const node = maze.nodes[id];
  return node?.kind === "deadend";
}

/** Where Glitch can go next: every neighbor except the one it just came from (unless that's the only way). */
export function candidatesFrom(nodeId: NodeId, prev: NodeId | undefined, maze: Maze): NodeId[] {
  const node = maze.nodes[nodeId];
  if (!node) throw new Error(`Node ${nodeId} not found in maze`);
  const forward = node.neighbors.filter((n) => n !== prev);
  return forward.length > 0 ? forward : node.neighbors;
}

/** Number of steps from every node to the goal (breadth-first search). */
export function distancesToGoal(maze: Maze): Record<NodeId, number> {
  const dist: Record<NodeId, number> = { [maze.goal]: 0 };
  const queue: NodeId[] = [maze.goal];
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const n of maze.nodes[id].neighbors) {
      if (dist[n] === undefined) {
        dist[n] = dist[id] + 1;
        queue.push(n);
      }
    }
  }
  return dist;
}

/** A move is good if it takes Glitch one step closer to the goal along the shortest route. */
export function isGoodMove(from: NodeId, to: NodeId, maze: Maze, dist = distancesToGoal(maze)): boolean {
  if (isDeadEndNode(to, maze)) return false;
  return (dist[to] ?? Infinity) < (dist[from] ?? Infinity);
}

/**
 * Glitch's policy: a softmax over the feedback each move has received, plus a
 * little random exploration. One 👍 makes a move about 7x more likely; one 👎
 * makes it about 7x less likely — so the student's feedback visibly matters.
 * `exclude` lists moves the student just rejected at this spot.
 */
export function nextChoice(
  nodeId: NodeId,
  prev: NodeId | undefined,
  maze: Maze,
  memory: Memory,
  forceFailure: boolean = false,
  exclude: NodeId[] = [],
  rand: () => number = Math.random
): { next: NodeId; choiceEdge: string } {
  let candidates = candidatesFrom(nodeId, prev, maze);
  const notExcluded = candidates.filter((n) => !exclude.includes(n));
  if (notExcluded.length > 0) candidates = notExcluded;

  if (forceFailure && nodeId === maze.start) {
    const deadEndNeighbor = candidates.find((n) => isDeadEndNode(n, maze));
    if (deadEndNeighbor) {
      return { next: deadEndNeighbor, choiceEdge: edgeKey(nodeId, deadEndNeighbor) };
    }
  }

  if (candidates.length === 1) {
    const next = candidates[0];
    return { next, choiceEdge: edgeKey(nodeId, next) };
  }

  const scores = candidates.map((neighbor) => {
    const mem = memory[edgeKey(nodeId, neighbor)] || { correct: 0, incorrect: 0 };
    return FEEDBACK_WEIGHT * (mem.correct - mem.incorrect);
  });
  const expScores = scores.map((s) => Math.exp(s));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probabilities = expScores.map(
    (e) => (1 - EPSILON) * (e / sumExp) + EPSILON / candidates.length
  );

  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < candidates.length; i++) {
    cumulative += probabilities[i];
    if (r <= cumulative) {
      const next = candidates[i];
      return { next, choiceEdge: edgeKey(nodeId, next) };
    }
  }

  const next = candidates[candidates.length - 1];
  return { next, choiceEdge: edgeKey(nodeId, next) };
}

export function updateMemory(
  memory: Memory,
  edge: string,
  label: "correct" | "incorrect"
): Memory {
  const current = memory[edge] || { correct: 0, incorrect: 0 };
  return {
    ...memory,
    [edge]: {
      correct: label === "correct" ? current.correct + 1 : current.correct,
      incorrect: label === "incorrect" ? current.incorrect + 1 : current.incorrect,
    },
  };
}

/** "up", "down", "left" or "right" from one node to another, for Glitch's speech. */
export function directionTo(from: NodeId, to: NodeId, maze: Maze): "up" | "down" | "left" | "right" {
  const a = maze.nodes[from];
  const b = maze.nodes[to];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "down" : "up";
}
