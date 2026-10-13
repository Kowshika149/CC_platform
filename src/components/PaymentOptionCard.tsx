import { Shield, Info } from 'lucide-react';
import type { PaymentOption } from '../types';
import { formatCurrency, calculatePaymentAmounts } from '../utils/pricing';

interface PaymentOptionCardProps {
  option: PaymentOption;
  total: number;
  selected: boolean;
  onSelect: () => void;
}

export function PaymentOptionCard({ option, total, selected, onSelect }: PaymentOptionCardProps) {
  const amounts = calculatePaymentAmounts(total, option);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border-2 p-5 transition ${
        selected ? 'border-brand-500 bg-brand-50' : 'border-surface-200 bg-white hover:border-brand-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
          selected ? 'border-brand-600 bg-brand-600' : 'border-surface-300'
        }`}>
          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
        <div className="flex-1">
          {option === 'full' ? (
            <>
              <h4 className="font-semibold text-surface-900">Full Payment</h4>
              <p className="text-sm text-surface-500 mt-1">Pay 100% of the project amount upfront</p>
              <div className="mt-3 p-3 rounded-xl bg-surface-50">
                <div className="flex justify-between text-sm">
                  <span>Project Total</span>
                  <span className="font-semibold">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Customer Pays</span>
                  <span className="font-bold text-brand-600">{formatCurrency(amounts.payNow)}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4 className="font-semibold text-surface-900">30% Booking Payment + 70% After Final Delivery</h4>
              <p className="text-sm text-surface-500 mt-1">Split payment across booking and delivery</p>
              <div className="mt-3 p-3 rounded-xl bg-surface-50 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Project Total</span>
                  <span className="font-semibold">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pay Now</span>
                  <span className="font-bold text-brand-600">{formatCurrency(amounts.payNow)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>After Final Delivery</span>
                  <span className="font-medium">{formatCurrency(amounts.payLater)}</span>
                </div>
              </div>
            </>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
            <Shield className="h-3.5 w-3.5" />
            Protected Payment
          </div>
        </div>
      </div>
    </button>
  );
}

export function ProtectedPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const steps = [
    'Customer makes the agreed payment.',
    'Payment is recorded and remains protected according to the agreed project terms.',
    'Creator completes the agreed work.',
    'Creator submits proof of work or draft.',
    'Customer can Approve, Request Revision, or Raise an Issue.',
    'Final payment is completed after final delivery.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-brand-600" />
          <h3 className="text-lg font-semibold">How Protected Payment Works</h3>
        </div>
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-surface-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex gap-2">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Payment protection shown in this prototype represents a proposed marketplace workflow. Actual payment holding, settlement and refund mechanisms require implementation through an appropriate payment partner and applicable compliance processes.
          </p>
        </div>
        <button onClick={onClose} className="btn-primary w-full mt-4">Got it</button>
      </div>
    </div>
  );
}
