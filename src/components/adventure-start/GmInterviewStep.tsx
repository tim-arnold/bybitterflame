const STYLE_OPTIONS = [
  "Steel and muscle — I hit first",
  "Cunning and shadows — I bide my time and strike true",
  "Power — ancient knowledge sees me through",
] as const;

const UNDERWAYS_OPTIONS = [
  "Treasure waiting to be claimed — I go where others won't",
  "Ancient things deserve caution — I watch before I touch",
  "Old or new, it's all just obstacles",
] as const;

const MOTIVATION_OPTIONS = [
  "The coin",
  "The thrill",
  "A debt to repay",
  "Someone I'm searching for",
  "To see what's at the end of the road",
] as const;

interface GmInterviewStepProps {
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isCreating: boolean;
  allAnswered: boolean;
  onBegin: () => void;
  onBack: () => void;
}

function OptionButton({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        selected
          ? "border-[var(--color-gold-dim)] bg-stone-800 text-[var(--color-gold)]"
          : "border-stone-700 bg-stone-800 text-stone-300 hover:border-stone-500 hover:text-stone-100"
      }`}
    >
      {label}
    </button>
  );
}

export function GmInterviewStep({
  answers,
  setAnswers,
  isCreating,
  allAnswered,
  onBegin,
  onBack,
}: GmInterviewStepProps) {
  return (
    <div className="animate-content-in rounded-lg border border-stone-800 bg-stone-950/90 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-stone-100">A Few Quick Questions</h2>
        <button
          onClick={onBack}
          className="text-sm text-stone-400 hover:text-stone-200 transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Q1: Combat style */}
        <div>
          <p className="text-sm font-semibold text-stone-200 mb-3">
            When trouble finds you, what&apos;s your first instinct?
          </p>
          <div className="grid grid-cols-1 gap-2">
            {STYLE_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answers.style === opt}
                disabled={isCreating}
                onClick={() => setAnswers((prev) => ({ ...prev, style: opt }))}
              />
            ))}
          </div>
        </div>

        {/* Q2: Relationship to the Underways */}
        <div>
          <p className="text-sm font-semibold text-stone-200 mb-3">
            How do you feel about the old ruins — the Underways and what&apos;s buried in them?
          </p>
          <div className="grid grid-cols-1 gap-2">
            {UNDERWAYS_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answers.underways === opt}
                disabled={isCreating}
                onClick={() => setAnswers((prev) => ({ ...prev, underways: opt }))}
              />
            ))}
          </div>
        </div>

        {/* Q3: Motivation */}
        <div>
          <p className="text-sm font-semibold text-stone-200 mb-3">
            What brought you to this line of work?
          </p>
          <div className="grid grid-cols-1 gap-2">
            {MOTIVATION_OPTIONS.map((opt) => (
              <OptionButton
                key={opt}
                label={opt}
                selected={answers.motivation === opt}
                disabled={isCreating}
                onClick={() => setAnswers((prev) => ({ ...prev, motivation: opt }))}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onBegin}
          disabled={!allAnswered || isCreating}
          className="w-full rounded-lg border border-[var(--color-gold-dim)] bg-stone-800 px-4 py-2.5 text-sm font-semibold text-[var(--color-gold)] transition-colors hover:border-[var(--color-gold)] hover:bg-stone-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isCreating ? "Preparing…" : "Begin Adventure →"}
        </button>
      </div>
    </div>
  );
}

export function isAllAnswered(answers: Record<string, string>): boolean {
  return !!answers.style && !!answers.underways && !!answers.motivation;
}
