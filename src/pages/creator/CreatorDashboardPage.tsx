import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatPaymentAmount } from '../../utils/pricing';
import { isProjectForCreator } from '../../utils/creatorAccount';
import { getProjectPricing } from '../../utils/projectPricing';
import { getEscrowSummary } from '../../utils/escrow';
import { PaymentStatusCard } from '../../components/PaymentStatusCard';
import { Inbox, Briefcase, Clock, DollarSign, Camera, Shield, AlertCircle } from 'lucide-react';

export default function CreatorDashboardPage() {
  const { projects } = useApp();
  const { user } = useAuth();

  const myProjects = projects.filter((p) => isProjectForCreator(p, user?.id, user?.professionalName));
  const newRequests = myProjects.filter((p) => ['waiting_acceptance', 'request_sent'].includes(p.status));
  const active = myProjects.filter((p) => p.workspaceActive && !['completed', 'declined'].includes(p.status));
  const pendingReview = myProjects.filter((p) => p.status === 'draft_submitted');
  const revisionRequests = myProjects.filter((p) => p.status === 'revision_requested');
  const totalEarnings = myProjects.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const heldByPlatform = myProjects
    .filter((p) => !['completed', 'declined', 'cancelled'].includes(p.status))
    .reduce((sum, p) => sum + getProjectPricing(p).amountPaid, 0);

  const stats = [
    { label: 'New Requests', value: newRequests.length, icon: Inbox, color: 'bg-blue-100 text-blue-700', link: '/creator/requests' },
    { label: 'Active Projects', value: active.length, icon: Briefcase, color: 'bg-emerald-100 text-emerald-700', link: '/creator/projects' },
    { label: 'Pending Reviews', value: pendingReview.length, icon: Clock, color: 'bg-amber-100 text-amber-700', link: '/creator/projects' },
    { label: 'Earnings', value: formatPaymentAmount(totalEarnings), icon: DollarSign, color: 'bg-brand-100 text-brand-700', link: '/creator/earnings' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.fullName || 'Creator'} 👋</h1>
        <p className="page-subtitle">Here's what's happening with your projects</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.link} className="stat-card group">
            <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mb-3 transition group-hover:scale-105`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </Link>
        ))}
      </div>

      {newRequests.length > 0 && (
        <div className="card-elevated mb-6 border-brand-200/60">
          <h3 className="font-semibold mb-4">New Booking Requests</h3>
          {newRequests.map((p) => (
            <Link key={p.id} to={`/creator/requests/${p.id}`} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-50 transition border border-transparent hover:border-surface-100">
              <div>
                <p className="font-medium">{p.requirement.title}</p>
                <p className="text-sm text-surface-500">{p.customerName} • {formatPaymentAmount(p.totalAmount)}</p>
              </div>
              <span className="badge-brand">New</span>
            </Link>
          ))}
        </div>
      )}

      {revisionRequests.length > 0 && (
        <div className="card-elevated mb-6 border-amber-200/60">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" /> Revision Requests
          </h3>
          {revisionRequests.map((p) => {
            const latest = p.revisions.filter((r) => r.status === 'requested').pop();
            return (
              <Link key={p.id} to={`/creator/projects/${p.id}/workspace`} className="block p-4 rounded-xl hover:bg-surface-50 transition border border-transparent hover:border-surface-100 mb-2 last:mb-0">
                <p className="font-medium">{p.requirement.title}</p>
                <p className="text-sm text-surface-500 mt-1">{p.customerName}</p>
                {latest && (
                  <p className="text-sm text-amber-800 mt-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
                    &ldquo;{latest.description}&rdquo;
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {heldByPlatform > 0 && (
        <div className="card mb-6 bg-emerald-50 border-emerald-100">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900">Payments held securely</p>
              <p className="text-sm text-emerald-800 mt-1">
                {formatPaymentAmount(heldByPlatform)} is currently held by the platform across your active projects.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {myProjects
                  .filter((p) => !['completed', 'declined', 'cancelled'].includes(p.status) && getProjectPricing(p).amountPaid > 0)
                  .slice(0, 4)
                  .map((p) => {
                    const escrow = getEscrowSummary(getProjectPricing(p), p.status);
                    return (
                      <Link key={p.id} to={`/creator/projects/${p.id}/workspace`}>
                        <PaymentStatusCard escrow={escrow} role="creator" />
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Camera className="h-4 w-4 text-brand-600" /> Upcoming Shoot
        </h3>
        {active.find((p) => ['accepted', 'shoot_scheduled'].includes(p.status) && !p.shootSchedule?.completed && p.requirement.preferredShootDate) ? (
          active.filter((p) => ['accepted', 'shoot_scheduled'].includes(p.status) && !p.shootSchedule?.completed).map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-surface-50 border border-surface-100">
              <p className="font-medium">{p.requirement.title}</p>
              <p className="text-sm text-surface-500 mt-1">
                Shoot day: {p.shootSchedule?.date || p.requirement.preferredShootDate}
                {p.shootSchedule?.location || p.requirement.city ? ` • ${p.shootSchedule?.location || p.requirement.city}` : ''}
              </p>
            </div>
          ))
        ) : (
          <p className="text-surface-500 text-sm py-4 text-center">No upcoming shoot days</p>
        )}
      </div>
    </div>
  );
}
