import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentSummary } from '../../components/PaymentSummary';
import { formatPaymentAmount } from '../../utils/pricing';
import { getProjectPricing } from '../../utils/projectPricing';
import { Shield, CreditCard } from 'lucide-react';

export default function PaymentsPage() {
  const { projects } = useApp();
  const { user } = useAuth();

  const myPayments = projects.filter((p) => p.customerId === user?.id);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Track your project payments and protected transactions</p>
      </div>

      {myPayments.length === 0 ? (
        <div className="card text-center py-16">
          <CreditCard className="h-12 w-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No payment history yet</p>
        </div>
      ) : (
        <div className="space-y-5">
          {myPayments.map((p) => {
            const pricing = getProjectPricing(p);
            const remaining = pricing.remainingAmount;
            return (
              <div key={p.id} className="card-elevated">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
                  <div>
                    <p className="font-semibold text-lg">{p.requirement.title}</p>
                    <p className="text-sm text-surface-500 mt-0.5">{p.creatorName}</p>
                    <span className={`badge mt-2 ${remaining === 0 && pricing.amountPaid > 0 ? 'badge-success' : 'badge-warning'}`}>
                      {remaining === 0 && pricing.amountPaid > 0 ? 'Fully Paid' : p.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-surface-500 uppercase tracking-wide">Project Total</p>
                    <p className="text-2xl font-bold">{formatPaymentAmount(pricing.projectTotal)}</p>
                  </div>
                </div>
                <PaymentSummary
                  totalAmount={pricing.projectTotal}
                  amountPaid={pricing.amountPaid}
                  paymentOption={pricing.paymentPlan}
                  compact
                  showProtected={false}
                />
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
                  <Shield className="h-3.5 w-3.5" />
                  Protected Payment — {pricing.paymentPlan === 'full' ? 'Full Payment' : '30% + 70%'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
