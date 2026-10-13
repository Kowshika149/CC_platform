import type { ProjectPricing } from '../types';
import { calculatePaymentAmounts, formatPaymentAmount } from './pricing';

export interface EscrowSummary {
  total: number;
  amountPaid: number;
  remaining: number;
  advanceAmount: number;
  finalAmount: number;
  advancePercent: number;
  finalPercent: number;
  escrowHeld: number;
  escrowReleased: number;
  isSplit: boolean;
  isFullyPaid: boolean;
  isReleased: boolean;
  customerLabel: string;
  creatorLabel: string;
  shortLabel: string;
}

const COMPLETED_STATUSES = new Set(['completed', 'final_delivered']);

export function getEscrowSummary(
  pricing: ProjectPricing,
  projectStatus?: string,
): EscrowSummary {
  const isSplit = pricing.paymentPlan === 'split_30_70';
  const { payNow, payLater } = calculatePaymentAmounts(pricing.projectTotal, pricing.paymentPlan);
  const amountPaid = pricing.amountPaid;
  const remaining = pricing.remainingAmount;
  const isFullyPaid = remaining === 0 && amountPaid > 0;
  const isReleased = COMPLETED_STATUSES.has(projectStatus || '') && isFullyPaid;

  const advancePercent = isSplit ? 30 : 100;
  const finalPercent = isSplit ? 70 : 0;

  let escrowHeld = 0;
  let escrowReleased = 0;

  if (isReleased) {
    escrowReleased = pricing.projectTotal;
  } else if (isSplit) {
    escrowHeld = remaining;
  } else if (isFullyPaid) {
    escrowHeld = pricing.projectTotal;
  } else {
    escrowHeld = remaining;
  }

  let customerLabel = '';
  let creatorLabel = '';
  let shortLabel = '';

  if (isReleased) {
    customerLabel = `${formatPaymentAmount(pricing.projectTotal)} released to the creator`;
    creatorLabel = `${formatPaymentAmount(pricing.projectTotal)} received`;
    shortLabel = 'Payment released';
  } else if (remaining > 0) {
    customerLabel = `${formatPaymentAmount(remaining)} remaining to be paid`;
    creatorLabel = `${formatPaymentAmount(amountPaid)} held securely by platform`;
    shortLabel = `${formatPaymentAmount(remaining)} pending`;
  } else if (isFullyPaid) {
    customerLabel = 'Full amount paid · held securely until delivery is confirmed';
    creatorLabel = `${formatPaymentAmount(pricing.projectTotal)} held securely by platform`;
    shortLabel = 'Held securely';
  } else {
    customerLabel = `${formatPaymentAmount(pricing.projectTotal)} due`;
    shortLabel = 'Payment pending';
  }

  return {
    total: pricing.projectTotal,
    amountPaid,
    remaining,
    advanceAmount: payNow,
    finalAmount: payLater,
    advancePercent,
    finalPercent,
    escrowHeld,
    escrowReleased,
    isSplit,
    isFullyPaid,
    isReleased,
    customerLabel,
    creatorLabel,
    shortLabel,
  };
}
