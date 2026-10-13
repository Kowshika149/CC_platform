import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DUMMY_CREATORS } from '../../data/creators';
import { useApp } from '../../context/AppContext';
import { calculatePrice } from '../../utils/pricing';
import { PriceBreakdownView } from '../../components/PriceBreakdown';
import { PaymentOptionCard, ProtectedPaymentModal } from '../../components/PaymentOptionCard';
import type { PaymentOption } from '../../types';
import { ArrowLeft, Info } from 'lucide-react';

export default function SelectCreatorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requirementDraft, setSelectedPaymentOption, selectedPaymentOption } = useApp();
  const creator = DUMMY_CREATORS.find((c) => c.id === id);
  const [showProtection, setShowProtection] = useState(false);
  const [error, setError] = useState('');

  if (!creator) return <div>Creator not found</div>;

  const pricing = calculatePrice(creator, requirementDraft.items);
  const [paymentOption, setPaymentOption] = useState<PaymentOption | null>(selectedPaymentOption);

  const handleContinue = () => {
    if (!paymentOption) {
      setError('Please select a payment option');
      return;
    }
    setSelectedPaymentOption(paymentOption);
    navigate(`/customer/payment/${creator.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Confirm Your Selection</h1>

      <div className="card mb-6">
        <h3 className="font-semibold text-sm text-surface-500 uppercase tracking-wide mb-3">Project Summary</h3>
        <p className="font-medium">{requirementDraft.title || 'Untitled Project'}</p>
        <p className="text-sm text-surface-500">{requirementDraft.categoryName} → {requirementDraft.subcategoryName}</p>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-sm text-surface-500 uppercase tracking-wide mb-3">Creator</h3>
        <div className="flex items-center gap-3">
          <img src={creator.avatar} alt="" className="h-12 w-12 rounded-xl" />
          <div>
            <p className="font-semibold">{creator.professionalName}</p>
            <p className="text-sm text-surface-500">{creator.city}</p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-sm text-surface-500 uppercase tracking-wide mb-3">Deliverables & Price</h3>
        <PriceBreakdownView breakdown={pricing} />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Payment Terms</h3>
          <button onClick={() => setShowProtection(true)} className="flex items-center gap-1 text-sm text-brand-600">
            <Info className="h-4 w-4" /> How Protected Payment Works
          </button>
        </div>
        {error && <div className="mb-3 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
        <div className="space-y-3">
          {creator.paymentPreferences.includes('full') && (
            <PaymentOptionCard
              option="full"
              total={pricing.total}
              selected={paymentOption === 'full'}
              onSelect={() => setPaymentOption('full')}
            />
          )}
          {creator.paymentPreferences.includes('split_30_70') && (
            <PaymentOptionCard
              option="split_30_70"
              total={pricing.total}
              selected={paymentOption === 'split_30_70'}
              onSelect={() => setPaymentOption('split_30_70')}
            />
          )}
        </div>
      </div>

      <button onClick={handleContinue} className="btn-primary w-full">
        Continue to Payment
      </button>

      <ProtectedPaymentModal open={showProtection} onClose={() => setShowProtection(false)} />
    </div>
  );
}
