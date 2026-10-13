import type { BookingDraft } from '../types';
import { SERVICE_LABELS, type ContentServiceId } from '../types';
import { formatDate } from '../utils/pricing';
import { Pencil } from 'lucide-react';

interface BookingRequirementSummaryProps {
  draft: BookingDraft;
  onEdit?: () => void;
}

export function BookingRequirementSummary({ draft, onEdit }: BookingRequirementSummaryProps) {
  const contentTypes = draft.contentTypes?.length
    ? draft.contentTypes
    : draft.items.filter((i) => i.quantity > 0).map((i) => i.serviceId);

  if (!draft.categoryName && contentTypes.length === 0) return null;

  return (
    <div className="card-elevated mb-6 bg-surface-50 border-surface-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Your Requirement</p>
        {onEdit && (
          <button type="button" onClick={onEdit} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>
      {draft.categoryName && (
        <div className="mb-2">
          <p className="font-semibold">{draft.categoryName}</p>
          {draft.subcategoryName && <p className="text-sm text-surface-500">{draft.subcategoryName}</p>}
        </div>
      )}
      {contentTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {contentTypes.map((s) => (
            <span key={s} className="badge-brand text-xs">{SERVICE_LABELS[s as ContentServiceId]}</span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-surface-600">
        {draft.city && <span>{draft.city}</span>}
        {draft.preferredShootDate && <span>{formatDate(draft.preferredShootDate)}</span>}
        {draft.budgetPreference && draft.budgetPreference !== 'Flexible' && (
          <span>Budget: {draft.budgetPreference}</span>
        )}
      </div>
    </div>
  );
}
