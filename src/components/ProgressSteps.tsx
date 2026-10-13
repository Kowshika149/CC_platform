interface ProgressStepsProps {
  current: number;
  total: number;
  label: string;
}

export function ProgressSteps({ current, total, label }: ProgressStepsProps) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm mb-2.5">
        <span className="font-semibold text-brand-700">Step {current} of {total}</span>
        <span className="text-surface-400 font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm font-medium text-surface-600 mt-2.5">{label}</p>
    </div>
  );
}
