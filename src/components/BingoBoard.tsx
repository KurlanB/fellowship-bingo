import { useState } from "react";
import { GameState, BOARDS, checkBingo, BINGO_LINES } from "@/lib/bingo-data";
import { saveGameState, addLeaderboardEntry, clearGameState, getLeaderboard, LeaderboardEntry } from "@/lib/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import logo from "@/assets/mcm-logo.png";
import { Trophy, RotateCcw, Award, X, Clock, Medal } from "lucide-react";

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

      {/* Leaderboard Full-Screen Sheet */}
      <Sheet open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <SheetContent side="bottom" className="h-[85dvh] rounded-t-3xl px-0 pb-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="px-5 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2.5 text-xl">
                  <Trophy className="h-6 w-6 text-accent" /> Leaderboard
                </SheetTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowLeaderboard(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{game.year} · {game.cohort} Cohort</p>
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
              {leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">No winners yet</p>
                    <p className="text-muted-foreground text-sm mt-1">Be the first to complete your board!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Podium - Top 3 */}
                  {leaderboard.length > 0 && (
                    <div className="flex items-end justify-center gap-3 pt-4 pb-2">
                      {/* 2nd place */}
                      {leaderboard.length > 1 && (
                        <PodiumCard entry={leaderboard[1]} rank={2} height="h-24" />
                      )}
                      {/* 1st place */}
                      <PodiumCard entry={leaderboard[0]} rank={1} height="h-32" />
                      {/* 3rd place */}
                      {leaderboard.length > 2 && (
                        <PodiumCard entry={leaderboard[2]} rank={3} height="h-20" />
                      )}
                    </div>
                  )}

                  {/* Rest of the list */}
                  {leaderboard.length > 3 && (
                    <div className="space-y-2">
                      {leaderboard.slice(3, 20).map((entry, i) => (
                        <div
                          key={i + 3}
                          className="flex items-center gap-3 py-3 px-4 rounded-xl bg-card border border-border"
                        >
                          <span className="text-sm font-bold text-muted-foreground w-7 text-center">
                            {i + 4}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">{entry.playerName}</p>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-sm">{formatDuration(entry.duration)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PodiumCard({ entry, rank, height }: { entry: LeaderboardEntry; rank: number; height: string }) {
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div className={`flex-1 max-w-[120px] ${height} rounded-2xl border-2 flex flex-col items-center justify-end p-3 gap-1 transition-all
      ${rank === 1
        ? "border-accent bg-accent/10 shadow-lg"
        : "border-border bg-card"
      }`}
    >
      <span className="text-2xl">{medals[rank - 1]}</span>
      <p className="font-bold text-xs text-foreground truncate w-full text-center">{entry.playerName}</p>
      <div className="flex items-center gap-0.5 text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span className="text-[10px]">{formatDuration(entry.duration)}</span>
      </div>
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
