import { formatCurrency } from '../utils/pricing';
import type { PriceBreakdown } from '../types';
import { SERVICE_LABELS } from '../types';

interface PriceBreakdownViewProps {
  breakdown: PriceBreakdown;
  showTotal?: boolean;
  className?: string;
  detailed?: boolean;
}

export function PriceBreakdownView({ breakdown, showTotal = true, className = '', detailed = false }: PriceBreakdownViewProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {detailed && <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Price Breakdown</p>}
      {breakdown.items.map((item) => (
        <div key={item.serviceId} className="flex justify-between text-sm gap-4">
          <div>
            <p className="font-medium text-surface-800">{SERVICE_LABELS[item.serviceId]}</p>
            {!item.customQuoteRequired && (
              <p className="text-xs text-surface-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
            )}
          </div>
          <span className="font-medium text-surface-900 shrink-0">
            {item.customQuoteRequired ? 'Custom Quote Required' : formatCurrency(item.total)}
          </span>
        </div>
      ))}
      {showTotal && !breakdown.hasCustomQuote && breakdown.total > 0 && (
        <div className="flex justify-between text-base font-bold border-t border-surface-200 pt-3 mt-2">
          <span>TOTAL</span>
          <span className="text-brand-600">{formatCurrency(breakdown.total)}</span>
        </div>
      )}
    </div>
  );
}
