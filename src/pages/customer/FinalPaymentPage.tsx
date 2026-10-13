import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatPaymentAmount } from '../../utils/pricing';
import { getProjectPricing } from '../../utils/projectPricing';
import { PaymentSummary } from '../../components/PaymentSummary';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function FinalPaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, payRemaining } = useApp();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const project = getProject(id || '');
  if (!project) return <div>Project not found</div>;

  const pricing = getProjectPricing(project);
  const remaining = pricing.remainingAmount;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      payRemaining(project.id);
      setProcessing(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12 animate-fade-in">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="page-title">Payment Successful ✓</h1>
        <p className="text-surface-500 mb-6">Final payment of {formatPaymentAmount(remaining)} completed</p>
        <button type="button" onClick={() => navigate(`/customer/projects/${project.id}/workspace`)} className="btn-primary w-full">
          Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Complete Remaining Payment</h1>
        <p className="page-subtitle">70% after final delivery</p>
      </div>

      <div className="card-elevated mb-6">
        <p className="text-surface-500 text-sm mb-1">Amount Due Now</p>
        <p className="text-3xl font-bold text-brand-600">{formatPaymentAmount(remaining)}</p>
        <p className="text-xs text-surface-500 mt-2">Project: {project.requirement.title}</p>
        <div className="mt-5 pt-5 border-t border-surface-100">
          <PaymentSummary
            totalAmount={pricing.projectTotal}
            amountPaid={pricing.amountPaid}
            paymentOption={pricing.paymentPlan}
            compact
          />
        </div>
      </div>

      <button type="button" onClick={handlePay} disabled={processing} className="btn-primary w-full">
        {processing ? 'Processing...' : `Pay ${formatPaymentAmount(remaining)}`}
      </button>
    </div>
  );
}
