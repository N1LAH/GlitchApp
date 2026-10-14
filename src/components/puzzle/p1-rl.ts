export type NodeId = string;

export type Node = {
  x: number;
  y: number;
  kind: "room" | "junction" | "deadend";
  neighbors: NodeId[];
};

export type Maze = {
  start: NodeId;
  goal: NodeId;
  nodes: Record<NodeId, Node>;
};

export type Memory = Record<string, { correct: number; incorrect: number }>;

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

export function shouldStop(
  id: NodeId,
  prev: NodeId | undefined,
  maze: Maze
): boolean {
  const node = maze.nodes[id];
  if (!node) return true;

  if (node.kind === "room" || node.kind === "deadend") {
    return true;
  }

  const options = node.neighbors.filter((n) => n !== prev);
  return options.length > 1;
}

export function nextChoice(
  nodeId: NodeId,
  prev: NodeId | undefined,
  maze: Maze,
  memory: Memory,
  forceFailure: boolean = false
): { next: NodeId; choiceEdge: string } {
  const node = maze.nodes[nodeId];
  if (!node) {
    throw new Error(`Node ${nodeId} not found in maze`);
  }

  let candidates = node.neighbors;
  if (candidates.length > 1 && prev !== undefined) {
    const filtered = candidates.filter((n) => n !== prev);
    if (filtered.length > 0) {
      candidates = filtered;
    }
  }

  if (forceFailure && nodeId === maze.start) {
    const deadEndNeighbor = candidates.find((n) => maze.nodes[n]?.kind === "deadend");
    if (deadEndNeighbor) {
      return { next: deadEndNeighbor, choiceEdge: edgeKey(nodeId, deadEndNeighbor) };
    }
  }

  if (candidates.length === 1) {
    const next = candidates[0];
    return { next, choiceEdge: edgeKey(nodeId, next) };
  }

  const epsilon = 0.1;
  const THRESHOLD = 3;
  
  const scores = candidates.map((neighbor) => {
    const edge = edgeKey(nodeId, neighbor);
    const mem = memory[edge] || { correct: 0, incorrect: 0 };
    const netScore = mem.correct - mem.incorrect;
    if (netScore <= 0) return netScore;
    return netScore >= THRESHOLD ? netScore : 0;
  });

  const expScores = scores.map((s) => Math.exp(s));
  const sumExp = expScores.reduce((a, b) => a + b, 0);
  const probabilities = expScores.map((e) => (1 - epsilon) * (e / sumExp) + epsilon / candidates.length);

  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < candidates.length; i++) {
    cumulative += probabilities[i];
    if (rand <= cumulative) {
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
