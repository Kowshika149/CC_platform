import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/pricing';
import { getProjectPricing } from '../../utils/projectPricing';
import { canDownloadFinalFiles } from '../../utils/projectDelivery';

const customerTabs = [
  { key: 'requests', label: 'Requests', statuses: ['waiting_acceptance', 'request_sent'] },
  { key: 'active', label: 'Active', statuses: ['accepted', 'shoot_scheduled', 'shoot_completed', 'draft_submitted', 'revision_requested', 'draft_approved', 'ready_for_final_delivery', 'final_payment_pending'] },
  { key: 'review', label: 'Awaiting Review', statuses: ['draft_submitted'] },
  { key: 'payment', label: 'Payment Pending', statuses: ['final_payment_pending'] },
  { key: 'completed', label: 'Completed', statuses: ['completed', 'final_delivered'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['declined', 'cancelled'] },
];

export default function CustomerProjectsPage() {
  const { projects } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const myProjects = projects.filter((p) => p.customerId === user?.id);

  const filtered = activeTab === 'all'
    ? myProjects
    : myProjects.filter((p) => {
        const tab = customerTabs.find((t) => t.key === activeTab);
        return tab?.statuses.includes(p.status);
      });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Projects</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'bg-brand-100 text-brand-700' : 'text-surface-500'}`}>All</button>
        {customerTabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === t.key ? 'bg-brand-100 text-brand-700' : 'text-surface-500'}`}>{t.label}</button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="card text-center py-12 text-surface-500">
            <p>No projects yet.</p>
            <Link to="/customer/home" className="btn-primary mt-4 inline-flex">Start a New Project</Link>
          </div>
        )}
        {filtered.map((p) => {
          const pricing = getProjectPricing(p);
          const canDownload = canDownloadFinalFiles(p);
          const previewLink = ['draft_submitted', 'revision_requested'].includes(p.status)
            ? `/customer/projects/${p.id}/preview`
            : canDownload
              ? `/customer/projects/${p.id}/delivery`
              : `/customer/projects/${p.id}`;
          return (
          <Link key={p.id} to={previewLink} className="card-hover block">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.requirement.title}</h3>
                <p className="text-sm text-surface-500">{p.creatorName} • {p.requirement.categoryName}</p>
                <div className="mt-2">
                  {pricing.remainingAmount > 0 ? (
                    <p className="text-xs text-amber-700">{formatCurrency(pricing.remainingAmount)} remaining to pay</p>
                  ) : pricing.amountPaid > 0 ? (
                    <p className="text-xs text-emerald-600">{formatCurrency(pricing.amountPaid)} paid</p>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${p.workspaceActive ? 'badge-success' : 'badge-warning'}`}>
                  {p.status.replace(/_/g, ' ')}
                </span>
                <p className="text-sm font-semibold mt-1">{formatCurrency(pricing.projectTotal)}</p>
                {canDownload && (
                  <p className="text-xs text-brand-600 font-medium mt-1">Download files →</p>
                )}
                {pricing.paymentPlan === 'split_30_70' && pricing.remainingAmount > 0 && (
                  <p className="text-xs text-surface-500 mt-0.5">
                    {formatCurrency(pricing.remainingAmount)} remaining to pay
                  </p>
                )}
                {pricing.amountPaid > 0 && (
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {formatCurrency(pricing.amountPaid)} paid
                  </p>
                )}
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}