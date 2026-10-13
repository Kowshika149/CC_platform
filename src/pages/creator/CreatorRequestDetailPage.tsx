import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PriceBreakdownView } from '../../components/PriceBreakdown';
import { formatCurrency, calculatePaymentAmounts } from '../../utils/pricing';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CreatorRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, acceptProject, declineProject } = useApp();
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [accepted, setAccepted] = useState(false);

  const project = getProject(id || '');
  if (!project) return <div>Project not found</div>;

  const amounts = calculatePaymentAmounts(project.totalAmount, project.paymentOption);

  const handleAccept = () => {
    acceptProject(project.id);
    setAccepted(true);
  };

  const handleDecline = () => {
    if (!declineReason) return;
    declineProject(project.id, declineReason);
    navigate('/creator/requests');
  };

  if (accepted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Project Accepted</h1>
        <p className="text-surface-500 mb-6">Workspace is now active</p>
        <button onClick={() => navigate(`/creator/projects/${project.id}/workspace`)} className="btn-primary w-full">
          Open Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Booking Request</h1>

      <div className="card mb-4">
        <h3 className="font-semibold">{project.requirement.title}</h3>
        <p className="text-sm text-surface-500 mt-1">From: {project.customerName}</p>
        <p className="text-sm text-surface-500">{project.requirement.categoryName} → {project.requirement.subcategoryName}</p>
        <p className="text-sm text-surface-500">Location: {project.requirement.city}</p>
      </div>

      <div className="card mb-4">
        <h3 className="font-semibold mb-3">Requirements</h3>
        <PriceBreakdownView breakdown={project.priceBreakdown} />
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Payment Option Selected</h3>
        <p className="text-sm">{project.paymentOption === 'full' ? 'Full Payment' : '30% Booking + 70% After Delivery'}</p>
        <p className="text-sm text-surface-500 mt-1">
          {formatCurrency(amounts.payNow)} now • {formatCurrency(amounts.payLater)} after delivery
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={handleAccept} className="btn-primary flex-1">
          <CheckCircle className="h-4 w-4" /> Accept Request
        </button>
        <button onClick={() => setShowDecline(true)} className="btn-secondary flex-1 text-red-600">
          <XCircle className="h-4 w-4" /> Decline
        </button>
      </div>

      {showDecline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-semibold mb-4">Reason for Declining</h3>
            <select className="input mb-4" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}>
              <option value="">Select reason</option>
              <option value="Not Available">Not Available</option>
              <option value="Budget Not Suitable">Budget Not Suitable</option>
              <option value="Location Not Suitable">Location Not Suitable</option>
              <option value="Project Not Suitable">Project Not Suitable</option>
              <option value="Other">Other</option>
            </select>
            <button onClick={handleDecline} className="btn-primary w-full">Confirm Decline</button>
          </div>
        </div>
      )}
    </div>
  );
}
