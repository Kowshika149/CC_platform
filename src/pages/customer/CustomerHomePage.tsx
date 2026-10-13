import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getProjectPricing } from '../../utils/projectPricing';
import { canDownloadFinalFiles } from '../../utils/projectDelivery';
import { getEscrowSummary } from '../../utils/escrow';
import { PaymentStatusCard } from '../../components/PaymentStatusCard';
import { formatPaymentAmount } from '../../utils/pricing';
import { PlusCircle, Search, FolderOpen, Sparkles, Shield } from 'lucide-react';

export default function CustomerHomePage() {
  const { user } = useAuth();
  const { projects } = useApp();

  const myActive = projects.filter(
    (p) => p.customerId === user?.id && !['completed', 'declined', 'cancelled'].includes(p.status),
  );
  const escrowTotal = myActive.reduce((sum, p) => {
    const pricing = getProjectPricing(p);
    const escrow = getEscrowSummary(pricing, p.status);
    return sum + escrow.remaining;
  }, 0);
  const paidTotal = myActive.reduce((sum, p) => sum + getProjectPricing(p).amountPaid, 0);
  const readyToDownload = projects.filter(
    (p) => p.customerId === user?.id && canDownloadFinalFiles(p),
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Hi {user?.fullName || 'there'} 👋</h1>
        <p className="page-subtitle">What would you like to create today?</p>
      </div>

      <Link to="/customer/start" className="block mb-6 group">
        <div className="card-elevated bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-5 p-2">
            <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
              <PlusCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">New project</p>
              <h3 className="text-lg font-bold">Start a New Project</h3>
              <p className="text-sm text-white/70 mt-0.5">Tell us who the content is for and what you need</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/customer/find-creators" className="stat-card group">
          <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-3 group-hover:bg-brand-200 transition">
            <Search className="h-5 w-5" />
          </div>
          <p className="font-semibold">Browse Verified Creators</p>
          <p className="text-sm text-surface-500 mt-1">Explore talent by category and city</p>
        </Link>
        <Link to="/customer/projects" className="stat-card group">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition">
            <FolderOpen className="h-5 w-5" />
          </div>
          <p className="font-semibold">My Projects</p>
          <p className="text-sm text-surface-500 mt-1">Track active and completed work</p>
        </Link>
      </div>

      <div className="mt-8 alert-info flex items-start gap-3">
        <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
        <p>Protected payments keep your money secure until you approve the final delivery.</p>
      </div>

      {readyToDownload.length > 0 && (
        <div className="mt-6 card border-brand-200 bg-brand-50/40">
          <h3 className="font-semibold text-brand-900 mb-3">Ready to Download</h3>
          <div className="space-y-2">
            {readyToDownload.map((p) => (
              <Link
                key={p.id}
                to={`/customer/projects/${p.id}/delivery`}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-brand-100 hover:border-brand-200 transition"
              >
                <div>
                  <p className="font-medium">{p.requirement.title}</p>
                  <p className="text-sm text-surface-500">{p.creatorName}</p>
                </div>
                <span className="text-sm font-semibold text-brand-600">Download All →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {myActive.length > 0 && (
        <div className="mt-6 card bg-emerald-50 border-emerald-100">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900">Payment held securely</p>
              <p className="text-sm text-emerald-800 mt-1">
                You have paid {formatPaymentAmount(paidTotal)} across {myActive.length} active project{myActive.length > 1 ? 's' : ''}.
                {escrowTotal > 0 && ` ${formatPaymentAmount(escrowTotal)} remaining to be paid.`}
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {myActive.slice(0, 4).map((p) => {
                  const pricing = getProjectPricing(p);
                  const escrow = getEscrowSummary(pricing, p.status);
                  return (
                    <Link key={p.id} to={`/customer/projects/${p.id}`}>
                      <PaymentStatusCard escrow={escrow} role="seeker" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
