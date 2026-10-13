import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatPaymentAmount, getRemainingAmount } from '../../utils/pricing';
import { isProjectForCreator } from '../../utils/creatorAccount';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function CreatorEarningsPage() {
  const { projects } = useApp();
  const { user } = useAuth();
  const myProjects = projects.filter((p) => isProjectForCreator(p, user?.id, user?.professionalName));
  const totalEarned = myProjects.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const pending = myProjects.reduce((sum, p) => sum + getRemainingAmount(p.totalAmount, p.amountPaid), 0);

  const stats = [
    { label: 'Total Earned', value: formatPaymentAmount(totalEarned), icon: DollarSign, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Pending Release', value: formatPaymentAmount(pending), icon: Clock, color: 'bg-amber-100 text-amber-700' },
    { label: 'Projects', value: myProjects.length.toString(), icon: TrendingUp, color: 'bg-brand-100 text-brand-700' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Earnings</h1>
        <p className="page-subtitle">Track your income and pending payments</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Recent Transactions</h3>
        {myProjects.length === 0 ? (
          <p className="text-surface-500 text-sm py-8 text-center">No transactions yet</p>
        ) : (
          <div className="space-y-1">
            {myProjects.map((p) => (
              <div key={p.id} className="flex justify-between items-center text-sm py-3 border-b border-surface-100 last:border-0">
                <div>
                  <p className="font-medium">{p.requirement.title}</p>
                  <p className="text-surface-500 text-xs">{p.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-600">+{formatPaymentAmount(p.amountPaid)}</span>
                  <p className="text-xs text-surface-400">of {formatPaymentAmount(p.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
