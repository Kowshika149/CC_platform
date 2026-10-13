import type { ProjectRequirement, RequirementDraft, ContentServiceId } from '../types';
import { getSearchFilterItems } from './pricing';

/** Build a requirement draft from a saved project requirement. */
export function projectRequirementToDraft(
  req: ProjectRequirement,
  extras: Partial<RequirementDraft> = {},
): RequirementDraft {
  const items = req.items.filter((i) => i.quantity > 0);
  const contentTypes: ContentServiceId[] = items.map((i) => i.serviceId);

  return {
    categoryId: req.categoryId,
    categoryName: req.categoryName,
    subcategoryId: req.subcategoryId,
    subcategoryName: req.subcategoryName,
    contentTypes,
    items,
    title: req.title,
    description: req.description,
    city: req.city,
    exactLocation: req.exactLocation,
    preferredShootDate: req.preferredShootDate,
    preferredDeliveryDate: req.preferredDeliveryDate,
    budgetPreference: req.budgetPreference,
    specialRequirements: req.specialRequirements,
    ...extras,
  };
}

/** Items used for creator filtering and pricing on the find-creators page. */
export function getRequirementItems(draft: RequirementDraft) {
  const withQuantities = draft.items.filter((i) => i.quantity > 0);
  if (withQuantities.length > 0) return withQuantities;
  return getSearchFilterItems(draft);
}
