import { Minus, Plus } from 'lucide-react';
import type { ContentServiceId } from '../types';
import { QUANTITY_LABELS } from '../types';

interface QuantitySelectorProps {
  serviceId: ContentServiceId;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function QuantitySelector({ serviceId, value, onChange, min = 1 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-surface-600">{QUANTITY_LABELS[serviceId]}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-8 w-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-50 disabled:opacity-40"
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-8 w-8 rounded-lg border border-surface-200 flex items-center justify-center hover:bg-surface-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
