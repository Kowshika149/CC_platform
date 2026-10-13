import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/pricing';
import { getProjectPricing } from '../../utils/projectPricing';
import { isProjectForCreator } from '../../utils/creatorAccount';

const creatorTabs = [
  { key: 'new', label: 'New Requests', statuses: ['waiting_acceptance', 'request_sent'] },
  { key: 'active', label: 'Active', statuses: ['accepted', 'shoot_scheduled', 'shoot_completed', 'draft_submitted', 'revision_requested', 'draft_approved', 'ready_for_final_delivery', 'final_payment_pending'] },
  { key: 'draft', label: 'Draft Submitted', statuses: ['draft_submitted'] },
  { key: 'revision', label: 'Revision Requested', statuses: ['revision_requested'] },
  { key: 'payment', label: 'Final Payment Pending', statuses: ['final_payment_pending'] },
  { key: 'completed', label: 'Completed', statuses: ['completed', 'final_delivered'] },
];

export default function CreatorProjectsPage() {
  const { projects } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const myProjects = projects.filter((p) => isProjectForCreator(p, user?.id, user?.professionalName));

  const filtered = activeTab === 'all'
    ? myProjects
    : myProjects.filter((p) => {
        const tab = creatorTabs.find((t) => t.key === activeTab);
        return tab?.statuses.includes(p.status);
      });

  const getProjectLink = (p: typeof myProjects[0]) => {
    if (['waiting_acceptance', 'request_sent'].includes(p.status)) {
      return `/creator/requests/${p.id}`;
    }
    return `/creator/projects/${p.id}/workspace`;
  };

  const getStatusLabel = (p: typeof myProjects[0]) => {
    if (['waiting_acceptance', 'request_sent'].includes(p.status)) {
      return 'Awaiting Your Acceptance';
    }
    return p.status.replace(/_/g, ' ');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Projects</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'all' ? 'bg-brand-100 text-brand-700' : 'text-surface-500'}`}>All</button>
        {creatorTabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === t.key ? 'bg-brand-100 text-brand-700' : 'text-surface-500'}`}>{t.label}</button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.length === 0 && <div className="card text-center py-12 text-surface-500">No projects</div>}
        {filtered.map((p) => {
          const pricing = getProjectPricing(p);
          return (
            <Link key={p.id} to={getProjectLink(p)} className="card-hover block">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{p.requirement.title}</h3>
                  <p className="text-sm text-surface-500">Customer: {p.customerName}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${['waiting_acceptance', 'request_sent'].includes(p.status) ? 'badge-warning' : 'badge-neutral'}`}>
                    {getStatusLabel(p)}
                  </span>
                  <p className="text-sm font-semibold mt-1">{formatCurrency(pricing.projectTotal)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
