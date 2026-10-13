import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DUMMY_CREATORS } from '../../data/creators';
import { useApp } from '../../context/AppContext';
import {
  calculatePrice, formatCurrency, getStartingPriceInfo,
  findRecommendedPackage, hasSearchCriteria, getSearchFilterItems, isDateAvailable,
} from '../../utils/pricing';
import { PriceBreakdownView } from '../../components/PriceBreakdown';
import { AvailabilityCalendar } from '../../components/AvailabilityCalendar';
import { PortfolioTabs } from '../../components/PortfolioTabs';
import { Star, MapPin, BadgeCheck, ArrowLeft, Shield, Star as StarIcon } from 'lucide-react';
import { PRICING_UNIT_LABELS } from '../../types';

export default function CreatorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requirementDraft, setSelectedCreatorId, setRequirementDraft, setBookingDraft, clearBookingDraft } = useApp();
  const creator = DUMMY_CREATORS.find((c) => c.id === id);
  const [selectedDate, setSelectedDate] = useState(requirementDraft.preferredShootDate || '');
  const [dateError, setDateError] = useState('');

  if (!creator) return <div>Creator not found</div>;

  const withReqs = hasSearchCriteria(requirementDraft);
  const filterItems = getSearchFilterItems(requirementDraft);
  const pricing = withReqs ? calculatePrice(creator, filterItems) : null;
  const startingInfo = getStartingPriceInfo(creator);
  const recommendedPkg = withReqs ? findRecommendedPackage(creator, filterItems) : null;
  const hasValidEstimate = pricing && !pricing.hasCustomQuote && pricing.total > 0;

  const handleBook = () => {
    if (selectedDate) {
      const status = isDateAvailable(creator.availabilityCalendar, selectedDate);
      if (status === 'booked') {
        setDateError('This creator is unavailable on this date.');
        return;
      }
      if (status !== 'available' && status !== 'past') {
        setDateError('Please select an available date.');
        return;
      }
    }
    setDateError('');
    setRequirementDraft((d) => ({ ...d, preferredShootDate: selectedDate || d.preferredShootDate }));
    setSelectedCreatorId(creator.id);
    clearBookingDraft();
    const contentTypes = requirementDraft.contentTypes || filterItems.map((i) => i.serviceId);
    setBookingDraft({
      creatorId: creator.id,
      creatorName: creator.professionalName,
      journey: withReqs ? 'start_project' : 'direct_book',
      step: 'mode',
      bookingType: 'services',
      contentTypes,
      items: [],
      pricing: null,
      title: requirementDraft.title || `${requirementDraft.subcategoryName || 'Content'} Project`,
      description: requirementDraft.description || '',
      city: requirementDraft.city || 'Chennai',
      preferredShootDate: selectedDate || requirementDraft.preferredShootDate || '',
      preferredDeliveryDate: requirementDraft.preferredDeliveryDate || '',
      deliveryExpectation: requirementDraft.deliveryExpectation || 'Within 7 Days',
      categoryId: requirementDraft.categoryId,
      categoryName: requirementDraft.categoryName,
      subcategoryId: requirementDraft.subcategoryId,
      subcategoryName: requirementDraft.subcategoryName,
      audienceType: requirementDraft.audienceType,
      budgetPreference: requirementDraft.budgetPreference,
      serviceDetails: requirementDraft.serviceDetails || {},
    });
    navigate(`/customer/book-creator/${creator.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/customer/find-creators" className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Creators
      </Link>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <img src={creator.avatar} alt={creator.professionalName} className="h-24 w-24 rounded-2xl object-cover" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{creator.professionalName}</h1>
              {creator.verified && creator.status === 'approved' && (
                <span className="badge-success flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified Creator
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-surface-500">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {creator.rating} ({creator.reviewCount} reviews)</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {creator.city}</span>
              <span>{creator.yearsExperience} years experience</span>
            </div>
            <p className="mt-3 text-surface-600">{creator.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {creator.services.map((s) => (
                <span key={s} className="badge-neutral text-xs capitalize">{s.replace('-', ' ')}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-emerald-600" />
              {creator.paymentPreferences.includes('full') && creator.paymentPreferences.includes('split_30_70')
                ? 'Accepts Full Payment & 30% + 70% Split'
                : creator.paymentPreferences.includes('full')
                ? 'Accepts Full Protected Payment'
                : 'Accepts 30% Booking + 70% After Delivery'}
            </div>
            {!withReqs && startingInfo && (
              <div className="mt-4">
                <p className="text-xs text-surface-500 uppercase tracking-wide">Starting from</p>
                <p className="text-xl font-bold">{formatCurrency(startingInfo.amount)}</p>
                <p className="text-sm text-surface-500">{startingInfo.unitLabel}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {withReqs && pricing && (
        <div className="card mb-6 border-brand-200 bg-brand-50/50">
          <h3 className="font-semibold mb-3">Estimated for your requirement</h3>
          {hasValidEstimate ? (
            <>
              <p className="text-3xl font-bold text-brand-700">{formatCurrency(pricing.total)}</p>
              <PriceBreakdownView breakdown={pricing} className="mt-4" detailed />
            </>
          ) : (
            <p className="text-amber-700 font-medium">Custom Quote Required</p>
          )}
        </div>
      )}

      <div className="card mb-6">
        <h3 className="font-semibold mb-4">Services & Rates</h3>
        <div className="space-y-3">
          {creator.rates.map((rate) => (
            <div key={rate.serviceId} className="flex justify-between text-sm border-b border-surface-100 pb-2">
              <div>
                <p className="font-medium">{rate.serviceName}</p>
                <p className="text-surface-500">{PRICING_UNIT_LABELS[rate.pricingUnit]}</p>
              </div>
              <span className="font-semibold">{formatCurrency(rate.rate)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold mb-4">Portfolio</h3>
        <PortfolioTabs items={creator.portfolio} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Packages</h3>
          <div className="space-y-3">
            {creator.packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-4 rounded-xl border ${recommendedPkg?.id === pkg.id ? 'border-amber-300 bg-amber-50' : 'border-surface-200'}`}
              >
                {recommendedPkg?.id === pkg.id && (
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-2">
                    <StarIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Recommended for your requirement
                  </p>
                )}
                <p className="font-semibold">{pkg.name}</p>
                <p className="text-xs text-surface-500 mt-1">{pkg.description}</p>
                <ul className="text-xs text-surface-600 mt-2 space-y-0.5">
                  {pkg.items.map((item) => <li key={item.label}>• {item.label}</li>)}
                </ul>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-brand-700">{formatCurrency(pkg.price)}</span>
                  <span className="text-xs text-surface-500">{pkg.deliveryDays} days delivery</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Availability</h3>
          <AvailabilityCalendar
            availability={creator.availabilityCalendar}
            selectedDate={selectedDate}
            onSelectDate={(d) => { setSelectedDate(d); setDateError(''); }}
            interactive
            compact
          />
          {dateError && <p className="text-sm text-red-600 mt-2">{dateError}</p>}
        </div>
      </div>

      {creator.reviews.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">Reviews</h3>
          <div className="space-y-4">
            {creator.reviews.map((r) => (
              <div key={r.id} className="border-b border-surface-100 pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-sm">{r.rating}</span>
                </div>
                <p className="text-sm text-surface-600 mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleBook} className="btn-primary w-full text-base py-3">
        Book Creator
      </button>
    </div>
  );
}
