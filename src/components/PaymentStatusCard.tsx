import type { EscrowSummary } from '../utils/escrow';
import { formatPaymentAmount } from '../utils/pricing';
import { Shield } from 'lucide-react';

interface PaymentStatusCardProps {
  escrow: EscrowSummary;
  role: 'seeker' | 'creator';
}

export function PaymentStatusCard({ escrow, role }: PaymentStatusCardProps) {
  const isSeeker = role === 'seeker';

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-3">
        <Shield className="h-3.5 w-3.5" />
        Payment held securely
      </div>
      {isSeeker ? (
        <div className="space-y-2 text-sm">
          {escrow.amountPaid > 0 && (
            <p>
              <span className="text-surface-500">You paid: </span>
              <span className="font-semibold text-surface-900">{formatPaymentAmount(escrow.amountPaid)}</span>
            </p>
          )}
          {escrow.remaining > 0 ? (
            <p>
              <span className="text-surface-500">Remaining to pay: </span>
              <span className="font-semibold text-amber-700">{formatPaymentAmount(escrow.remaining)}</span>
            </p>
          ) : escrow.isFullyPaid && !escrow.isReleased ? (
            <p className="text-surface-600">Full amount paid · held securely until delivery is confirmed</p>
          ) : escrow.isReleased ? (
            <p className="text-emerald-700 font-medium">Payment released to creator</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {escrow.amountPaid > 0 && (
            <p>
              <span className="text-surface-500">Held by platform: </span>
              <span className="font-semibold text-surface-900">{formatPaymentAmount(escrow.amountPaid)}</span>
            </p>
          )}
          {escrow.remaining > 0 && (
            <p>
              <span className="text-surface-500">Pending after delivery: </span>
              <span className="font-semibold text-amber-700">{formatPaymentAmount(escrow.remaining)}</span>
            </p>
          )}
          {escrow.isReleased && (
            <p className="text-emerald-700 font-medium">
              {formatPaymentAmount(escrow.escrowReleased)} released to you
            </p>
          )}
        </div>
      )}
    </div>
  );
}
