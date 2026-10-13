import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import { BRAND } from '../../constants/brand';
import { ProgressSteps } from '../../components/ProgressSteps';
import {
  SERVICE_LABELS, PRICING_UNIT_LABELS,
  type ContentServiceId, type PricingUnit, type ServiceRate,
  type CreatorPortfolioEntry, type PaymentOption, type CreatorPackage,
  type PortfolioContentType,
} from '../../types';
import { generateId } from '../../utils/pricing';
import { CheckCircle, Upload, Shield, Plus, Trash2 } from 'lucide-react';

const ALL_SERVICES: ContentServiceId[] = [
  'videography', 'reels', 'photography', 'ugc', 'design', 'editing', 'drone', 'script-writing',
];

const ONBOARDING_STEPS = [
  'Profile', 'Categories', 'Services', 'Rates', 'Packages', 'Portfolio', 'Verify Account', 'Links', 'Review',
];

const ID_TYPES = [
  { id: 'aadhaar', label: 'Aadhaar' },
  { id: 'pan', label: 'PAN' },
  { id: 'driving_licence', label: 'Driving Licence' },
  { id: 'passport', label: 'Passport' },
];

export default function CreatorOnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(user?.mobileVerified || false);
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified || false);

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    professionalName: user?.professionalName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    city: user?.city || '',
    state: user?.state || '',
    yearsExperience: user?.yearsExperience?.toString() || '',
    bio: user?.bio || '',
    languages: user?.languages?.join(', ') || 'English, Tamil',
    categories: user?.categories || [] as string[],
    services: user?.services || [] as ContentServiceId[],
    rates: user?.rates || [] as ServiceRate[],
    paymentPreferences: user?.paymentPreferences || ['full', 'split_30_70'] as PaymentOption[],
    portfolioItems: user?.creatorApplication?.portfolioItems || [] as CreatorPortfolioEntry[],
    idType: user?.creatorApplication?.identity?.idType || '',
    idDocumentUploaded: user?.creatorApplication?.identity?.idDocumentUploaded || false,
    selfieUploaded: user?.creatorApplication?.identity?.selfieUploaded || false,
    website: user?.creatorApplication?.professionalLinks?.website || '',
    instagram: user?.creatorApplication?.professionalLinks?.instagram || '',
    youtube: user?.creatorApplication?.professionalLinks?.youtube || '',
    linkedin: user?.creatorApplication?.professionalLinks?.linkedin || '',
    portfolioLink: user?.creatorApplication?.professionalLinks?.portfolioLink || '',
    profilePhotoUploaded: !!(user?.avatar && user.avatar !== '/avatars/default.png'),
    packages: user?.packages || [] as CreatorPackage[],
  });

  const [newPackage, setNewPackage] = useState({
    name: '', description: '', price: '6000', deliveryDays: '7',
    items: [] as { serviceId: ContentServiceId; quantity: number; label: string }[],
  });

  const [newPortfolio, setNewPortfolio] = useState({
    title: '', category: '', contentType: 'video' as PortfolioContentType, description: '',
  });

  const saveProgress = (extra?: Record<string, unknown>) => {
    updateUser({
      fullName: form.fullName,
      professionalName: form.professionalName,
      city: form.city,
      state: form.state,
      yearsExperience: parseInt(form.yearsExperience) || 0,
      bio: form.bio,
      languages: form.languages.split(',').map((l) => l.trim()).filter(Boolean),
      categories: form.categories,
      services: form.services,
      rates: form.rates,
      packages: form.packages,
      paymentPreferences: form.paymentPreferences,
      creatorStatus: 'draft',
      emailVerified,
      mobileVerified: otpVerified,
      creatorApplication: {
        profileComplete: !!(form.professionalName && form.city && form.bio),
        servicesComplete: form.services.length > 0 && form.rates.length > 0,
        portfolioComplete: form.portfolioItems.length >= 3,
        identityComplete: form.idDocumentUploaded && form.selfieUploaded && otpVerified && emailVerified,
        portfolioItems: form.portfolioItems,
        identity: {
          idType: form.idType as 'aadhaar' | 'pan' | 'driving_licence' | 'passport',
          idDocumentUploaded: form.idDocumentUploaded,
          selfieUploaded: form.selfieUploaded,
          submitted: false,
        },
        professionalLinks: {
          website: form.website,
          instagram: form.instagram,
          youtube: form.youtube,
          linkedin: form.linkedin,
          portfolioLink: form.portfolioLink,
        },
      },
      ...extra,
    });
  };

  const next = () => { saveProgress(); setStep((s) => Math.min(s + 1, ONBOARDING_STEPS.length - 1)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const toggleCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter((c) => c !== id) : [...f.categories, id],
    }));
  };

  const toggleService = (id: ContentServiceId) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(id) ? f.services.filter((s) => s !== id) : [...f.services, id],
    }));
  };

  const addRate = (serviceId: ContentServiceId) => {
    if (form.rates.find((r) => r.serviceId === serviceId)) return;
    setForm((f) => ({
      ...f,
      rates: [...f.rates, { serviceId, serviceName: SERVICE_LABELS[serviceId], pricingUnit: 'per_video' as PricingUnit, rate: 1000 }],
    }));
  };

  const addPortfolioItem = () => {
    if (!newPortfolio.title || !newPortfolio.category) return;
    setForm((f) => ({
      ...f,
      portfolioItems: [...f.portfolioItems, { ...newPortfolio, id: generateId() }],
    }));
    setNewPortfolio({ title: '', category: '', contentType: 'video', description: '' });
  };

  const addPackageItem = (serviceId: ContentServiceId) => {
    const label = SERVICE_LABELS[serviceId];
    setNewPackage((p) => ({
      ...p,
      items: p.items.find((i) => i.serviceId === serviceId)
        ? p.items
        : [...p.items, { serviceId, quantity: 1, label }],
    }));
  };

  const savePackage = () => {
    if (!newPackage.name || newPackage.items.length === 0) return;
    const pkg: CreatorPackage = {
      id: generateId(),
      name: newPackage.name,
      description: newPackage.description,
      items: newPackage.items,
      price: parseInt(newPackage.price) || 0,
      deliveryDays: parseInt(newPackage.deliveryDays) || 7,
    };
    setForm((f) => ({ ...f, packages: [...f.packages, pkg] }));
    setNewPackage({ name: '', description: '', price: '6000', deliveryDays: '7', items: [] });
  };

  const getMissingRequirements = (): string[] => {
    const missing: string[] = [];
    if (!form.professionalName || !form.city || !form.bio) missing.push('Complete your basic profile (name, city, bio)');
    if (form.categories.length === 0) missing.push('Select at least one category');
    if (form.services.length === 0) missing.push('Select at least one service');
    if (form.rates.length === 0 || !form.rates.some((r) => r.rate > 0)) missing.push('Add at least one service rate');
    return missing;
  };

  const canSubmit = getMissingRequirements().length === 0;

  const submitApplication = () => {
    if (!canSubmit) return;
    updateUser({
      fullName: form.fullName,
      professionalName: form.professionalName,
      city: form.city,
      state: form.state,
      yearsExperience: parseInt(form.yearsExperience) || 0,
      bio: form.bio,
      languages: form.languages.split(',').map((l) => l.trim()).filter(Boolean),
      categories: form.categories,
      services: form.services,
      rates: form.rates,
      packages: form.packages,
      paymentPreferences: form.paymentPreferences,
      creatorStatus: 'pending_verification',
      emailVerified: true,
      mobileVerified: true,
      creatorApplication: {
        profileComplete: true,
        servicesComplete: true,
        portfolioComplete: true,
        identityComplete: true,
        submittedAt: new Date().toISOString(),
        portfolioItems: form.portfolioItems,
        identity: { idType: form.idType as 'aadhaar' | 'pan' | 'driving_licence' | 'passport', idDocumentUploaded: true, selfieUploaded: true, submitted: true },
        professionalLinks: { website: form.website, instagram: form.instagram, youtube: form.youtube, linkedin: form.linkedin, portfolioLink: form.portfolioLink },
      },
    });
    navigate('/creator/pending');
  };

  if (user?.creatorStatus === 'approved') {
    navigate('/creator/dashboard');
    return null;
  }

  if (user?.creatorStatus === 'pending_verification' || user?.creatorStatus === 'under_review') {
    navigate('/creator/pending');
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Link to="/" className="text-xl font-bold text-brand-700">{BRAND.name}</Link>
          <h1 className="text-xl font-semibold mt-4">Creator Application</h1>
          <p className="text-sm text-surface-500">Join {BRAND.displayName} as a verified creator</p>
        </div>

        <ProgressSteps current={step + 1} total={ONBOARDING_STEPS.length} label={ONBOARDING_STEPS[step]} />

        <div className="card mt-6">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Create Professional Profile</h3>
              <div><label className="label">Full Name *</label><input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
              <div><label className="label">Professional / Creator Name *</label><input className="input" value={form.professionalName} onChange={(e) => setForm({ ...form, professionalName: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Email</label><input className="input" value={form.email} readOnly /></div>
                <div><label className="label">Mobile</label><input className="input" value={form.mobile} readOnly /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">City *</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div><label className="label">State</label><input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
              </div>
              <div><label className="label">Years of Experience</label><input type="number" className="input" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} /></div>
              <div><label className="label">Languages Spoken</label><input className="input" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} placeholder="English, Tamil, Hindi" /></div>
              <div><label className="label">Professional Bio *</label><textarea className="input min-h-[80px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
              <div className="p-4 rounded-xl border border-dashed border-surface-300 text-center text-sm text-surface-500">
                <Upload className="h-5 w-5 mx-auto mb-2 opacity-50" />
                <button type="button" onClick={() => setForm({ ...form, profilePhotoUploaded: true })} className={`${form.profilePhotoUploaded ? 'text-emerald-600 font-medium' : ''}`}>
                  {form.profilePhotoUploaded ? '✓ Profile Photo Uploaded' : 'Upload Profile Photo (prototype)'}
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="font-semibold mb-4">Primary Categories</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                    className={`p-3 rounded-xl border-2 text-left text-sm font-medium ${form.categories.includes(cat.id) ? 'border-brand-500 bg-brand-50' : 'border-surface-200'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold mb-4">Services Offered</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {ALL_SERVICES.map((s) => (
                  <button key={s} onClick={() => toggleService(s)}
                    className={`p-3 rounded-xl border-2 text-left text-sm font-medium ${form.services.includes(s) ? 'border-brand-500 bg-brand-50' : 'border-surface-200'}`}>
                    {SERVICE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Service Rates</h3>
              {form.services.map((s) => {
                const rate = form.rates.find((r) => r.serviceId === s);
                if (!rate) return <button key={s} onClick={() => addRate(s)} className="btn-secondary w-full">+ Add rate for {SERVICE_LABELS[s]}</button>;
                return (
                  <div key={s} className="p-4 rounded-xl border border-surface-200 grid grid-cols-2 gap-3">
                    <p className="font-medium col-span-2">{SERVICE_LABELS[s]}</p>
                    <select className="input" value={rate.pricingUnit} onChange={(e) => setForm((f) => ({ ...f, rates: f.rates.map((r) => r.serviceId === s ? { ...r, pricingUnit: e.target.value as PricingUnit } : r) }))}>
                      {Object.entries(PRICING_UNIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input type="number" className="input" value={rate.rate} onChange={(e) => setForm((f) => ({ ...f, rates: f.rates.map((r) => r.serviceId === s ? { ...r, rate: parseInt(e.target.value) } : r) }))} />
                  </div>
                );
              })}
              <div className="mt-4 pt-4 border-t border-surface-100">
                <h4 className="font-medium mb-2">Payment Preferences</h4>
                <label className="flex items-center gap-2 mb-2"><input type="checkbox" checked={form.paymentPreferences.includes('full')} onChange={() => setForm((f) => ({ ...f, paymentPreferences: f.paymentPreferences.includes('full') ? f.paymentPreferences.filter((p) => p !== 'full') : [...f.paymentPreferences, 'full'] }))} /> Full Payment</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.paymentPreferences.includes('split_30_70')} onChange={() => setForm((f) => ({ ...f, paymentPreferences: f.paymentPreferences.includes('split_30_70') ? f.paymentPreferences.filter((p) => p !== 'split_30_70') : [...f.paymentPreferences, 'split_30_70'] }))} /> 30% Booking + 70% After Delivery</label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Create Packages (Optional)</h3>
              <p className="text-sm text-surface-500">Offer predefined packages to help customers understand your pricing.</p>
              {form.packages.map((pkg) => (
                <div key={pkg.id} className="p-3 rounded-xl bg-surface-50 flex justify-between">
                  <div>
                    <p className="font-medium text-sm">{pkg.name}</p>
                    <p className="text-xs text-surface-500">{pkg.items.map((i) => `${i.quantity} ${i.label}`).join(' • ')} — ₹{pkg.price.toLocaleString('en-IN')}</p>
                  </div>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, packages: f.packages.filter((p) => p.id !== pkg.id) }))}><Trash2 className="h-4 w-4 text-red-500" /></button>
                </div>
              ))}
              <div className="p-4 rounded-xl border border-surface-200 space-y-3">
                <div>
                  <label className="label">Package Name</label>
                  <input className="input" placeholder="e.g. Launch Kit" value={newPackage.name} onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input min-h-[72px]" placeholder="What's included in this package?" value={newPackage.description} onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Package Price (₹)</label>
                    <input type="number" min={0} className="input" placeholder="10000" value={newPackage.price} onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Delivery (days)</label>
                    <input type="number" min={1} className="input" placeholder="7" value={newPackage.deliveryDays} onChange={(e) => setNewPackage({ ...newPackage, deliveryDays: e.target.value })} />
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Included services</p>
                <div className="flex flex-wrap gap-2">
                  {form.services.map((s) => (
                    <button key={s} type="button" onClick={() => addPackageItem(s)} className={`text-xs px-2 py-1 rounded-lg border ${newPackage.items.some((i) => i.serviceId === s) ? 'border-brand-500 bg-brand-50' : 'border-surface-200'}`}>
                      {SERVICE_LABELS[s]}
                    </button>
                  ))}
                </div>
                {newPackage.items.map((item) => (
                  <div key={item.serviceId} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{item.label}</span>
                    <input type="number" min={1} className="input w-20" value={item.quantity} onChange={(e) => setNewPackage((p) => ({ ...p, items: p.items.map((i) => i.serviceId === item.serviceId ? { ...i, quantity: parseInt(e.target.value) || 1 } : i) }))} />
                  </div>
                ))}
                <button type="button" onClick={savePackage} className="btn-secondary w-full"><Plus className="h-4 w-4" /> Add Package</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Portfolio & Past Work</h3>
              <p className="text-sm text-surface-500">Add examples of your past work. Content type determines where it appears on your profile.</p>
              <p className="text-sm text-surface-500">{form.portfolioItems.length} project{form.portfolioItems.length !== 1 ? 's' : ''} added</p>
              {form.portfolioItems.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-surface-50 flex justify-between">
                  <div><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-surface-500">{item.category} • {item.contentType}</p></div>
                  <button onClick={() => setForm((f) => ({ ...f, portfolioItems: f.portfolioItems.filter((p) => p.id !== item.id) }))}><Trash2 className="h-4 w-4 text-red-500" /></button>
                </div>
              ))}
              <div className="p-4 rounded-xl border border-surface-200 space-y-3">
                <label className="label">Content Type</label>
                <div className="flex gap-4 text-sm">
                  {(['video', 'reel', 'photo'] as PortfolioContentType[]).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 capitalize cursor-pointer">
                      <input type="radio" name="contentType" checked={newPortfolio.contentType === t} onChange={() => setNewPortfolio({ ...newPortfolio, contentType: t })} />
                      {t === 'video' ? 'Video' : t === 'reel' ? 'Reel' : 'Photo'}
                    </label>
                  ))}
                </div>
                <input className="input" placeholder="Project Title" value={newPortfolio.title} onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })} />
                <input className="input" placeholder="Category" value={newPortfolio.category} onChange={(e) => setNewPortfolio({ ...newPortfolio, category: e.target.value })} />
                <textarea className="input" placeholder="Description" value={newPortfolio.description} onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })} />
                <div className="p-3 rounded-lg border border-dashed text-center text-xs text-surface-500">Upload photo/video (prototype)</div>
                <button type="button" onClick={addPortfolioItem} className="btn-secondary w-full"><Plus className="h-4 w-4" /> Add Portfolio Item</button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><Shield className="h-5 w-5 text-brand-600" /> Verify My Account</h3>
                <span className="inline-block mt-1 text-xs font-medium text-surface-500 bg-surface-100 px-2 py-0.5 rounded">Optional</span>
              </div>
              <p className="text-sm text-surface-500">Verification helps build trust with customers. Verified creators may build more trust with customers.</p>
              <div>
                <label className="label">Government-issued ID</label>
                <select className="input mb-3" value={form.idType} onChange={(e) => setForm({ ...form, idType: e.target.value })}>
                  <option value="">Select ID Type</option>
                  {ID_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <button onClick={() => setForm({ ...form, idDocumentUploaded: true })} className={`btn-secondary w-full ${form.idDocumentUploaded ? 'border-emerald-500 text-emerald-700' : ''}`}>
                  {form.idDocumentUploaded ? '✓ ID Document Uploaded' : 'Upload ID Document'}
                </button>
              </div>
              <div>
                <label className="label">Selfie / Face Verification</label>
                <p className="text-xs text-surface-500 mb-2">Face clearly visible • Good lighting • No sunglasses • Match your ID</p>
                <button onClick={() => setForm({ ...form, selfieUploaded: true })} className={`btn-secondary w-full ${form.selfieUploaded ? 'border-emerald-500 text-emerald-700' : ''}`}>
                  {form.selfieUploaded ? '✓ Selfie Uploaded' : 'Upload Selfie'}
                </button>
              </div>
              <div>
                <label className="label">Mobile Verification (OTP)</label>
                {!otpVerified ? (
                  <div className="flex gap-2">
                    {!otpSent ? (
                      <button onClick={() => setOtpSent(true)} className="btn-secondary flex-1">Send OTP</button>
                    ) : (
                      <>
                        <input className="input flex-1" placeholder="Enter OTP (use 1234)" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                        <button onClick={() => { if (otpCode === '1234') setOtpVerified(true); }} className="btn-primary">Verify</button>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Mobile Verified</p>
                )}
              </div>
              <div>
                <label className="label">Email Verification</label>
                {emailVerified ? (
                  <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Email Verified</p>
                ) : (
                  <button type="button" onClick={() => setEmailVerified(true)} className="btn-secondary">Send Verification Email</button>
                )}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Professional Links (Optional)</h3>
              <p className="text-sm text-surface-500">Adding professional links can help strengthen your profile.</p>
              <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div><label className="label">Instagram</label><input className="input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
              <div><label className="label">YouTube</label><input className="input" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} /></div>
              <div><label className="label">LinkedIn</label><input className="input" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /></div>
              <div><label className="label">Portfolio Link</label><input className="input" value={form.portfolioLink} onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })} /></div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Application Completion</h3>
              {[
                { label: 'Profile Complete', done: !!(form.professionalName && form.city && form.bio) },
                { label: 'Categories Selected', done: form.categories.length > 0 },
                { label: 'Services Added', done: form.services.length > 0 },
                { label: 'Rates Added', done: form.rates.length > 0 && form.rates.some((r) => r.rate > 0) },
                { label: 'Portfolio', done: form.portfolioItems.length > 0, optional: true, detail: `${form.portfolioItems.length} added` },
                { label: 'Account Verification', done: otpVerified && emailVerified, optional: true },
                { label: 'Packages', done: form.packages.length > 0, optional: true, detail: `${form.packages.length} added` },
                { label: 'Professional Links', done: false, optional: true },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center p-3 rounded-xl bg-surface-50">
                  <span className="font-medium">{s.label}</span>
                  <span className={`text-sm ${s.optional ? 'text-surface-400' : s.done ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {s.optional ? (s.detail || 'Optional') : s.done ? `✓ ${s.detail || 'Complete'}` : 'Incomplete'}
                  </span>
                </div>
              ))}
              {!canSubmit && (
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">
                  <p className="font-medium mb-1">Complete these items to submit:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {getMissingRequirements().map((m) => <li key={m}>{m}</li>)}
                  </ul>
                </div>
              )}
              {canSubmit && <p className="text-sm text-emerald-600 font-medium">All requirements completed.</p>}
              <button
                onClick={submitApplication}
                disabled={!canSubmit}
                className="btn-primary w-full mt-4 disabled:opacity-50"
              >
                Submit for Verification
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && <button onClick={prev} className="btn-secondary flex-1">Back</button>}
            {step < ONBOARDING_STEPS.length - 1 && <button onClick={next} className="btn-primary flex-1">Continue</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
