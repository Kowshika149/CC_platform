import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { calculatePaymentAmounts, formatPaymentAmount } from '../../utils/pricing';
import { applyPaymentToPricing } from '../../utils/projectPricing';
import { PaymentSummary } from '../../components/PaymentSummary';
import { CheckCircle, CreditCard, Smartphone, Building } from 'lucide-react';
import type { PaymentOption } from '../../types';

interface PaymentSnapshot {
  projectTotal: number;
  amountPaid: number;
  paymentOption: PaymentOption;
}

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookingDraft, selectedPaymentOption, createProject, clearBookingDraft,
  } = useApp();
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [paymentSnapshot, setPaymentSnapshot] = useState<PaymentSnapshot | null>(null);
  const paidRef = useRef(false);

  const pricing = bookingDraft?.pricing;
  const canPay = bookingDraft && bookingDraft.creatorId === id && selectedPaymentOption && pricing && pricing.projectTotal > 0;

  useEffect(() => {
    if (success || processing || paidRef.current) return;
    if (!id) return;
    if (!bookingDraft || bookingDraft.creatorId !== id) {
      navigate(`/customer/book-creator/${id}`, { replace: true });
      return;
    }
    if (!selectedPaymentOption || !pricing || pricing.projectTotal <= 0) {
      navigate(`/customer/book-creator/${id}`, { replace: true });
    }
  }, [id, bookingDraft, selectedPaymentOption, pricing, navigate, success, processing]);

  const handlePay = () => {
    if (!canPay || !bookingDraft || !pricing || !selectedPaymentOption) return;
    setProcessing(true);
    paidRef.current = true;

    const amounts = calculatePaymentAmounts(pricing.projectTotal, selectedPaymentOption);
    const snapshot: PaymentSnapshot = {
      projectTotal: pricing.projectTotal,
      amountPaid: amounts.payNow,
      paymentOption: selectedPaymentOption,
    };

    setTimeout(() => {
      const pricingAfterPay = applyPaymentToPricing(pricing, amounts.payNow);
      const project = createProject({
        creatorId: bookingDraft.creatorId,
        creatorName: bookingDraft.creatorName,
        requirement: {
          categoryId: bookingDraft.categoryId || 'direct',
          categoryName: bookingDraft.categoryName || 'Direct Booking',
          subcategoryId: bookingDraft.subcategoryId || '',
          subcategoryName: bookingDraft.subcategoryName || '',
          items: bookingDraft.items,
          title: bookingDraft.title || 'Booking',
          description: bookingDraft.description || '',
          city: bookingDraft.city || '',
          preferredShootDate: bookingDraft.preferredShootDate || '',
          preferredDeliveryDate: bookingDraft.preferredDeliveryDate || '',
          budgetPreference: bookingDraft.budgetPreference || 'Flexible',
          specialRequirements: bookingDraft.specialRequirements,
        },
        pricing: pricingAfterPay,
      });

      setPaymentSnapshot(snapshot);
      setProjectId(project.id);
      setProcessing(false);
      setSuccess(true);
      clearBookingDraft();
    }, 1500);
  };

  if (success && paymentSnapshot) {
    return (
      <div className="max-w-md mx-auto text-center py-12 animate-fade-in">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="page-title">Payment Successful ✓</h1>
        <p className="text-surface-500 mb-6">Your booking request has been sent to the creator</p>
        <div className="card text-left mb-6">
          <PaymentSummary
            totalAmount={paymentSnapshot.projectTotal}
            amountPaid={paymentSnapshot.amountPaid}
            paymentOption={paymentSnapshot.paymentOption}
          />
        </div>
        <button
          type="button"
          onClick={() => navigate(`/customer/projects/${projectId}/workspace`)}
          className="btn-primary w-full"
        >
          Go to Workspace
        </button>
      </div>
    );
  }

  if (!canPay || !bookingDraft || !pricing || !selectedPaymentOption) {
    return <div className="p-8 text-center text-surface-500">Loading payment...</div>;
  }

  const amounts = calculatePaymentAmounts(pricing.projectTotal, selectedPaymentOption);

  const methods = [
    { id: 'upi' as const, label: 'UPI', icon: Smartphone },
    { id: 'card' as const, label: 'Credit / Debit Card', icon: CreditCard },
    { id: 'netbanking' as const, label: 'Net Banking', icon: Building },
  ];

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Complete Payment</h1>
        <p className="page-subtitle">Secure your booking with protected payment</p>
      </div>

      <div className="card-elevated mb-6">
        <div className="flex justify-between items-end mb-4 pb-4 border-b border-surface-100">
          <span className="text-surface-500 text-sm">Amount to Pay Now</span>
          <span className="text-3xl font-bold text-brand-600">{formatPaymentAmount(amounts.payNow)}</span>
        </div>
        <PaymentSummary
          totalAmount={pricing.projectTotal}
          amountPaid={0}
          paymentOption={selectedPaymentOption}
          compact
        />
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Payment Method</h3>
        <div className="space-y-2">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                method === m.id ? 'border-brand-500 bg-brand-50' : 'border-surface-200'
              }`}
            >
              <m.icon className="h-5 w-5 text-surface-600" />
              <span className="font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button type="button" onClick={handlePay} disabled={processing} className="btn-primary w-full">
        {processing ? 'Processing...' : `Pay ${formatPaymentAmount(amounts.payNow)}`}
      </button>
    </div>
  );
}
