import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import BingoBoard from "@/components/BingoBoard";
import { GameState, BOARDS, createInitialCells, Cohort } from "@/lib/bingo-data";

const Index = () => {
  const [game, setGame] = useState<GameState | null>(null);

  function handleStart(name: string, year: number, cohort: Cohort) {
    const criteria = BOARDS[year];
    if (!criteria) return;
    setGame({
      playerName: name,
      year,
      cohort,
      cells: createInitialCells(criteria),
      completed: false,
    });
  }

  if (!game) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return <BingoBoard initialState={game} onReset={() => setGame(null)} />;
};

export default Index;
