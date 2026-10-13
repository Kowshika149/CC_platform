import { formatPaymentAmount } from '../utils/pricing';
import type { EscrowSummary } from '../utils/escrow';
import { Shield } from 'lucide-react';

interface EscrowBannerProps {
  escrow: EscrowSummary;
  tags?: string[];
  variant?: 'dark' | 'light';
}

export function EscrowBanner({ escrow, tags = [], variant = 'dark' }: EscrowBannerProps) {
  const isDark = variant === 'dark';

  return (
    <div className={`rounded-2xl p-6 mb-8 ${
      isDark
        ? 'bg-surface-900 text-white'
        : 'bg-brand-50 border border-brand-100 text-surface-900'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-2 ${
            isDark ? 'text-white/60' : 'text-brand-600'
          }`}>
            Payment Protection
          </p>
          <h2 className={`text-xl sm:text-2xl font-bold ${
            isDark ? 'text-white' : 'text-surface-900'
          }`}>
            {escrow.isReleased
              ? `${formatPaymentAmount(escrow.escrowReleased)} released to the creator`
              : escrow.isSplit && !escrow.isFullyPaid
                ? `${formatPaymentAmount(escrow.escrowHeld)} held in escrow`
                : `${formatPaymentAmount(escrow.escrowHeld || escrow.total)} held in escrow`}
          </h2>
          <p className={`text-sm mt-2 max-w-xl ${
            isDark ? 'text-white/70' : 'text-surface-600'
          }`}>
            {escrow.isReleased
              ? 'You approved the work, so the payment has been released and final files are unlocked.'
              : escrow.remaining > 0
                ? `${formatPaymentAmount(escrow.remaining)} is still pending. Your payment is held securely until delivery is approved.`
                : 'Your payment is held securely until you approve the final delivery.'}
          </p>
          {escrow.amountPaid > 0 && !escrow.isReleased && (
            <p className={`text-xs mt-3 ${isDark ? 'text-white/60' : 'text-surface-500'}`}>
              You have paid {formatPaymentAmount(escrow.amountPaid)} so far.
            </p>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 shrink-0">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isDark ? 'bg-white/10 text-white/90' : 'bg-white border border-surface-200 text-surface-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {!isDark && (
        <div className="flex items-center gap-2 mt-4 text-xs text-emerald-700">
          <Shield className="h-3.5 w-3.5" />
          Protected Payment — Secure Escrow Hold
        </div>
      )}
    </div>
  );
}

export function EscrowChip({ escrow }: { escrow: EscrowSummary }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
      escrow.isReleased
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-amber-100 text-amber-800'
    }`}>
      <Shield className="h-3 w-3" />
      {escrow.shortLabel}
    </span>
  );
}
