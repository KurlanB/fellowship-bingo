import { useState } from "react";
import { GameState, BOARDS, checkBingo, BINGO_LINES } from "@/lib/bingo-data";
import { saveGameState, addLeaderboardEntry, clearGameState, getLeaderboard } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logo from "@/assets/mcm-logo.png";
import { Trophy, RotateCcw, Award } from "lucide-react";

interface Props {
  initialState: GameState;
  onReset: () => void;
}

export default function BingoBoard({ initialState, onReset }: Props) {
  const [game, setGame] = useState<GameState>(initialState);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [inputName, setInputName] = useState("");
  const [showWinner, setShowWinner] = useState(game.completed);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const criteria = BOARDS[game.year] || [];
  const winningLine = BINGO_LINES.find(line => line.every(i => game.cells[i].filled));

  function handleCellClick(index: number) {
    if (game.completed) return;
    if (game.cells[index].filled && criteria[index].text === "FREE SPACE") return;
    setSelectedCell(index);
    setInputName(game.cells[index].name);
  }

  function handleSaveName() {
    if (selectedCell === null) return;
    const newCells = [...game.cells];
    const trimmed = inputName.trim();
    newCells[selectedCell] = { ...newCells[selectedCell], name: trimmed, filled: trimmed.length > 0 };

    const isBingo = checkBingo(newCells);
    const now = Date.now();
    const newGame: GameState = { ...game, cells: newCells, completed: isBingo, completedAt: isBingo ? now : game.completedAt };

    setGame(newGame);
    saveGameState(newGame);
    setSelectedCell(null);
    setInputName("");

    if (isBingo && !game.completed) {
      addLeaderboardEntry({ playerName: game.playerName, year: game.year, cohort: game.cohort, completedAt: now, duration: now - game.startedAt });
      setShowWinner(true);
    }
  }

  function handleClearCell() {
    if (selectedCell === null) return;
    const newCells = [...game.cells];
    newCells[selectedCell] = { ...newCells[selectedCell], name: "", filled: false };
    const newGame: GameState = { ...game, cells: newCells, completed: false, completedAt: null };
    setGame(newGame);
    saveGameState(newGame);
    setSelectedCell(null);
    setInputName("");
  }

  function handleNewGame() {
    clearGameState();
    onReset();
  }

  const leaderboard = getLeaderboard(game.year, game.cohort);
  const filledCount = game.cells.filter(c => c.filled).length;

  return (
    <div className="min-h-[100dvh] bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-3 py-2.5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="McCall MacBain" className="h-7 object-contain" />
            <div className="leading-tight">
              <p className="font-semibold text-sm text-foreground">{game.playerName}</p>
              <p className="text-[11px] text-muted-foreground">{game.year} · {game.cohort}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setShowLeaderboard(true)}>
              <Trophy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNewGame}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-3 mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{filledCount}/25 filled</span>
          {game.completed && <span className="text-primary font-semibold flex items-center gap-1"><Award className="h-3.5 w-3.5" /> BINGO!</span>}
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(filledCount / 25) * 100}%` }} />
        </div>
      </div>

      {/* Board */}
      <div className="max-w-lg mx-auto px-1.5 mt-3">
        <div className="grid grid-cols-5 gap-[3px] sm:gap-1.5">
          {game.cells.map((cell, i) => {
            const isWinningCell = winningLine?.includes(i);
            const isFreeSpace = criteria[i]?.text === "FREE SPACE";
            return (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                className={`
                  aspect-square rounded-md sm:rounded-lg border-2 p-0.5 sm:p-1 flex flex-col items-center justify-center text-center transition-all duration-200 overflow-hidden
                  ${cell.filled
                    ? isWinningCell
                      ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                      : "bg-primary/15 border-primary/40 text-foreground"
                    : "bg-card border-border active:scale-95 text-foreground"
                  }
                  ${isFreeSpace ? "bg-accent/30 border-accent" : ""}
                `}
              >
                <span className="text-[8px] sm:text-[10px] leading-tight font-medium line-clamp-3 px-0.5">
                  {criteria[i]?.text}
                </span>
                {cell.filled && cell.name && !isFreeSpace && (
                  <span className={`text-[7px] sm:text-[9px] mt-0.5 font-bold truncate w-full px-0.5 ${isWinningCell ? "text-primary-foreground/90" : "text-primary"}`}>
                    {cell.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cell Edit Dialog */}
      <Dialog open={selectedCell !== null} onOpenChange={(open) => { if (!open) setSelectedCell(null); }}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">{selectedCell !== null ? criteria[selectedCell]?.text : ""}</DialogTitle>
            <DialogDescription>Enter the name of someone who matches.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              placeholder="Person's name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="h-12 text-base rounded-xl"
              autoFocus
            />
            <div className="flex gap-2">
              <Button className="flex-1 h-12 rounded-xl" onClick={handleSaveName}>Save</Button>
              {selectedCell !== null && game.cells[selectedCell].filled && (
                <Button variant="outline" className="h-12 rounded-xl" onClick={handleClearCell}>Clear</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Winner Dialog */}
      <Dialog open={showWinner} onOpenChange={setShowWinner}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl text-primary">🎉 BINGO!</DialogTitle>
            <DialogDescription className="text-base">
              Congratulations, <strong>{game.playerName}</strong>! You completed your board!
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <p className="text-muted-foreground text-sm">
              Time: {game.completedAt && game.startedAt ? formatDuration(game.completedAt - game.startedAt) : "—"}
            </p>
          </div>
          <Button className="rounded-xl h-12" onClick={() => setShowWinner(false)}>View Board</Button>
        </DialogContent>
      </Dialog>

      {/* Leaderboard Dialog */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" /> Leaderboard
            </DialogTitle>
            <DialogDescription>{game.year} · {game.cohort} Cohort</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {leaderboard.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No completions yet. Be the first!</p>
            ) : (
              leaderboard.slice(0, 10).map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-lg ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>#{i + 1}</span>
                    <span className="font-medium text-foreground">{entry.playerName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDuration(entry.duration)}</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}
