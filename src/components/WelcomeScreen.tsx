import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVAILABLE_YEARS, COHORTS, Cohort } from "@/lib/bingo-data";
import logo from "@/assets/mcm-logo.png";

interface Props {
  onStart: (name: string, year: number, cohort: Cohort) => void;
}

export default function WelcomeScreen({ onStart }: Props) {
  const [step, setStep] = useState<"welcome" | "setup">("welcome");
  const [name, setName] = useState("");
  const [year, setYear] = useState<number>(AVAILABLE_YEARS[0]);
  const [cohort, setCohort] = useState<Cohort>("Morning");

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full text-center space-y-8">
          <img src={logo} alt="McCall MacBain Foundation" className="mx-auto h-20 object-contain" />
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-primary tracking-tight">
              Fellowship Bingo
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Connect with your fellow McMaster scholars. Find people who match each square — write their name and complete your board!
            </p>
          </div>
          <Button
            size="lg"
            className="w-full text-lg py-6 font-semibold"
            onClick={() => setStep("setup")}
          >
            Let's Go!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <img src={logo} alt="McCall MacBain Foundation" className="mx-auto h-14 object-contain" />
          <h2 className="text-3xl font-bold text-primary">Set Up Your Board</h2>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Year</label>
            <div className="flex gap-2">
              {AVAILABLE_YEARS.map((y) => (
                <Button
                  key={y}
                  variant={year === y ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setYear(y)}
                >
                  {y}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Cohort</label>
            <div className="flex gap-2">
              {COHORTS.map((c) => (
                <Button
                  key={c}
                  variant={cohort === c ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setCohort(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full text-lg py-6 font-semibold"
          disabled={!name.trim()}
          onClick={() => onStart(name.trim(), year, cohort)}
        >
          Start Playing
        </Button>
      </div>
    </div>
  );
}
