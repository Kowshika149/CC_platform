import type { Creator, PriceBreakdown, RequirementItem, ContentServiceId, CreatorAvailabilityData, CreatorPackage, ServiceRate, RequirementDraft } from '../types';
import { SERVICE_LABELS, QUANTITY_LABELS, PRICING_UNIT_LABELS } from '../types';

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Always shows a valid rupee amount — use for payment displays (₹0 when zero) */
export function formatPaymentAmount(amount: number | null | undefined): string {
  const val = amount ?? 0;
  if (!Number.isFinite(val)) return '₹0';
  return `₹${Math.max(0, val).toLocaleString('en-IN')}`;
}

export function getRemainingAmount(total: number, paid: number): number {
  const t = Number.isFinite(total) ? total : 0;
  const p = Number.isFinite(paid) ? paid : 0;
  return Math.max(0, t - p);
}

export function getServiceLabel(serviceId: ContentServiceId): string {
  return SERVICE_LABELS[serviceId];
}

export function getQuantityLabel(serviceId: ContentServiceId): string {
  return QUANTITY_LABELS[serviceId];
}

/** Find a creator's rate for a service — returns null if missing or invalid */
export function getCreatorRate(creator: Creator, serviceId: ContentServiceId): ServiceRate | null {
  const rate = creator.rates.find((r) => r.serviceId === serviceId);
  if (!rate || rate.customQuoteRequired) return null;
  if (!Number.isFinite(rate.rate) || rate.rate <= 0) return null;
  return rate;
}

export function calculatePrice(creator: Creator, items: RequirementItem[]): PriceBreakdown {
  const breakdownItems: PriceBreakdown['items'] = [];
  let total = 0;
  let hasCustomQuote = false;
  const activeItems = items.filter((i) => i.quantity > 0);

  for (const item of activeItems) {
    const rate = getCreatorRate(creator, item.serviceId);
    const serviceLabel = getServiceLabel(item.serviceId);

    if (!rate) {
      hasCustomQuote = true;
      breakdownItems.push({
        serviceId: item.serviceId,
        label: serviceLabel,
        quantity: item.quantity,
        unitPrice: 0,
        total: 0,
        customQuoteRequired: true,
      });
      continue;
    }

    const lineTotal = rate.rate * item.quantity;
    total += lineTotal;

    breakdownItems.push({
      serviceId: item.serviceId,
      label: serviceLabel,
      quantity: item.quantity,
      unitPrice: rate.rate,
      total: lineTotal,
    });
  }

  // Safety: never return a zero total when items exist but some lack rates
  if (activeItems.length > 0 && total === 0) {
    hasCustomQuote = true;
  }

  return { items: breakdownItems, total, hasCustomQuote };
}

/** Lowest non-zero rate from creator's rate card */
export function getLowestRate(creator: Creator): number {
  const rates = creator.rates.filter((r) => r.rate > 0 && !r.customQuoteRequired);
  if (rates.length === 0) return 0;
  return Math.min(...rates.map((r) => r.rate));
}

export function getStartingPriceInfo(creator: Creator): { amount: number; unitLabel: string } | null {
  const rates = creator.rates.filter((r) => r.rate > 0 && !r.customQuoteRequired);
  if (rates.length === 0) {
    const pkgPrices = creator.packages.map((p) => p.price).filter((p) => p > 0);
    if (pkgPrices.length > 0) {
      return { amount: Math.min(...pkgPrices), unitLabel: 'Per Package' };
    }
    return null;
  }
  const lowest = rates.reduce((min, r) => (r.rate < min.rate ? r : min), rates[0]);
  return { amount: lowest.rate, unitLabel: PRICING_UNIT_LABELS[lowest.pricingUnit] };
}

export function getStartingPrice(creator: Creator): number {
  const info = getStartingPriceInfo(creator);
  return info?.amount ?? 0;
}

export function hasRequirements(items: RequirementItem[]): boolean {
  return items.length > 0 && items.some((i) => i.quantity > 0);
}

/** Content types selected during creator search */
export function getSearchContentTypes(draft: RequirementDraft): ContentServiceId[] {
  if (draft.contentTypes && draft.contentTypes.length > 0) return draft.contentTypes;
  return draft.items.filter((i) => i.quantity > 0).map((i) => i.serviceId);
}

export function hasSearchCriteria(draft: RequirementDraft): boolean {
  return getSearchContentTypes(draft).length > 0;
}

/** Items for creator filtering (quantity 1 per content type) */
export function getSearchFilterItems(draft: RequirementDraft): RequirementItem[] {
  return getSearchContentTypes(draft).map((serviceId) => ({ serviceId, quantity: 1 }));
}

