import { Star, MapPin, BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Creator, PriceBreakdown, RequirementItem } from '../types';
import { SERVICE_LABELS } from '../types';
import { formatCurrency, getStartingPriceInfo } from '../utils/pricing';
import { PriceBreakdownView } from './PriceBreakdown';

interface CreatorCardProps {
  creator: Creator;
  pricing: PriceBreakdown;
  requiredItems: RequirementItem[];
  onViewProfile: () => void;
  onSelect: () => void;
  selected?: boolean;
}

export function CreatorCard({ creator, pricing, requiredItems, onViewProfile, onSelect, selected }: CreatorCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const withRequirements = requiredItems.length > 0;
  const startingInfo = getStartingPriceInfo(creator);
  const hasValidEstimate = withRequirements && !pricing.hasCustomQuote && pricing.total > 0;

  return (
    <div className={`card-elevated transition-all duration-200 ${selected ? 'ring-2 ring-brand-500 shadow-glow' : 'hover:shadow-card-hover'}`}>
      <div className="flex gap-4">
        <img src={creator.avatar} alt={creator.professionalName} className="h-16 w-16 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-surface-900 truncate">{creator.professionalName}</h3>
            {creator.verified && creator.status === 'approved' && (
              <span title="Verified Creator"><BadgeCheck className="h-4 w-4 text-brand-600 shrink-0" /></span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {creator.rating} ({creator.reviewCount})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {creator.city}
            </span>
            <span>{creator.yearsExperience} yrs exp</span>
          </div>
        </div>
      </div>

      {withRequirements && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {requiredItems.filter((i) => i.quantity > 0).map((item) => (
            <span key={item.serviceId} className="badge-success">
              ✓ {item.quantity} {SERVICE_LABELS[item.serviceId]}
            </span>
          ))}
        </div>
      )}

      {!withRequirements && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {creator.services.slice(0, 4).map((s) => (
            <span key={s} className="badge-neutral capitalize text-xs">{SERVICE_LABELS[s]}</span>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-100">
        {withRequirements ? (
          hasValidEstimate ? (
            <>
              <p className="text-xs text-surface-500 uppercase tracking-wide">Estimated for your requirement</p>
              <p className="text-2xl font-bold text-surface-900 mt-1">{formatCurrency(pricing.total)}</p>
            </>
          ) : (
            <div>
              <p className="text-sm text-amber-700 font-medium">Custom Quote Required</p>
              <p className="text-xs text-surface-500 mt-1">Price on request for some services</p>
            </div>
          )
        ) : (
          <div>
            {startingInfo ? (
              <>
                <p className="text-xs text-surface-500 uppercase tracking-wide">Starting from</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">{formatCurrency(startingInfo.amount)}</p>
                <p className="text-xs text-surface-500 mt-0.5">{startingInfo.unitLabel}</p>
              </>
            ) : (
              <p className="text-sm font-medium text-surface-700">Custom pricing available</p>
            )}
            <p className="text-xs text-surface-500 mt-1">View profile for full rates & packages</p>
          </div>
        )}

        {hasValidEstimate && (
          <>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="mt-2 flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700"
            >
              View Price Breakdown
              {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showBreakdown && (
              <div className="mt-3 border-t border-surface-200 pt-3">
                <PriceBreakdownView breakdown={pricing} detailed />
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onViewProfile} className="btn-secondary flex-1">View Profile</button>
        <button type="button" onClick={onSelect} className="btn-primary flex-1">
          {withRequirements && !hasValidEstimate ? 'Request Quote' : 'Book Creator'}
        </button>
      </div>
    </div>
  );
}
