export interface BingoCriteria {
  id: number;
  text: string;
}

export interface BoardConfig {
  year: number;
  criteria: BingoCriteria[];
}

const CRITERIA_2026: BingoCriteria[] = [
  { id: 1, text: "Has visited more than 5 countries" },
  { id: 2, text: "Speaks 3 or more languages" },
  { id: 3, text: "Has published a research paper" },
  { id: 4, text: "Plays a musical instrument" },
  { id: 5, text: "Has run a marathon" },
  { id: 6, text: "Born in a different province" },
  { id: 7, text: "Has volunteered abroad" },
  { id: 8, text: "Can cook a traditional family recipe" },
  { id: 9, text: "Has met a world leader" },
  { id: 10, text: "Loves hiking or outdoor adventures" },
  { id: 11, text: "Has started a nonprofit or social enterprise" },
  { id: 12, text: "Is a first-generation university student" },
  { id: 13, text: "FREE SPACE" },
  { id: 14, text: "Has taught or tutored someone" },
  { id: 15, text: "Has worked in healthcare" },
  { id: 16, text: "Has a hidden artistic talent" },
  { id: 17, text: "Reads more than 20 books a year" },
  { id: 18, text: "Has lived in Hamilton before" },
  { id: 19, text: "Has a pet they adore" },
  { id: 20, text: "Has given a TED or public talk" },
  { id: 21, text: "Passionate about climate action" },
  { id: 22, text: "Has competed in a sport at a national level" },
  { id: 23, text: "Has a unique collection or hobby" },
  { id: 24, text: "Loves board games" },
  { id: 25, text: "Has been on a podcast or radio show" },
];

export const BOARDS: Record<number, BingoCriteria[]> = {
  2026: CRITERIA_2026,
};

export const AVAILABLE_YEARS = Object.keys(BOARDS).map(Number).sort((a, b) => b - a);

export const COHORTS = ["Morning", "Afternoon"] as const;
export type Cohort = typeof COHORTS[number];

export interface CellState {
  criteriaId: number;
  name: string;
  filled: boolean;
}

export interface GameState {
  playerName: string;
  year: number;
  cohort: Cohort;
  cells: CellState[];
  completed: boolean;
}

export const BINGO_LINES = (() => {
  const lines: number[][] = [];
  // Rows
  for (let r = 0; r < 5; r++) {
    lines.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
  }
  // Columns
  for (let c = 0; c < 5; c++) {
    lines.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
  }
  // Diagonals
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
})();

export function checkBingo(cells: CellState[]): boolean {
  return BINGO_LINES.some(line => line.every(i => cells[i].filled));
}

export function createInitialCells(criteria: BingoCriteria[]): CellState[] {
  return criteria.map((c) => ({
    criteriaId: c.id,
    name: c.text === "FREE SPACE" ? "⭐" : "",
    filled: c.text === "FREE SPACE",
  }));
}
