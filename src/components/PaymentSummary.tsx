import { formatPaymentAmount, getRemainingAmount, calculatePaymentAmounts } from '../utils/pricing';
import { Shield } from 'lucide-react';

interface PaymentSummaryProps {
  totalAmount: number;
  amountPaid: number;
  paymentOption?: 'full' | 'split_30_70';
  compact?: boolean;
  showProtected?: boolean;
  showStatus?: boolean;
}

export function PaymentSummary({
  totalAmount,
  amountPaid,
  paymentOption = 'full',
  compact = false,
  showProtected = true,
  showStatus = true,
}: PaymentSummaryProps) {
  const remaining = getRemainingAmount(totalAmount, amountPaid);
  const isFullyPaid = remaining === 0 && amountPaid > 0;
  const { payLater } = calculatePaymentAmounts(totalAmount, paymentOption);

  return (
    <div className={compact ? 'space-y-2' : 'payment-panel'}>
      {!compact && showProtected && (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-4">
          <Shield className="h-3.5 w-3.5" />
          Protected Payment — Secure Hold
        </div>
      )}
      <div className="space-y-0">
        <div className="payment-row">
          <span className="payment-row-label">Total Project Amount</span>
          <span className="payment-row-value">{formatPaymentAmount(totalAmount)}</span>
        </div>
        <div className="payment-row">
          <span className="payment-row-label">Amount Paid</span>
          <span className="payment-row-value text-emerald-600">{formatPaymentAmount(amountPaid)}</span>
        </div>
        <div className="payment-row">
          <span className="payment-row-label">Remaining Amount</span>
          <span className={`payment-row-value ${isFullyPaid ? 'text-surface-500' : 'text-amber-600'}`}>
            {formatPaymentAmount(remaining)}
          </span>
        </div>
        {paymentOption === 'split_30_70' && remaining > 0 && (
          <div className="payment-row">
            <span className="payment-row-label">Due After Delivery</span>
            <span className="payment-row-value">{formatPaymentAmount(payLater)}</span>
          </div>
        )}
        {paymentOption && (
          <div className="payment-row">
            <span className="payment-row-label">Payment Type</span>
            <span className="payment-row-value text-sm">
              {paymentOption === 'full' ? 'Full Payment' : '30% Booking + 70% After Delivery'}
            </span>
          </div>
        )}
      </div>
      {showStatus && amountPaid > 0 && (
        <div className="mt-3 rounded-xl px-3 py-2.5 text-xs bg-amber-50 text-amber-900 border border-amber-100">
          <p className="font-medium">Payment Status</p>
          <p className="mt-0.5">
            Paid {formatPaymentAmount(amountPaid)}
            {remaining > 0 ? ` · Remaining ${formatPaymentAmount(remaining)}` : ' · Fully paid'}
          </p>
        </div>
      )}
    </div>
  );
}
