import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import BingoBoard from "@/components/BingoBoard";
import { GameState, Cohort, BOARDS, createInitialCells } from "@/lib/bingo-data";
import { loadGameState, saveGameState } from "@/lib/storage";

const Index = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) setGame(saved);
    setLoaded(true);
  }, []);

  function handleStart(name: string, year: number, cohort: Cohort) {
    const criteria = BOARDS[year];
    if (!criteria) return;
    const newGame: GameState = {
      playerName: name,
      year,
      cohort,
      cells: createInitialCells(criteria),
      completed: false,
      completedAt: null,
      startedAt: Date.now(),
    };
    saveGameState(newGame);
    setGame(newGame);
  }

  function handleReset() {
    setGame(null);
  }

  if (!loaded) return null;

  if (!game) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return <BingoBoard key={game.startedAt} initialState={game} onReset={handleReset} />;
};

export default Index;
