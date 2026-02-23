import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVAILABLE_YEARS, COHORTS, Cohort } from "@/lib/bingo-data";
import logo from "@/assets/mcm-logo.png";
import { ArrowLeft, Sun, CloudSun } from "lucide-react";

interface Props {
  onStart: (name: string, year: number, cohort: Cohort) => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [step, setStep] = useState<"welcome" | "name" | "year" | "cohort">("welcome");
  const [name, setName] = useState("");
  const [year, setYear] = useState<number>(AVAILABLE_YEARS[0]);
  const [cohort, setCohort] = useState<Cohort>("Morning");

  const stepNumber = step === "name" ? 1 : step === "year" ? 2 : step === "cohort" ? 3 : 0;

  if (step === "welcome") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-background">
        <div className="max-w-sm w-full text-center space-y-10">
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
            onClick={() => setStep("name")}
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
            if (step === "name") setStep("welcome");
            else if (step === "year") setStep("name");
            else if (step === "cohort") setStep("year");
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= stepNumber ? "w-8 bg-primary" : "w-4 bg-border"
              }`}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="max-w-sm w-full space-y-8">
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
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("year")}
                className="text-lg h-14 rounded-xl text-center"
                autoFocus
              />
              <Button
                size="lg"
                className="w-full text-lg h-14 font-semibold rounded-xl"
                disabled={!name.trim()}
                onClick={() => setStep("year")}
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
                {AVAILABLE_YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => { setYear(y); setStep("cohort"); }}
                    className={`
                      h-16 rounded-xl border-2 text-xl font-bold transition-all duration-200
                      ${year === y
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                      }
                    `}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "cohort" && (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold text-foreground">Pick your cohort</h2>
                <p className="text-muted-foreground">You'll compete on a separate leaderboard.</p>
              </div>
              <div className="grid gap-4">
                {COHORTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCohort(c); onStart(name.trim(), year, c); }}
                    className="h-24 rounded-2xl border-2 border-border bg-card text-foreground hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col items-center justify-center gap-1"
                  >
                    {c === "Morning" ? <Sun className="h-7 w-7 text-accent" /> : <CloudSun className="h-7 w-7 text-primary" />}
                    <span className="text-xl font-bold">{c}</span>
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
