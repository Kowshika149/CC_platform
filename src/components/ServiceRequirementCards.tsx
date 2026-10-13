import type { ContentServiceId } from '../types';
import { SERVICE_LABELS } from '../types';
import { QuantitySelector } from './QuantitySelector';

export interface ServiceDetail {
  contentType?: string;
  duration?: string;
  platform?: string;
  photoStyle?: string;
}

interface PillGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

function PillGroup({ label, options, value, onChange }: PillGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
              value === opt
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-surface-700 border-surface-200 hover:border-brand-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const REEL_TYPES = ['Promotional', 'Trending', 'Educational', 'Product / Service', 'Other'];
const REEL_DURATIONS = ['Under 15 sec', '15–30 sec', '30–60 sec', 'Custom'];
const REEL_PLATFORMS = ['Instagram', 'YouTube Shorts', 'Facebook', 'Other'];

const VIDEO_TYPES = ['Promotional Video', 'Brand Video', 'Service Video', 'Testimonial Video', 'Business / Facility Tour', 'Other'];
const VIDEO_DURATIONS = ['Under 30 sec', '30–60 sec', '60–90 sec', '2–5 min', '5+ min', 'Custom'];

const PHOTO_STYLES = ['Professional', 'Lifestyle', 'Product', 'Candid', 'Other'];

interface ServiceRequirementCardsProps {
  selectedServices: ContentServiceId[];
  quantities: Record<string, number>;
  details: Record<string, ServiceDetail>;
  onChange: (serviceId: ContentServiceId, patch: Partial<ServiceDetail>) => void;
  onQuantityChange?: (serviceId: ContentServiceId, quantity: number) => void;
  editableQuantities?: boolean;
}

export function ServiceRequirementCards({
  selectedServices, quantities, details, onChange, onQuantityChange, editableQuantities,
}: ServiceRequirementCardsProps) {
  const reelSelected = selectedServices.includes('reels');
  const videoSelected = selectedServices.includes('videography');
  const photoSelected = selectedServices.includes('photography');

  if (!reelSelected && !videoSelected && !photoSelected) {
    return (
      <p className="text-sm text-surface-500">Add optional project details below.</p>
    );
  }

  const QtyControl = ({ serviceId }: { serviceId: ContentServiceId }) => {
    const qty = quantities[serviceId] || 1;
    if (editableQuantities && onQuantityChange) {
      return <QuantitySelector serviceId={serviceId} value={qty} onChange={(v) => onQuantityChange(serviceId, v)} />;
    }
    return <p className="text-lg font-semibold">{qty}</p>;
  };

  return (
    <div className="space-y-6">
      {reelSelected && (
        <div className="card p-6 relative">
          <span className="absolute top-4 right-4 badge-brand text-xs">Reels / Short Videos</span>
          <h3 className="font-bold text-lg mb-5">Reels Requirements</h3>
          <div className="space-y-5">
            <PillGroup
              label="What type of reels do you need?"
              options={REEL_TYPES}
              value={details.reels?.contentType || 'Promotional'}
              onChange={(v) => onChange('reels', { contentType: v })}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">Number of Reels</p>
              <QtyControl serviceId="reels" />
            </div>
            <PillGroup
              label="Approximate Duration"
              options={REEL_DURATIONS}
              value={details.reels?.duration || '15–30 sec'}
              onChange={(v) => onChange('reels', { duration: v })}
            />
            <PillGroup
              label="Platform"
              options={REEL_PLATFORMS}
              value={details.reels?.platform || 'Instagram'}
              onChange={(v) => onChange('reels', { platform: v })}
            />
          </div>
        </div>
      )}

      {videoSelected && (
        <div className="card p-6 relative">
          <span className="absolute top-4 right-4 badge-brand text-xs">Videography</span>
          <h3 className="font-bold text-lg mb-5">Video Requirements</h3>
          <div className="space-y-5">
            <PillGroup
              label="What type of video do you need?"
              options={VIDEO_TYPES}
              value={details.videography?.contentType || 'Promotional Video'}
              onChange={(v) => onChange('videography', { contentType: v })}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">Number of Videos</p>
              <QtyControl serviceId="videography" />
            </div>
            <PillGroup
              label="Approximate Duration"
              options={VIDEO_DURATIONS}
              value={details.videography?.duration || '60–90 sec'}
              onChange={(v) => onChange('videography', { duration: v })}
            />
          </div>
        </div>
      )}

      {photoSelected && (
        <div className="card p-6 relative">
          <span className="absolute top-4 right-4 badge-brand text-xs">Photography</span>
          <h3 className="font-bold text-lg mb-5">Photography Requirements</h3>
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">Number of Photos</p>
              <QtyControl serviceId="photography" />
            </div>
            <PillGroup
              label="Photo Style"
              options={PHOTO_STYLES}
              value={details.photography?.photoStyle || 'Professional'}
              onChange={(v) => onChange('photography', { photoStyle: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function YourBriefCard({
  categoryName,
  subcategoryName,
  selectedServices,
  quantities,
  serviceDetails,
  city,
  preferredShootDate,
  budgetPreference,
  deliveryExpectation,
  projectTotal,
}: {
  categoryName?: string;
  subcategoryName?: string;
  selectedServices: ContentServiceId[];
  quantities: Record<string, number>;
  serviceDetails: Record<string, ServiceDetail>;
  city?: string;
  preferredShootDate?: string;
  budgetPreference?: string;
  deliveryExpectation?: string;
  projectTotal?: number;
}) {
  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="card-elevated sticky top-6">
      <h3 className="font-bold text-lg mb-4">Your Brief</h3>
      {categoryName && (
        <div className="mb-4 pb-4 border-b border-surface-100">
          <p className="font-semibold">{categoryName}</p>
          {subcategoryName && <p className="text-sm text-surface-500">{subcategoryName}</p>}
        </div>
      )}
      {selectedServices.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">Selected Content</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedServices.map((s) => (
              <span key={s} className="badge-brand text-xs">{SERVICE_LABELS[s]}</span>
            ))}
          </div>
        </div>
      )}
      <ul className="text-sm space-y-3 mb-4 text-surface-700">
        {selectedServices.map((s) => {
          const d = serviceDetails[s];
          const qty = quantities[s] || 1;
          return (
            <li key={s} className="pb-2 border-b border-surface-50 last:border-0">
              <p className="font-medium text-xs uppercase text-surface-500">{SERVICE_LABELS[s]}</p>
              <p>{qty} {SERVICE_LABELS[s]}</p>
              {d?.contentType && <p className="text-surface-500">{d.contentType}</p>}
              {d?.duration && <p className="text-surface-500">{d.duration}</p>}
              {d?.platform && <p className="text-surface-500">{d.platform}</p>}
              {d?.photoStyle && <p className="text-surface-500">{d.photoStyle}</p>}
            </li>
          );
        })}
      </ul>
      {city && (
        <div className="border-t border-surface-100 pt-3 mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Location</p>
          <p className="text-sm font-medium">{city}</p>
        </div>
      )}
      {preferredShootDate && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Preferred Date</p>
          <p className="text-sm font-medium">{preferredShootDate}</p>
        </div>
      )}
      {budgetPreference && budgetPreference !== 'Flexible' && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Budget</p>
          <p className="text-sm font-medium">{budgetPreference}</p>
        </div>
      )}
      {deliveryExpectation && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Delivery</p>
          <p className="text-sm font-medium">{deliveryExpectation}</p>
        </div>
      )}
      {projectTotal !== undefined && projectTotal > 0 && (
        <div className="border-t border-surface-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Project Total</p>
          <p className="text-xl font-bold text-brand-700">{formatCurrency(projectTotal)}</p>
        </div>
      )}
    </div>
  );
}
