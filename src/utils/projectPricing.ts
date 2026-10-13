import type {
  PriceBreakdown, PaymentOption, ProjectPricing, PaymentStatus, Project,
  RequirementItem, Creator, CreatorPackage,
} from '../types';
import {
  calculatePrice, calculatePaymentAmounts, getRemainingAmount,
} from './pricing';

export function resolveBookingTotal(
  creator: Creator,
  bookingType: 'services' | 'package',
  items: RequirementItem[],
  packageId?: string
): { total: number; breakdown: PriceBreakdown; packageName?: string; valid: boolean } {
  if (bookingType === 'package' && packageId) {
    const pkg = creator.packages.find((p) => p.id === packageId);
    if (!pkg || pkg.price <= 0) {
      return { total: 0, breakdown: { items: [], total: 0, hasCustomQuote: true }, valid: false };
    }
    const breakdown: PriceBreakdown = {
      items: [{
        serviceId: pkg.items[0]?.serviceId || 'videography',
        label: pkg.name,
        quantity: 1,
        unitPrice: pkg.price,
        total: pkg.price,
      }],
      total: pkg.price,
      hasCustomQuote: false,
    };
    return { total: pkg.price, breakdown, packageName: pkg.name, valid: true };
  }

  const activeItems = items.filter((i) => i.quantity > 0);
  if (activeItems.length === 0) {
    return { total: 0, breakdown: { items: [], total: 0, hasCustomQuote: false }, valid: false };
  }

  const breakdown = calculatePrice(creator, activeItems);
  const valid = !breakdown.hasCustomQuote && breakdown.total > 0;
  return { total: breakdown.total, breakdown, valid };
}

export function buildProjectPricing(
  total: number,
  breakdown: PriceBreakdown,
  bookingType: 'services' | 'package',
  paymentPlan: PaymentOption = 'full',
  amountPaid = 0,
  selectedPackageId?: string,
  selectedPackageName?: string
): ProjectPricing {
  const { payNow, payLater } = calculatePaymentAmounts(total, paymentPlan);
  const remainingAmount = getRemainingAmount(total, amountPaid);

  let paymentStatus: PaymentStatus = 'unpaid';
  if (amountPaid > 0 && remainingAmount === 0) paymentStatus = 'fully_paid';
  else if (amountPaid > 0) paymentStatus = 'advance_paid';

  return {
    projectTotal: total,
    paymentPlan,
    advanceAmount: payNow,
    finalAmount: payLater,
    amountPaid,
    remainingAmount,
    paymentStatus,
    priceBreakdown: breakdown,
    bookingType,
    selectedPackageId,
    selectedPackageName,
  };
}

export function applyPaymentToPricing(pricing: ProjectPricing, additionalPaid: number): ProjectPricing {
  const amountPaid = pricing.amountPaid + additionalPaid;
  const remainingAmount = getRemainingAmount(pricing.projectTotal, amountPaid);
  let paymentStatus: PaymentStatus = 'unpaid';
  if (amountPaid > 0 && remainingAmount === 0) paymentStatus = 'fully_paid';
  else if (amountPaid > 0) paymentStatus = 'advance_paid';

  return {
    ...pricing,
    amountPaid,
    remainingAmount,
    paymentStatus,
  };
}

/** Ensure legacy projects have pricing object */
export function getProjectPricing(project: Project): ProjectPricing {
  if (project.pricing) return project.pricing;
  const total = project.totalAmount || 0;
  const paid = project.amountPaid || 0;
  return buildProjectPricing(
    total,
    project.priceBreakdown || { items: [], total, hasCustomQuote: false },
    'services',
    project.paymentOption || 'full',
    paid
  );
}

export function syncProjectFromPricing(project: Project, pricing: ProjectPricing): Project {
  return {
    ...project,
    pricing,
    totalAmount: pricing.projectTotal,
    amountPaid: pricing.amountPaid,
    paymentOption: pricing.paymentPlan,
    priceBreakdown: pricing.priceBreakdown,
  };
}

export function findPackage(creator: Creator, packageId?: string): CreatorPackage | undefined {
  if (!packageId) return undefined;
  return creator.packages.find((p) => p.id === packageId);
}
