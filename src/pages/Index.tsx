import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import BingoBoard from "@/components/BingoBoard";
import { GameState, BOARDS, createInitialCells, Cohort } from "@/lib/bingo-data";
import { loadGameFromLocal, clearGameFromLocal } from "@/lib/supabase";

const Index = () => {
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved game on mount
  useEffect(() => {
    const saved = loadGameFromLocal();
    if (saved && BOARDS[saved.year]) {
      setGame({
        playerName: saved.playerName,
        year: saved.year,
        cohort: saved.cohort as Cohort,
        cells: saved.cells,
        completed: saved.completed,
      });
    }
    setLoading(false);
  }, []);

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

  function handleReset() {
    clearGameFromLocal();
    setGame(null);
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  return <BingoBoard initialState={game} onReset={handleReset} />;
};

export default Index;
