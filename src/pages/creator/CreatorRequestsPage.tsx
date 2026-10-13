import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/pricing';
import { isProjectForCreator } from '../../utils/creatorAccount';

export default function CreatorRequestsPage() {
  const { projects } = useApp();
  const { user } = useAuth();
  const requests = projects.filter((p) =>
    isProjectForCreator(p, user?.id, user?.professionalName) &&
    ['waiting_acceptance', 'request_sent'].includes(p.status)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Project Requests</h1>
      {requests.length === 0 ? (
        <div className="card text-center py-12 text-surface-500">
          <p>No pending requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((p) => (
            <Link key={p.id} to={`/creator/requests/${p.id}`} className="card-hover block">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{p.requirement.title}</h3>
                  <p className="text-sm text-surface-500">{p.customerName} • {p.requirement.city}</p>
                  <p className="text-sm text-surface-500">{p.requirement.categoryName} → {p.requirement.subcategoryName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-600">{formatCurrency(p.totalAmount)}</p>
                  <span className="badge-brand mt-1">New Request</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
