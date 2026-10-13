import { Star } from 'lucide-react';

interface StarRatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRating({ label, value, onChange, max = 5 }: StarRatingProps) {
  return (
    <div className={`flex items-center ${label ? 'justify-between' : 'justify-center'} gap-4`}>
      {label && <span className="text-sm font-medium text-surface-700 w-28">{label}</span>}
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 transition hover:scale-110"
            aria-label={`${star} star`}
          >
            <Star
              className={`${label ? 'h-6 w-6' : 'h-8 w-8'} ${
                star <= value ? 'fill-amber-400 text-amber-400' : 'text-surface-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs text-surface-500 ml-2 w-8">{value}/{max}</span>
      </div>
    </div>
  );
}

interface StarDisplayProps {
  value: number;
  max?: number;
  size?: 'sm' | 'lg';
}

export function StarDisplay({ value, max = 5, size = 'lg' }: StarDisplayProps) {
  const iconSize = size === 'lg' ? 'h-8 w-8' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          className={`${iconSize} ${
            star <= value ? 'fill-amber-400 text-amber-400' : 'text-surface-300'
          }`}
        />
      ))}
    </div>
  );
}
