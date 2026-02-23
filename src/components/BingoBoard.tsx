import { useState, useEffect } from "react";
import { GameState, BOARDS, checkBingo, BINGO_LINES } from "@/lib/bingo-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logo from "@/assets/mcm-logo.png";
import { Trophy, RotateCcw, Award, ArrowLeft, Clock } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  initialState: GameState;
  onReset: () => void;
}

function fireConfetti() {
  const colors = ["#BE1E2D", "#D4A843", "#FFFFFF"];
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors, ticks: 120, gravity: 1.2, scalar: 0.9 });
  setTimeout(() => {
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.5, x: 0.3 }, colors, ticks: 100, gravity: 1.2, scalar: 0.8 });
  }, 300);
  setTimeout(() => {
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.5, x: 0.7 }, colors, ticks: 100, gravity: 1.2, scalar: 0.8 });
  }, 500);
}

export default function BingoBoard({ initialState, onReset }: Props) {
  const [game, setGame] = useState<GameState>(initialState);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [inputName, setInputName] = useState("");
  const [showWinner, setShowWinner] = useState(false);
  const [view, setView] = useState<"board" | "leaderboard">("board");
  const [viewTransition, setViewTransition] = useState(false);

  useEffect(() => {
    if (initialState.completed) setShowWinner(true);
  }, []);

  const criteria = BOARDS[game.year] || [];
  const winningLine = BINGO_LINES.find(line => line.every(i => game.cells[i].filled));

  function switchView(to: "board" | "leaderboard") {
    setViewTransition(true);
    setTimeout(() => {
      setView(to);
      setViewTransition(false);
    }, 200);
  }

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
    const newGame: GameState = { ...game, cells: newCells, completed: isBingo };
    setGame(newGame);
    setSelectedCell(null);
    setInputName("");
    if (isBingo && !game.completed) {
      setTimeout(() => {
        fireConfetti();
        setShowWinner(true);
      }, 400);
    }
  }

  function handleClearCell() {
    if (selectedCell === null) return;
    const newCells = [...game.cells];
    newCells[selectedCell] = { ...newCells[selectedCell], name: "", filled: false };
    const newGame: GameState = { ...game, cells: newCells, completed: false };
    setGame(newGame);
    setSelectedCell(null);
    setInputName("");
  }

  const filledCount = game.cells.filter(c => c.filled).length;

  const transitionClass = viewTransition
    ? "opacity-0 translate-y-3 transition-all duration-200"
    : "animate-fade-in";

  // ── LEADERBOARD FULL PAGE ──
  if (view === "leaderboard") {
    return (
      <div className={`min-h-[100dvh] bg-background ${transitionClass}`}>
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-3 py-2.5">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => switchView("board")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" /> Leaderboard
              </h2>
              <p className="text-[11px] text-muted-foreground">{game.year} · {game.cohort}</p>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center animate-fade-in">
            <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center">
              <Trophy className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <div>
              <p className="font-bold text-foreground text-xl">No winners yet</p>
              <p className="text-muted-foreground mt-1">Be the first to complete your board!</p>
            </div>
            <Button variant="outline" className="rounded-xl" onClick={() => switchView("board")}>
              Back to Board
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── BOARD VIEW ──
  return (
    <div className={`min-h-[100dvh] bg-background pb-6 ${transitionClass}`}>
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
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => switchView("leaderboard")}>
              <Trophy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onReset}>
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
                style={{ animationDelay: `${i * 25}ms` }}
                className={`
                  aspect-square rounded-md sm:rounded-lg border-2 p-0.5 sm:p-1 flex flex-col items-center justify-center text-center transition-all duration-200 overflow-hidden animate-scale-in
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
          <Button className="rounded-xl h-12" onClick={() => setShowWinner(false)}>View Board</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
