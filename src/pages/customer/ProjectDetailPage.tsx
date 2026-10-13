import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriceBreakdownView } from '../../components/PriceBreakdown';
import { PaymentSummary } from '../../components/PaymentSummary';
import { getProjectPricing } from '../../utils/projectPricing';
import { getCreatorProfileId } from '../../utils/creatorAccount';
import { getEscrowSummary } from '../../utils/escrow';
import { EscrowBanner } from '../../components/EscrowBanner';
import { canDownloadFinalFiles } from '../../utils/projectDelivery';
import { SERVICE_LABELS } from '../../types';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, setBookingDraft, clearBookingDraft, setRequirementDraft } = useApp();
  const project = getProject(id || '');
  const [bookAgainMode, setBookAgainMode] = useState<'choice' | 'reuse' | 'new' | null>(null);

  if (!project) return <div>Project not found</div>;

  const pricing = getProjectPricing(project);
  const escrow = getEscrowSummary(pricing, project.status);
  const isCompleted = project.status === 'completed' || project.status === 'final_delivered';
  const canPreview = ['draft_submitted', 'revision_requested'].includes(project.status);
  const canDownload = canDownloadFinalFiles(project);

  const handleBookAgainSame = () => {
    setBookAgainMode('choice');
  };

  const creatorProfileId = getCreatorProfileId(project.creatorId);

  const handleReuseRequirements = () => {
    clearBookingDraft();
    setRequirementDraft({
      categoryId: project.requirement.categoryId,
      categoryName: project.requirement.categoryName,
      subcategoryId: project.requirement.subcategoryId,
      subcategoryName: project.requirement.subcategoryName,
      items: project.requirement.items,
      title: project.requirement.title,
      description: project.requirement.description,
      city: project.requirement.city,
      preferredShootDate: '',
      preferredDeliveryDate: project.requirement.preferredDeliveryDate,
      budgetPreference: project.requirement.budgetPreference,
      specialRequirements: project.requirement.specialRequirements,
    });
    setBookingDraft({
      creatorId: creatorProfileId,
      creatorName: project.creatorName,
      journey: 'direct_book',
      bookingType: pricing.bookingType,
      items: project.requirement.items,
      selectedPackageId: pricing.selectedPackageId,
      pricing: null,
      title: project.requirement.title,
      description: project.requirement.description,
      city: project.requirement.city,
      preferredShootDate: '',
      preferredDeliveryDate: project.requirement.preferredDeliveryDate,
      deliveryExpectation: 'Within 7 Days',
      categoryId: project.requirement.categoryId,
      categoryName: project.requirement.categoryName,
      subcategoryId: project.requirement.subcategoryId,
      subcategoryName: project.requirement.subcategoryName,
    });
    navigate(`/customer/book-creator/${creatorProfileId}`);
  };

  const handleFindAnother = () => {
    clearBookingDraft();
    setRequirementDraft({
      items: project.requirement.items,
      title: project.requirement.title,
      description: project.requirement.description,
      city: project.requirement.city,
      categoryId: project.requirement.categoryId,
      categoryName: project.requirement.categoryName,
      subcategoryId: project.requirement.subcategoryId,
      subcategoryName: project.requirement.subcategoryName,
    });
    navigate('/customer/find-creators');
  };

  const handleStartNewProject = () => {
    clearBookingDraft();
    setRequirementDraft({ items: [] });
    navigate('/customer/start');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="card-elevated mb-6">
        <h1 className="page-title text-2xl">{project.requirement.title}</h1>
        <p className="text-surface-500 mt-1">{project.creatorName}</p>
        <span className={`badge mt-3 ${project.workspaceActive ? 'badge-success' : 'badge-warning'}`}>
          {project.status.replace(/_/g, ' ')}
        </span>
      </div>

      <EscrowBanner escrow={escrow} variant="light" />

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <PaymentSummary
            totalAmount={pricing.projectTotal}
            amountPaid={pricing.amountPaid}
            paymentOption={pricing.paymentPlan}
          />
        </div>
        <div className="card">
          <h3 className="font-semibold text-sm text-surface-500 mb-2 uppercase tracking-wide">Category</h3>
          <p className="font-medium">{project.requirement.categoryName}</p>
          <p className="text-sm text-surface-500">{project.requirement.subcategoryName}</p>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold mb-4">Requirements</h3>
        <PriceBreakdownView breakdown={project.priceBreakdown} detailed />
      </div>

      {isCompleted && (
        <div className="card mb-6 bg-emerald-50 border-emerald-200">
          <h3 className="font-semibold text-emerald-800 mb-2">Project Completed</h3>
          <p className="text-sm text-emerald-700 mb-4">Thank you for using CC HUB!</p>
          {bookAgainMode === 'choice' ? (
            <div className="space-y-4">
              <p className="font-medium">Would you like to:</p>
              <div className="space-y-2">
                <button type="button" onClick={handleReuseRequirements} className="btn-primary w-full">
                  Use Previous Requirements
                </button>
                <button type="button" onClick={() => setBookAgainMode('new')} className="btn-secondary w-full">
                  Create New Requirements
                </button>
              </div>
              <div className="p-3 rounded-xl bg-white border border-emerald-100 text-sm">
                <p className="font-medium mb-1">Previous requirements:</p>
                <p>{project.requirement.title}</p>
                <ul className="mt-1 text-surface-600">
                  {project.requirement.items.map((i) => (
                    <li key={i.serviceId}>{i.quantity} {SERVICE_LABELS[i.serviceId]}</li>
                  ))}
                </ul>
                <p className="mt-1">{project.requirement.city}</p>
              </div>
              <button type="button" onClick={() => setBookAgainMode(null)} className="btn-ghost text-sm">Cancel</button>
            </div>
          ) : bookAgainMode === 'new' ? (
            <div className="space-y-3">
              <p className="text-sm">Add new requirements for {project.creatorName}</p>
              <button type="button" onClick={() => {
                clearBookingDraft();
                setBookingDraft({
                  creatorId: creatorProfileId,
                  creatorName: project.creatorName,
                  journey: 'direct_book',
                  bookingType: 'services',
                  items: [],
                  pricing: null,
                  title: '',
                  description: '',
                  city: project.requirement.city,
                  preferredShootDate: '',
                  preferredDeliveryDate: '',
                  deliveryExpectation: 'Within 7 Days',
                });
                navigate(`/customer/book-creator/${creatorProfileId}`);
              }} className="btn-primary w-full">Add New Requirements</button>
              <button type="button" onClick={() => setBookAgainMode(null)} className="btn-ghost text-sm">Back</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleBookAgainSame} className="btn-primary">Book Again</button>
              <button type="button" onClick={handleFindAnother} className="btn-secondary">Find Another Creator</button>
              <button type="button" onClick={handleStartNewProject} className="btn-secondary">Start New Project</button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {canPreview && (
          <Link to={`/customer/projects/${project.id}/preview`} className="btn-primary">
            Review Preview
          </Link>
        )}
        {canDownload && (
          <Link to={`/customer/projects/${project.id}/delivery`} className="btn-primary">
            Download Files
          </Link>
        )}
        {project.status === 'final_payment_pending' && (
          <Link to={`/customer/projects/${project.id}/payment`} className="btn-primary">
            Pay Remaining 70%
          </Link>
        )}
        <Link to={`/customer/projects/${project.id}/workspace`} className="btn-secondary">
          {project.workspaceActive ? 'Open Workspace' : 'View Project Status'}
        </Link>
      </div>
    </div>
  );
}