/** Find package that best matches customer requirements */
export function findRecommendedPackage(
  creator: Creator,
  items: RequirementItem[]
): CreatorPackage | null {
  if (!items.length || !creator.packages.length) return null;

  let best: CreatorPackage | null = null;
  let bestScore = 0;

  for (const pkg of creator.packages) {
    let score = 0;
    for (const req of items) {
      const pkgItem = pkg.items.find((i) => i.serviceId === req.serviceId);
      if (pkgItem && pkgItem.quantity >= req.quantity) score += 2;
      else if (pkgItem) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = pkg;
    }
  }

  return bestScore >= items.length ? best : null;
}

export function isDateAvailable(
  calendar: CreatorAvailabilityData | undefined,
  dateStr: string
): 'available' | 'booked' | 'unavailable' | 'past' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  if (d < today) return 'past';
  if (!calendar) return 'available';
  if (calendar.bookedDates.includes(dateStr)) return 'booked';
  if (calendar.unavailableDates.includes(dateStr)) return 'unavailable';
  return 'available';
}

export function calculatePaymentAmounts(total: number, option: 'full' | 'split_30_70') {
  if (option === 'full') {
    return { payNow: total, payLater: 0, total };
  }
  const payNow = Math.round(total * 0.3);
  const payLater = total - payNow;
  return { payNow, payLater, total };
}

export function filterCreators(
  creators: Creator[],
  items: RequirementItem[],
  filters: {
    location?: string;
    category?: string;
    service?: string;
    minRating?: number;
    minExperience?: number;
    maxPrice?: number;
    verifiedOnly?: boolean;
    approvedOnly?: boolean;
    sortBy?: string;
  }
): { creator: Creator; pricing: PriceBreakdown }[] {
  let results = creators.map((creator) => ({
    creator,
    pricing: calculatePrice(creator, items),
  }));

  if (filters.approvedOnly !== false) {
    results = results.filter(({ creator }) => creator.status === 'approved');
  }

  const requiredServices = items.filter((i) => i.quantity > 0).map((i) => i.serviceId);
  if (requiredServices.length > 0) {
    results = results.filter(({ creator }) =>
      requiredServices.every((s) => creator.services.includes(s))
    );
  }

  if (filters.location) {
    results = results.filter(({ creator }) =>
      creator.city.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  // Category is a soft preference — show creators who match OR offer required services
  if (filters.category) {
    results = results.filter(({ creator }) =>
      creator.categories.includes(filters.category!) ||
      requiredServices.every((s) => creator.services.includes(s))
    );
  }

  if (filters.service) {
    results = results.filter(({ creator }) =>
      creator.services.includes(filters.service as ContentServiceId)
    );
  }

  if (filters.minRating) {
    results = results.filter(({ creator }) => creator.rating >= filters.minRating!);
  }

  if (filters.minExperience) {
    results = results.filter(({ creator }) => creator.yearsExperience >= filters.minExperience!);
  }

  if (filters.maxPrice && filters.maxPrice > 0) {
    results = results.filter(({ pricing }) => !pricing.hasCustomQuote && pricing.total <= filters.maxPrice!);
  }

  if (filters.verifiedOnly) {
    results = results.filter(({ creator }) => creator.verified && creator.status === 'approved');
  }

  switch (filters.sortBy) {
    case 'lowest_price':
      results.sort((a, b) => {
        const priceA = hasRequirements(items) ? (a.pricing.hasCustomQuote ? Infinity : a.pricing.total) : getStartingPrice(a.creator);
        const priceB = hasRequirements(items) ? (b.pricing.hasCustomQuote ? Infinity : b.pricing.total) : getStartingPrice(b.creator);
        return priceA - priceB;
      });
      break;
    case 'highest_rated':
      results.sort((a, b) => b.creator.rating - a.creator.rating);
      break;
    case 'most_experienced':
      results.sort((a, b) => b.creator.yearsExperience - a.creator.yearsExperience);
      break;
    case 'nearest':
      results.sort((a, b) => (a.creator.distanceKm ?? 99) - (b.creator.distanceKm ?? 99));
      break;
    default:
      results.sort((a, b) => {
        const scoreA = a.creator.rating * 20 - (a.pricing.hasCustomQuote ? 0 : a.pricing.total / 1000);
        const scoreB = b.creator.rating * 20 - (b.pricing.hasCustomQuote ? 0 : b.pricing.total / 1000);
        return scoreB - scoreA;
      });
  }

  return results;
}

export function getApprovedCreators(creators: Creator[]): Creator[] {
  return creators.filter((c) => c.status === 'approved');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
