import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVAILABLE_YEARS } from "@/lib/bingo-data";
import logo from "@/assets/mcm-logo.png";
import { ArrowLeft } from "lucide-react";

interface Props {
  onStart: (name: string, year: number) => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [step, setStep] = useState<"welcome" | "name" | "year">("welcome");
  const [name, setName] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const stepNumber = step === "name" ? 1 : step === "year" ? 2 : 0;

  function goTo(next: "welcome" | "name" | "year") {
    setTransitioning(true);
    setTimeout(() => {
      setStep(next);
      setTransitioning(false);
    }, 200);
  }

  if (step === "welcome") {
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
            onClick={() => goTo("name")}
          >
            Let's Go!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (step === "name") goTo("welcome");
            else if (step === "year") goTo("name");
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1.5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s <= stepNumber ? "w-8 bg-primary" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div
          key={step}
          className={`max-w-sm w-full space-y-8 transition-all duration-200 ${
            transitioning ? "opacity-0 translate-y-3" : "animate-fade-in"
          }`}
        >
          {step === "name" && (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold text-foreground">What's your name?</h2>
                <p className="text-muted-foreground">So others know who found them!</p>
              </div>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && goTo("year")}
                className="text-lg h-14 rounded-xl text-center"
                autoFocus
              />
              <Button
                size="lg"
                className="w-full text-lg h-14 font-semibold rounded-xl"
                disabled={!name.trim()}
                onClick={() => goTo("year")}
              >
                Next
              </Button>
            </>
          )}

          {step === "year" && (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold text-foreground">Select your year</h2>
                <p className="text-muted-foreground">Each year has a unique bingo board.</p>
              </div>
              <div className="grid gap-3">
                {AVAILABLE_YEARS.map((y, idx) => (
                  <button
                    key={y}
                    onClick={() => onStart(name.trim(), y)}
                    style={{ animationDelay: `${idx * 80}ms` }}
                    className="h-16 rounded-xl border-2 text-xl font-bold transition-all duration-200 border-border bg-card text-foreground hover:border-primary/50 active:scale-95 animate-fade-in-up"
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
