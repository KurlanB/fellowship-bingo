import { useState, useEffect, useCallback } from "react";
import { GameState, BOARDS, checkBingo, BINGO_LINES } from "@/lib/bingo-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logo from "@/assets/mcm-logo.png";
import { Trophy, RotateCcw, Award, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase, saveGameToLocal, getDeviceId } from "@/lib/supabase";
import { toast } from "sonner";

interface LeaderboardPlayer {
  id: string;
  player_name: string;
  completed_at: string;
}

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Create or get player record on mount
  useEffect(() => {
    if (!supabase) {
      saveGameToLocal(initialState);
      if (initialState.completed) setShowWinner(true);
      return;
    }

    const initPlayer = async () => {
      const deviceId = getDeviceId();
      
      // Check if player already exists
      const { data: existing } = await supabase
        .from("players")
        .select("id")
        .eq("device_id", deviceId)
        .eq("year", initialState.year)
        .eq("cohort", initialState.cohort)
        .single();

      if (existing) {
        setPlayerId(existing.id);
      } else {
        // Create new player
        const { data: newPlayer } = await supabase
          .from("players")
          .insert({
            device_id: deviceId,
            player_name: initialState.playerName,
            year: initialState.year,
            cohort: initialState.cohort,
            cells: initialState.cells,
            completed: initialState.completed,
            completed_at: initialState.completed ? new Date().toISOString() : null,
          })
          .select("id")
          .single();
        
        if (newPlayer) setPlayerId(newPlayer.id);
      }

      saveGameToLocal(initialState);
      if (initialState.completed) setShowWinner(true);
    };

    initPlayer();
  }, []);

  // Update database when board changes
  const updateBoard = useCallback(async (gameState: GameState) => {
    saveGameToLocal(gameState);

    if (!supabase || !playerId) return;

    await supabase
      .from("players")
      .update({
        cells: gameState.cells,
        completed: gameState.completed,
        completed_at: gameState.completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", playerId);
  }, [playerId]);

  // Load leaderboard function
  const loadLeaderboard = useCallback(async () => {
    if (!supabase) return;
    
    const { data } = await supabase
      .from("players")
      .select("id, player_name, completed_at")
      .eq("year", game.year)
      .eq("cohort", game.cohort)
      .eq("completed", true)
      .order("completed_at", { ascending: true });

    if (data) setLeaderboard(data);
  }, [game.year, game.cohort]);

  // Load leaderboard on mount and subscribe to real-time updates
  useEffect(() => {
    if (!supabase) return;

    loadLeaderboard();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`cohort-${game.year}-${game.cohort}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `year=eq.${game.year}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const player = payload.new as any;
            if (player.cohort === game.cohort && player.completed && player.device_id !== getDeviceId()) {
              // Someone else in the cohort completed!
              toast.success(`🎉 ${player.player_name} just got BINGO!`, {
                duration: 4000,
              });
            }
            // Refresh leaderboard for any completion
            if (player.cohort === game.cohort && player.completed) {
              loadLeaderboard();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game.year, game.cohort, loadLeaderboard]);

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
    updateBoard(newGame);
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
    updateBoard(newGame);
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
          {leaderboard.length === 0 ? (
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
          ) : (
            <div className="space-y-3 animate-fade-in">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    index === 0 ? "bg-accent/10 border-accent" : "bg-card border-border"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? "bg-accent text-accent-foreground" : 
                    index === 1 ? "bg-secondary text-foreground" :
                    index === 2 ? "bg-orange-500/20 text-orange-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{player.player_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.completed_at && new Date(player.completed_at).toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                  </div>
                  {index === 0 && <Trophy className="h-5 w-5 text-accent" />}
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl mt-4" onClick={() => switchView("board")}>
                Back to Board
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── BOARD VIEW ──
  return (
    <div className={`min-h-[100dvh] bg-background pb-6 ${transitionClass}`}>
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-3 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="McCall MacBain" className="h-10 object-contain" />
            <div className="leading-tight">
              <p className="font-bold text-sm text-foreground">{game.playerName}</p>
              <p className="text-[11px] text-muted-foreground">{game.year} · {game.cohort}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => switchView("leaderboard")}>
              <Trophy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-3 mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>{filledCount}/25 filled</span>
          {game.completed && <span className="text-primary font-semibold flex items-center gap-1"><Award className="h-3.5 w-3.5" /> BINGO!</span>}
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(filledCount / 25) * 100}%` }} />
        </div>
      </div>

      {/* Board */}
      <div className="max-w-2xl mx-auto px-1 sm:px-4 mt-8 sm:mt-10">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {game.cells.map((cell, i) => {
            const isWinningCell = winningLine?.includes(i);
            const isFreeSpace = criteria[i]?.text === "FREE SPACE";
            return (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                style={{ animationDelay: `${i * 25}ms` }}
                className={`
                  aspect-square rounded-lg sm:rounded-xl border-[2.5px] p-1.5 sm:p-2 flex flex-col items-center justify-center text-center transition-all duration-200 overflow-hidden animate-scale-in shadow-sm hover:shadow-md
                  ${cell.filled
                    ? isWinningCell
                      ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                      : "bg-primary/20 border-primary text-foreground"
                    : "bg-card border-border active:scale-95 text-foreground hover:border-primary/50"
                  }
                  ${isFreeSpace ? "bg-accent/40 border-accent" : ""}
                `}
              >
                <span className="text-[10px] sm:text-xs lg:text-sm leading-tight font-bold line-clamp-4 px-0.5">
                  {criteria[i]?.text}
                </span>
                {cell.filled && cell.name && !isFreeSpace && (
                  <span className={`text-[9px] sm:text-[11px] lg:text-xs mt-0.5 font-bold truncate w-full px-0.5 ${isWinningCell ? "text-primary-foreground/90" : "text-primary"}`}>
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
