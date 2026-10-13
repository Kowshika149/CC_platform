import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCategoriesForAudience, getRecommendedServices, BUDGET_OPTIONS } from '../../data/categories';
import { useApp } from '../../context/AppContext';
import { SERVICE_LABELS, SERVICE_DESCRIPTIONS, type ContentServiceId } from '../../types';
import { ProgressSteps } from '../../components/ProgressSteps';
import { Building2, Package, Calendar, Home, Briefcase, Sparkles, Camera, Check, ArrowLeft, Share2, Landmark } from 'lucide-react';

const iconMap: Record<string, typeof Building2> = {
  Building2, Package, Calendar, Home, Briefcase, Sparkles, Share2, Landmark,
};

const ALL_SERVICES: ContentServiceId[] = [
  'videography', 'reels', 'photography', 'ugc', 'design', 'editing', 'drone', 'script-writing',
];

type FlowStep = 'category' | 'subcategory' | 'services' | 'search';

const STEP_MAP: Record<FlowStep, { num: number; label: string }> = {
  category: { num: 1, label: 'Choose Category' },
  subcategory: { num: 2, label: 'Choose Subcategory' },
  services: { num: 3, label: 'What content do you need?' },
  search: { num: 4, label: 'Search Details' },
};

export default function RequirementFlowPage() {
  const navigate = useNavigate();
  const { requirementDraft, setRequirementDraft } = useApp();

  const [step, setStep] = useState<FlowStep>(() => {
    if (requirementDraft.city || requirementDraft.preferredShootDate) return 'search';
    if (requirementDraft.contentTypes?.length || requirementDraft.items.length) return 'services';
    if (requirementDraft.subcategoryId) return 'services';
    if (requirementDraft.categoryId) return 'subcategory';
    return 'category';
  });
  const [selectedServices, setSelectedServices] = useState<ContentServiceId[]>(
    requirementDraft.contentTypes?.length
      ? requirementDraft.contentTypes
      : requirementDraft.items.map((i) => i.serviceId)
  );
  const [searchDetails, setSearchDetails] = useState({
    city: requirementDraft.city || 'Chennai',
    preferredShootDate: requirementDraft.preferredShootDate || '',
    budgetPreference: requirementDraft.budgetPreference || '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!requirementDraft.audienceType) {
      navigate('/customer/start');
    }
  }, [requirementDraft.audienceType, navigate]);

  const categories = requirementDraft.audienceType
    ? getCategoriesForAudience(requirementDraft.audienceType)
    : [];
  const category = categories.find((c) => c.id === requirementDraft.categoryId);

  const toggleService = (id: ContentServiceId) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleCategory = (catId: string, catName: string) => {
    setRequirementDraft((d) => ({ ...d, categoryId: catId, categoryName: catName, subcategoryId: undefined, subcategoryName: undefined }));
    setStep('subcategory');
  };

  const handleSubcategory = (subId: string, subName: string) => {
    setRequirementDraft((d) => ({ ...d, subcategoryId: subId, subcategoryName: subName }));
    setStep('services');
  };

  const handleServicesNext = () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one content type');
      return;
    }
    setError('');
    setRequirementDraft((d) => ({
      ...d,
      contentTypes: selectedServices,
      items: [],
    }));
    setStep('search');
  };

  const handleFindCreators = () => {
    if (!searchDetails.city.trim()) { setError('Location is required'); return; }
    if (!searchDetails.preferredShootDate) { setError('Preferred date is required'); return; }
    setError('');
    setRequirementDraft((d) => ({
      ...d,
      contentTypes: selectedServices,
      items: [],
      city: searchDetails.city,
      preferredShootDate: searchDetails.preferredShootDate,
      budgetPreference: searchDetails.budgetPreference || 'Flexible',
      title: d.subcategoryName ? `${d.subcategoryName} Content` : 'Content Project',
    }));
    navigate('/customer/find-creators');
  };

  const stepInfo = STEP_MAP[step];

  const goBack = () => {
    const back: Record<FlowStep, FlowStep | null> = {
      category: null,
      subcategory: 'category',
      services: 'subcategory',
      search: 'services',
    };
    const prev = back[step];
    if (prev) setStep(prev);
    else navigate('/customer/start');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button type="button" onClick={goBack} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <ProgressSteps current={stepInfo.num} total={4} label={stepInfo.label} />

      {requirementDraft.audienceType && (
        <span className="badge-brand mt-4 inline-block capitalize">{requirementDraft.audienceType}</span>
      )}

      {error && <div className="mt-4 alert-warning">{error}</div>}

      {step === 'category' && (
        <div className="mt-6">
          <h2 className="page-title text-xl">Select a category</h2>
          <p className="page-subtitle mb-6">What type of content do you need?</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] || Camera;
              return (
                <button key={cat.id} type="button" onClick={() => handleCategory(cat.id, cat.name)} className="card-hover text-left p-5">
                  <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-surface-500 mt-1">{cat.subcategories.length} options</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 'subcategory' && category && (
        <div className="mt-6">
          <h2 className="page-title text-xl">{category.name}</h2>
          <p className="page-subtitle mb-6">Select a subcategory</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {category.subcategories.map((sub) => (
              <button key={sub.id} type="button" onClick={() => handleSubcategory(sub.id, sub.name)} className="card-hover text-left p-4">
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'services' && (
        <div className="mt-6">
          <h2 className="page-title text-xl">What content do you need?</h2>
          <p className="page-subtitle mb-6">Select one or more — no quantities needed yet</p>
          {requirementDraft.subcategoryId && getRecommendedServices(requirementDraft.subcategoryId).length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-brand-50 border border-brand-100">
              <p className="text-xs font-semibold text-brand-800 mb-2">Recommended for {requirementDraft.subcategoryName}:</p>
              <div className="flex flex-wrap gap-2">
                {getRecommendedServices(requirementDraft.subcategoryId).map((s) => (
                  <span key={s} className="badge-brand text-xs">{SERVICE_LABELS[s]}</span>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            {ALL_SERVICES.map((id) => {
              const selected = selectedServices.includes(id);
              return (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleService(id)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleService(id)}
                  className={`card p-4 cursor-pointer transition ${selected ? 'ring-2 ring-brand-500 border-brand-300' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${selected ? 'bg-brand-600 border-brand-600' : 'border-surface-300'}`}>
                      {selected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{SERVICE_LABELS[id]}</h3>
                      <p className="text-sm text-surface-500 mt-0.5">{SERVICE_DESCRIPTIONS[id]}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={handleServicesNext} className="btn-primary mt-6">Continue</button>
        </div>
      )}

      {step === 'search' && (
        <div className="mt-6">
          <h2 className="page-title text-xl">Almost there</h2>
          <p className="page-subtitle mb-6">Tell us where and when — then we&apos;ll find matching creators</p>

          <div className="card mb-4 p-4 bg-brand-50/50 border-brand-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">Looking for</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedServices.map((s) => (
                <span key={s} className="badge-brand text-xs">{SERVICE_LABELS[s]}</span>
              ))}
            </div>
            {category && (
              <p className="text-sm text-surface-600 mt-2">{category.name} → {requirementDraft.subcategoryName}</p>
            )}
          </div>

          <div className="card space-y-4">
            <div>
              <label className="label">Location *</label>
              <input className="input" value={searchDetails.city} onChange={(e) => setSearchDetails({ ...searchDetails, city: e.target.value })} placeholder="Chennai" />
            </div>
            <div>
              <label className="label">Preferred Date *</label>
              <input type="date" className="input" value={searchDetails.preferredShootDate} onChange={(e) => setSearchDetails({ ...searchDetails, preferredShootDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Budget (Optional)</label>
              <select className="input" value={searchDetails.budgetPreference} onChange={(e) => setSearchDetails({ ...searchDetails, budgetPreference: e.target.value })}>
                <option value="">No preference</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" onClick={handleFindCreators} className="btn-primary mt-6 w-full sm:w-auto">
            Find Creators
          </button>
        </div>
      )}
    </div>
  );
}
