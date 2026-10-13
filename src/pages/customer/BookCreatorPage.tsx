import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DUMMY_CREATORS } from '../../data/creators';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency, formatPaymentAmount, hasSearchCriteria, getSearchContentTypes,
} from '../../utils/pricing';
import { buildProjectPricing, resolveBookingTotal } from '../../utils/projectPricing';
import { PaymentOptionCard, ProtectedPaymentModal } from '../../components/PaymentOptionCard';
import { QuantitySelector } from '../../components/QuantitySelector';
import { BookingRequirementSummary } from '../../components/BookingRequirementSummary';
import { ServiceRequirementCards, YourBriefCard, type ServiceDetail } from '../../components/ServiceRequirementCards';
import type { BookingDraft, BookingStep, ContentServiceId, PaymentOption, RequirementDraft } from '../../types';
import { PRICING_UNIT_LABELS, SERVICE_LABELS } from '../../types';
import { getCreatorRate } from '../../utils/pricing';
import { ArrowLeft, ArrowRight, Info, Package, Layers } from 'lucide-react';

function emptyBooking(creatorId: string, creatorName: string, journey: BookingDraft['journey']): BookingDraft {
  return {
    creatorId,
    creatorName,
    journey,
    step: 'mode',
    bookingType: 'services',
    contentTypes: [],
    items: [],
    pricing: null,
    title: '',
    description: '',
    city: 'Chennai',
    preferredShootDate: '',
    preferredDeliveryDate: '',
    deliveryExpectation: 'Within 7 Days',
    serviceDetails: {},
  };
}

function buildDraftFromSearch(
  creatorId: string,
  creatorName: string,
  requirementDraft: RequirementDraft
): BookingDraft {
  const contentTypes = getSearchContentTypes(requirementDraft);
  return {
    ...emptyBooking(creatorId, creatorName, 'start_project'),
    contentTypes,
    city: requirementDraft.city || 'Chennai',
    preferredShootDate: requirementDraft.preferredShootDate || '',
    preferredDeliveryDate: requirementDraft.preferredDeliveryDate || '',
    deliveryExpectation: requirementDraft.deliveryExpectation || 'Within 7 Days',
    budgetPreference: requirementDraft.budgetPreference,
    categoryId: requirementDraft.categoryId,
    categoryName: requirementDraft.categoryName,
    subcategoryId: requirementDraft.subcategoryId,
    subcategoryName: requirementDraft.subcategoryName,
    audienceType: requirementDraft.audienceType,
    title: requirementDraft.title || `${requirementDraft.subcategoryName || 'Content'} Project`,
    description: requirementDraft.description || '',
    serviceDetails: requirementDraft.serviceDetails || {},
    step: 'mode',
    items: [],
  };
}

