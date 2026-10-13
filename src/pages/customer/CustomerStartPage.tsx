import { ProgressSteps } from '../../components/ProgressSteps';
import { Link, useNavigate } from 'react-router-dom';
import { AUDIENCE_OPTIONS } from '../../data/categories';
import { useApp } from '../../context/AppContext';
import type { AudienceType } from '../../types';
import { User, Building2 } from 'lucide-react';

export default function CustomerStartPage() {
  const navigate = useNavigate();
  const { setRequirementDraft, clearRequirementDraft } = useApp();

  const selectAudience = (audience: AudienceType) => {
    clearRequirementDraft();
    setRequirementDraft({ audienceType: audience, items: [] });
    navigate('/customer/requirement');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressSteps current={1} total={5} label="Who is this for?" />

      <h1 className="page-title mt-6 mb-2">Who is this content for?</h1>
      <p className="page-subtitle mb-8">Choose the option that best describes your requirement</p>

      <div className="grid sm:grid-cols-2 gap-5">
        {AUDIENCE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => selectAudience(opt.id)}
            className="selection-card group"
          >
            <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-200 transition">
              {opt.id === 'individual' ? (
                <User className="h-7 w-7 text-brand-600" />
              ) : (
                <Building2 className="h-7 w-7 text-brand-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold uppercase tracking-wide">{opt.title}</h3>
            <p className="text-sm text-surface-500 mt-2">{opt.description}</p>
            <ul className="mt-4 space-y-1">
              {opt.examples.map((ex) => (
                <li key={ex} className="text-xs text-surface-400">• {ex}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <Link to="/customer/home" className="btn-ghost mt-8 inline-flex">← Back to Home</Link>
    </div>
  );
}
