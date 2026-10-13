import { DUMMY_CREATORS } from '../data/creators';
import { enrichCreatorData } from '../data/creatorDefaults';
import type { ContentServiceId, Creator, User } from '../types';
import { SERVICE_LABELS } from '../types';

const USERS_STORAGE_KEY = 'cc_users';

function readRegisteredUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]') as User[];
  } catch {
    return [];
  }
}

function defaultRates(services: ContentServiceId[]) {
  return services.map((serviceId) => ({
    serviceId,
    serviceName: SERVICE_LABELS[serviceId],
    pricingUnit: 'per_project' as const,
    rate: 3000,
  }));
}

/** Convert a registered app user into a marketplace creator profile. */
export function userToCreatorProfile(user: User): Creator {
  const services = user.services?.length ? user.services : (['videography'] as ContentServiceId[]);
  const status = user.creatorStatus || (user.onboardingComplete ? 'pending' : 'draft');

  const base: Creator = {
    id: user.id,
    userId: user.id,
    name: user.fullName,
    professionalName: user.professionalName || user.fullName,
    avatar: user.avatar || `https://i.pravatar.cc/200?u=${encodeURIComponent(user.id)}`,
    city: user.city || 'India',
    rating: status === 'approved' ? 4.5 : 0,
    reviewCount: 0,
    yearsExperience: user.yearsExperience || 1,
    verified: Boolean(user.emailVerified && status === 'approved'),
    status,
    bio: user.bio || 'Creator on CC HUB.',
    categories: user.categories || [],
    services,
    rates: user.rates?.length ? user.rates : defaultRates(services),
    paymentPreferences: user.paymentPreferences || ['full'],
    availability: status === 'approved' ? 'Available' : 'Profile under review',
    packages: user.packages || [],
    portfolio: [],
    reviews: [],
  };

  return enrichCreatorData([base])[0];
}

function getRegisteredCreators(): Creator[] {
  return readRegisteredUsers()
    .filter((user) => user.role === 'creator')
    .map(userToCreatorProfile);
}

function isSameCreator(a: Creator, b: Creator): boolean {
  if (a.id === b.id) return true;
  if (a.userId && b.userId && a.userId === b.userId) return true;
  if (a.userId === b.id || b.userId === a.id) return true;
  return false;
}

/** All marketplace creators: seeded profiles plus registered creator accounts. */
export function getAllMarketplaceCreators(): Creator[] {
  const registered = getRegisteredCreators();
  const merged = [...DUMMY_CREATORS];

  for (const creator of registered) {
    if (!merged.some((existing) => isSameCreator(existing, creator))) {
      merged.push(creator);
    }
  }

  return merged;
}

export function getMarketplaceCreatorById(id: string): Creator | undefined {
  return getAllMarketplaceCreators().find(
    (creator) => creator.id === id || creator.userId === id,
  );
}
