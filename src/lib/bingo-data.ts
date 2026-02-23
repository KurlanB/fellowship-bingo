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
  { id: 3, text: "Is currently in their 3rd year" },
  { id: 4, text: "Plays a musical instrument" },
  { id: 5, text: "Has run a marathon" },
  { id: 6, text: "Born in a different province" },
  { id: 7, text: "Has visited Japan" },
  { id: 8, text: "Is currently in their 2nd year" },
  { id: 9, text: "Has met a world leader" },
  { id: 10, text: "Loves hiking or outdoor adventures" },
  { id: 11, text: "Has started a nonprofit or social enterprise" },
  { id: 12, text: "Is a first-generation university student" },
  { id: 13, text: "FREE SPACE" },
  { id: 14, text: "Is in the Engineering faculty" },
  { id: 15, text: "Has a 12.0 CGPA" },
  { id: 16, text: "Has changed your major" },
  { id: 17, text: "Reads more than 20 books a year" },
  { id: 18, text: "Has lived in Hamilton before" },
  { id: 19, text: "Has a pet they adore" },
  { id: 20, text: "Is in the Science faculty" },
  { id: 21, text: "Wants to go to South America" },
  { id: 22, text: "Checked email 20+ times in one day" },
  { id: 23, text: "Has a unique collection or hobby" },
  { id: 24, text: "Loves board games" },
  { id: 25, text: "Has practiced in the mirror for the interview" },
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