export default function BookCreatorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookingDraft, setBookingDraft, requirementDraft,
    setSelectedPaymentOption, selectedPaymentOption,
  } = useApp();
  const creator = DUMMY_CREATORS.find((c) => c.id === id);

  const [showProtection, setShowProtection] = useState(false);
  const [error, setError] = useState('');
  const [paymentOption, setPaymentOption] = useState<PaymentOption | null>(selectedPaymentOption);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!creator || initialized) return;
    if (!bookingDraft || bookingDraft.creatorId !== creator.id) {
      const journey = hasSearchCriteria(requirementDraft) ? 'start_project' : 'direct_book';
      const draft = journey === 'start_project'
        ? buildDraftFromSearch(creator.id, creator.professionalName, requirementDraft)
        : emptyBooking(creator.id, creator.professionalName, 'direct_book');
      setBookingDraft(draft);
    }
    setInitialized(true);
  }, [creator, bookingDraft, requirementDraft, setBookingDraft, initialized]);

  const draft = bookingDraft && creator && bookingDraft.creatorId === creator.id ? bookingDraft : null;
  const step: BookingStep = draft?.step || 'mode';

  const setStep = (next: BookingStep) => {
    setBookingDraft((prev) => prev ? { ...prev, step: next } : prev);
  };

  const resolved = useMemo(() => {
    if (!creator || !draft) return null;
    return resolveBookingTotal(creator, draft.bookingType, draft.items, draft.selectedPackageId);
  }, [creator, draft]);

  if (!creator || !draft) return <div className="p-8">Loading...</div>;

  const updateDraft = (patch: Partial<BookingDraft>) => {
    setBookingDraft((prev) => prev ? { ...prev, ...patch } : prev);
  };

  const serviceIdsInBooking = draft.items.filter((i) => i.quantity > 0).map((i) => i.serviceId);

  const toggleService = (serviceId: ContentServiceId) => {
    const exists = draft.items.find((i) => i.serviceId === serviceId);
    if (exists) {
      updateDraft({ items: draft.items.filter((i) => i.serviceId !== serviceId) });
    } else {
      const defaultQty = draft.contentTypes?.includes(serviceId) ? 1 : 1;
      updateDraft({ items: [...draft.items, { serviceId, quantity: defaultQty }] });
    }
  };

  const setQuantity = (serviceId: ContentServiceId, quantity: number) => {
    const existing = draft.items.find((i) => i.serviceId === serviceId);
    if (existing) {
      updateDraft({
        items: draft.items.map((i) => i.serviceId === serviceId ? { ...i, quantity } : i),
      });
    } else {
      updateDraft({ items: [...draft.items, { serviceId, quantity }] });
    }
  };

  const getItemQty = (serviceId: ContentServiceId) =>
    draft.items.find((i) => i.serviceId === serviceId)?.quantity || 0;

  const isServiceSelected = (serviceId: ContentServiceId) =>
    draft.items.some((i) => i.serviceId === serviceId && i.quantity > 0);

  const quantitiesMap = useMemo(() => {
    const q: Record<string, number> = {};
    draft.items.forEach((i) => { if (i.quantity > 0) q[i.serviceId] = i.quantity; });
    return q;
  }, [draft.items]);

  const serviceDetails = (draft.serviceDetails || {}) as Record<string, ServiceDetail>;

  const goToRequirements = () => {
    if (!resolved?.valid) {
      setError(draft.bookingType === 'package' ? 'Please select a package' : 'Select at least one service with quantity');
      return;
    }
    setError('');
    setStep('requirements');
  };

  const goToReview = () => {
    if (draft.journey === 'direct_book' && !draft.title.trim()) {
      setError('Please enter a project title');
      return;
    }
    if (!draft.preferredShootDate && draft.journey === 'direct_book') {
      setError('Please select a preferred date');
      return;
    }
    if (!resolved?.valid) {
      setError('Invalid pricing — please check your selection');
      return;
    }
    setError('');
    setStep('review');
  };

  const handleContinueToPayment = () => {
    if (!paymentOption) { setError('Please select a payment option'); return; }
    if (!resolved?.valid || !resolved.total) { setError('Price unavailable'); return; }
    setError('');
    const pricing = buildProjectPricing(
      resolved.total,
      resolved.breakdown,
      draft.bookingType,
      paymentOption,
      0,
      draft.selectedPackageId,
      resolved.packageName
    );
    setSelectedPaymentOption(paymentOption);
    setBookingDraft({ ...draft, pricing, step: 'review' });
    navigate(`/customer/payment/${creator.id}`);
  };

  const preSelectFromSearch = () => {
    if (!draft.contentTypes?.length || draft.items.length > 0) return;
    const matching = draft.contentTypes.filter((s) => creator.services.includes(s));
    if (matching.length > 0) {
      updateDraft({
        items: matching.map((s) => ({ serviceId: s, quantity: s === 'photography' ? 20 : 1 })),
      });
    }
  };

  useEffect(() => {
    if (step === 'select' && draft.bookingType === 'services' && draft.journey === 'start_project') {
      preSelectFromSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, draft.bookingType]);

  const subtitleByStep: Record<BookingStep, string> = {
    mode: 'Choose how you would like to book',
    select: draft.bookingType === 'package' ? 'Select a creator package' : 'Select services and quantities',
    requirements: 'Tell us exactly what should be delivered',
    review: 'Review your booking and payment terms',
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button type="button" onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Book {creator.professionalName}</h1>
        <p className="page-subtitle">{subtitleByStep[step]}</p>
      </div>

      {draft.journey === 'start_project' && step !== 'review' && (
        <BookingRequirementSummary
          draft={draft}
          onEdit={() => navigate('/customer/requirement')}
        />
      )}

      {error && <div className="alert-warning mb-4">{error}</div>}

      {step === 'mode' && (
        <div className="space-y-4">
          <button type="button" onClick={() => { updateDraft({ bookingType: 'services', items: [] }); setStep('select'); }} className="action-card-primary w-full text-left">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand-600 text-white flex items-center justify-center"><Layers className="h-6 w-6" /></div>
              <div>
                <p className="font-bold text-lg">Individual Services</p>
                <p className="text-sm text-surface-500">Build your own requirement with quantities</p>
              </div>
              <ArrowRight className="h-5 w-5 text-brand-600 ml-auto" />
            </div>
          </button>
          <button type="button" onClick={() => { updateDraft({ bookingType: 'package', items: [], selectedPackageId: undefined }); setStep('select'); }} className="action-card w-full text-left">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-surface-100 text-surface-600 flex items-center justify-center"><Package className="h-6 w-6" /></div>
              <div>
                <p className="font-bold text-lg">Creator Packages</p>
                <p className="text-sm text-surface-500">Choose a ready-made content package</p>
              </div>
              <ArrowRight className="h-5 w-5 text-surface-400 ml-auto" />
            </div>
          </button>
        </div>
      )}

      {step === 'select' && draft.bookingType === 'services' && (
        <div>
          <div className="space-y-4 mb-6">
            {creator.services.map((serviceId) => {
              const rate = getCreatorRate(creator, serviceId);
              const selected = isServiceSelected(serviceId);
              const qty = getItemQty(serviceId);
              const lineTotal = rate ? rate.rate * (qty || 1) : 0;
              return (
                <div key={serviceId} className={`card p-5 ${selected ? 'ring-2 ring-brand-500 border-brand-200' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{SERVICE_LABELS[serviceId]}</p>
                      {rate ? (
                        <p className="text-sm text-surface-500">{formatCurrency(rate.rate)} {PRICING_UNIT_LABELS[rate.pricingUnit]}</p>
                      ) : (
                        <p className="text-sm text-amber-600">Custom Quote Required</p>
                      )}
                    </div>
                    <button type="button" onClick={() => toggleService(serviceId)} className={`text-sm font-medium px-3 py-1 rounded-lg ${selected ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600'}`}>
                      {selected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                  {selected && rate && (
                    <>
                      <QuantitySelector serviceId={serviceId} value={qty || 1} onChange={(v) => setQuantity(serviceId, v)} />
                      <p className="text-right text-sm font-bold text-brand-700 mt-3">Estimated: {formatCurrency(lineTotal)}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {resolved && resolved.valid && (
            <div className="card-elevated mb-4 bg-brand-50/50 border-brand-200">
              <p className="text-xs uppercase tracking-wide text-surface-500 mb-2">Booking Summary</p>
              {resolved.breakdown.items.map((item) => (
                <div key={item.serviceId} className="flex justify-between text-sm py-1">
                  <span>{item.quantity} × {item.label}</span>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg border-t border-brand-200 pt-3 mt-2">
                <span>Project Total</span>
                <span className="text-brand-700">{formatCurrency(resolved.total)}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('mode')} className="btn-secondary flex-1">Back</button>
            <button type="button" onClick={goToRequirements} className="btn-primary flex-1">Continue</button>
          </div>
        </div>
      )}

      {step === 'select' && draft.bookingType === 'package' && (
        <div>
          <div className="space-y-3 mb-6">
            {creator.packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => updateDraft({ selectedPackageId: pkg.id })}
                className={`w-full text-left card p-5 ${draft.selectedPackageId === pkg.id ? 'ring-2 ring-brand-500 border-brand-200 bg-brand-50/30' : ''}`}
              >
                <p className="font-bold text-lg">{pkg.name}</p>
                <p className="text-sm text-surface-500 mt-1">{pkg.description}</p>
                <ul className="text-sm text-surface-600 mt-2 space-y-0.5">
                  {pkg.items.map((item) => <li key={item.label}>• {item.label}</li>)}
                </ul>
                <p className="text-xl font-bold text-brand-700 mt-3">{formatCurrency(pkg.price)}</p>
                <p className="text-xs text-surface-500">{pkg.deliveryDays} days delivery</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('mode')} className="btn-secondary flex-1">Back</button>
            <button type="button" onClick={goToRequirements} className="btn-primary flex-1">Continue</button>
          </div>
        </div>
      )}

      {step === 'requirements' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-2">Step — Specific Requirements</p>
          <h2 className="text-xl font-bold mb-2">What exactly should be delivered?</h2>
          <p className="text-surface-500 mb-6">Only the relevant sections for your selected services are shown.</p>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <ServiceRequirementCards
                selectedServices={serviceIdsInBooking}
                quantities={quantitiesMap}
                details={serviceDetails}
                onChange={(serviceId, patch) => updateDraft({
                  serviceDetails: { ...draft.serviceDetails, [serviceId]: { ...serviceDetails[serviceId], ...patch } },
                })}
                onQuantityChange={setQuantity}
                editableQuantities
              />

              {draft.journey === 'direct_book' && (
                <div className="card space-y-4">
                  <h3 className="font-semibold">Project Details</h3>
                  <div>
                    <label className="label">Project Title *</label>
                    <input className="input" value={draft.title} onChange={(e) => updateDraft({ title: e.target.value })} placeholder="e.g. Birthday Photography" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Location</label>
                      <input className="input" value={draft.city} onChange={(e) => updateDraft({ city: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Preferred Date *</label>
                      <input type="date" className="input" value={draft.preferredShootDate} onChange={(e) => updateDraft({ preferredShootDate: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setShowMoreDetails(!showMoreDetails)} className="text-sm text-brand-600 font-medium">
                {showMoreDetails ? '− Hide' : '+ Add More Project Details'} (Optional)
              </button>
              {showMoreDetails && (
                <div className="card space-y-3">
                  <div>
                    <label className="label">Project Description</label>
                    <textarea className="input min-h-[80px]" value={draft.description} onChange={(e) => updateDraft({ description: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Special Requirements</label>
                    <textarea className="input" value={draft.specialRequirements || ''} onChange={(e) => updateDraft({ specialRequirements: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <YourBriefCard
              categoryName={draft.categoryName}
              subcategoryName={draft.subcategoryName}
              selectedServices={serviceIdsInBooking}
              quantities={quantitiesMap}
              serviceDetails={serviceDetails}
              city={draft.city}
              preferredShootDate={draft.preferredShootDate}
              budgetPreference={draft.budgetPreference}
              deliveryExpectation={draft.deliveryExpectation}
              projectTotal={resolved?.valid ? resolved.total : undefined}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setStep('select')} className="btn-secondary flex-1">Back</button>
            <button type="button" onClick={goToReview} className="btn-primary flex-1">Continue to Booking Summary</button>
          </div>
        </div>
      )}

      {step === 'review' && resolved?.valid && (
        <div>
          <div className="card-elevated mb-6">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <p className="font-medium">{draft.title || draft.subcategoryName || 'Content Project'}</p>
            <p className="text-sm text-surface-500">{draft.city} {draft.preferredShootDate ? `• ${draft.preferredShootDate}` : ''}</p>
            <div className="border-t border-surface-100 mt-4 pt-4">
              {resolved.breakdown.items.map((item) => (
                <div key={item.serviceId} className="flex justify-between text-sm py-1">
                  <span>{item.quantity} × {item.label}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-xl mt-3 pt-3 border-t">
                <span>Project Total</span>
                <span className="text-brand-700">{formatPaymentAmount(resolved.total)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Payment Terms</h3>
              <button type="button" onClick={() => setShowProtection(true)} className="flex items-center gap-1 text-sm text-brand-600">
                <Info className="h-4 w-4" /> Protected Payment
              </button>
            </div>
            <div className="space-y-3">
              {creator.paymentPreferences.includes('full') && (
                <PaymentOptionCard option="full" total={resolved.total} selected={paymentOption === 'full'} onSelect={() => setPaymentOption('full')} />
              )}
              {creator.paymentPreferences.includes('split_30_70') && (
                <PaymentOptionCard option="split_30_70" total={resolved.total} selected={paymentOption === 'split_30_70'} onSelect={() => setPaymentOption('split_30_70')} />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('requirements')} className="btn-secondary flex-1">Back</button>
            <button type="button" onClick={handleContinueToPayment} className="btn-primary flex-1">Continue to Payment</button>
          </div>
          <ProtectedPaymentModal open={showProtection} onClose={() => setShowProtection(false)} />
        </div>
      )}
    </div>
  );
}
