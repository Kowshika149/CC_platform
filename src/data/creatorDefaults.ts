import type { Creator, CreatorPackage, CreatorAvailabilityData, ContentServiceId } from '../types';

function rate(creator: Creator, serviceId: ContentServiceId, fallback: number): number {
  return creator.rates.find((r) => r.serviceId === serviceId)?.rate || fallback;
}

export function buildDefaultPackages(creator: Creator): CreatorPackage[] {
  const v = rate(creator, 'videography', 4000);
  const r = rate(creator, 'reels', 1000);
  const p = rate(creator, 'photography', 125);

  const packages: CreatorPackage[] = [];

  if (creator.services.includes('videography') || creator.services.includes('reels') || creator.services.includes('photography')) {
    packages.push({
      id: `${creator.id}-starter`,
      name: 'Starter Package',
      description: 'Perfect for small businesses and personal projects',
      items: [
        { serviceId: 'videography', quantity: 1, label: '1 Video' },
        { serviceId: 'reels', quantity: 2, label: '2 Reels' },
        { serviceId: 'photography', quantity: 10, label: '10 Photos' },
      ],
      price: Math.round(v + r * 2 + p * 10),
      deliveryDays: 7,
    });
    packages.push({
      id: `${creator.id}-social`,
      name: 'Social Media Package',
      description: 'Complete social media content bundle',
      items: [
        { serviceId: 'videography', quantity: 2, label: '2 Videos' },
        { serviceId: 'reels', quantity: 5, label: '5 Reels' },
        { serviceId: 'photography', quantity: 30, label: '30 Photos' },
      ],
      price: Math.round(v * 2 + r * 5 + p * 30),
      deliveryDays: 10,
    });
    packages.push({
      id: `${creator.id}-business`,
      name: 'Business Package',
      description: 'Comprehensive content for growing brands',
      items: [
        { serviceId: 'videography', quantity: 3, label: '3 Videos' },
        { serviceId: 'reels', quantity: 8, label: '8 Reels' },
        { serviceId: 'photography', quantity: 50, label: '50 Photos' },
      ],
      price: Math.round(v * 3 + r * 8 + p * 50),
      deliveryDays: 14,
    });
  }

  if (packages.length === 0 && creator.rates.length > 0) {
    const lowest = Math.min(...creator.rates.map((x) => x.rate));
    packages.push({
      id: `${creator.id}-basic`,
      name: 'Basic Package',
      description: 'Custom content package',
      items: [{ serviceId: creator.rates[0].serviceId, quantity: 1, label: '1 Service' }],
      price: lowest * 3,
      deliveryDays: 7,
    });
  }

  return packages;
}

export function buildDefaultAvailability(): CreatorAvailabilityData {
  const today = new Date();
  const bookedDates: string[] = [];
  const unavailableDates: string[] = [];

  for (let i = 2; i <= 20; i += 3) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    bookedDates.push(d.toISOString().split('T')[0]);
  }
  for (let i = 5; i <= 25; i += 7) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    unavailableDates.push(d.toISOString().split('T')[0]);
  }

  return { bookedDates, unavailableDates };
}

export function enrichCreatorData(creators: Omit<Creator, 'packages' | 'availabilityCalendar'>[]): Creator[] {
  return creators.map((c) => ({
    ...c,
    packages: (c as Creator).packages?.length ? (c as Creator).packages : buildDefaultPackages(c as Creator),
    availabilityCalendar: (c as Creator).availabilityCalendar || buildDefaultAvailability(),
  }));
}
