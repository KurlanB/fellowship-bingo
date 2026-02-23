import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AVAILABLE_YEARS } from "@/lib/bingo-data";
import logo from "@/assets/mcm-logo.png";

interface Props {
  onStart: (year: number) => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [started, setStarted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  function goToYears() {
    setTransitioning(true);
    setTimeout(() => {
      setStarted(true);
      setTransitioning(false);
    }, 200);
  }

  if (!started) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-background">
        <div className={`max-w-sm w-full text-center space-y-10 animate-fade-in ${transitioning ? "opacity-0 transition-opacity duration-200" : ""}`}>
          <img src={logo} alt="McCall MacBain Foundation" className="mx-auto h-20 object-contain" />
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight leading-tight">
              Fellowship<br />Bingo
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-2">
              Connect with your fellow McMaster scholars. Find people who match each square — write their name and complete your board!
            </p>
          </div>
          <Button
            size="lg"
            className="w-full text-lg h-14 font-semibold rounded-xl"
            onClick={goToYears}
          >
            Let's Go!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-background">
      <div className={`max-w-sm w-full space-y-8 transition-all duration-200 ${transitioning ? "opacity-0 translate-y-3" : "animate-fade-in"}`}>
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-foreground">Select your year</h2>
          <p className="text-muted-foreground">Each year has a unique bingo board.</p>
        </div>
        <div className="grid gap-3">
          {AVAILABLE_YEARS.map((y, idx) => (
            <button
              key={y}
              onClick={() => onStart(y)}
              style={{ animationDelay: `${idx * 80}ms` }}
              className="h-16 rounded-xl border-2 text-xl font-bold transition-all duration-200 border-border bg-card text-foreground hover:border-primary/50 active:scale-95 animate-fade-in-up"
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
