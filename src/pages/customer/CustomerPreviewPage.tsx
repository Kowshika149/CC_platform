import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { HorizontalProjectStepper } from '../../components/HorizontalProjectStepper';
import { EscrowBanner } from '../../components/EscrowBanner';
import { getProjectPricing } from '../../utils/projectPricing';
import { getEscrowSummary } from '../../utils/escrow';
import { formatPaymentAmount } from '../../utils/pricing';
import { SERVICE_LABELS } from '../../types';
import { X } from 'lucide-react';

const PREVIEW_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200';

export default function CustomerPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, approveDraft, requestRevision, raiseIssue } = useApp();

  const project = getProject(id || '');
  const [showRevision, setShowRevision] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [showIssue, setShowIssue] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [approved, setApproved] = useState(false);

  if (!project) return <div className="text-center py-12">Project not found</div>;

  const pricing = getProjectPricing(project);
  const escrow = getEscrowSummary(pricing, project.status);
  const previewDraft = project.drafts.find((d) => d.isPreview && !d.isFinal);
  const revisionsUsed = project.revisions.length;
  const revisionsAllowed = 2;

  const serviceTags = project.requirement.items
    .map((item) => SERVICE_LABELS[item.serviceId])
    .filter(Boolean)
    .slice(0, 2);

  const tags = serviceTags.length > 0
    ? serviceTags
    : [project.requirement.subcategoryName || project.requirement.categoryName];

  const handleApprove = () => {
    approveDraft(project.id);
    setApproved(true);
  };

  const handleRequestRevision = () => {
    if (!revisionText.trim()) return;
    requestRevision(project.id, revisionText);
    setShowRevision(false);
    setRevisionText('');
    navigate(`/customer/projects/${project.id}`);
  };

  const handleRaiseIssue = () => {
    if (!issueType) return;
    raiseIssue(project.id, {
      raisedBy: 'customer',
      type: issueType,
      description: issueType,
    });
    setShowIssue(false);
  };

  if (approved) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 animate-fade-in">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-bold mb-2">Preview Approved</h1>
        <p className="text-surface-500 mb-6">
          {pricing.paymentPlan === 'split_30_70' && pricing.remainingAmount > 0
            ? `The remaining ${pricing.remainingAmount > 0 ? '70%' : ''} payment will be collected before final delivery.`
            : 'The creator will prepare your final high-resolution files.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {pricing.paymentPlan === 'split_30_70' && pricing.remainingAmount > 0 && (
            <Link to={`/customer/projects/${project.id}/payment`} className="btn-primary">
              Pay Remaining 70%
            </Link>
          )}
          <Link to={`/customer/projects/${project.id}`} className="btn-secondary">
            Back to Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <EscrowBanner escrow={escrow} tags={tags} variant="light" />
      <HorizontalProjectStepper status={project.status} />

      <div className="rounded-2xl border border-surface-200 overflow-hidden bg-white shadow-card">
        <div className="bg-brand-600 px-6 py-5 text-center text-white">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">Preview Ready</p>
          <h1 className="text-xl sm:text-2xl font-bold mt-1">Preview v1 is in for review</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-0">
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-surface-100">
            <div className="relative rounded-xl overflow-hidden bg-surface-900 aspect-video">
              <img
                src={previewDraft?.thumbnailUrl || PREVIEW_IMAGE}
                alt="Preview"
                className="w-full h-full object-cover opacity-80"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 80px,
                    rgba(255,255,255,0.08) 80px,
                    rgba(255,255,255,0.08) 82px
                  )`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/25 text-4xl sm:text-5xl font-black tracking-[0.3em] rotate-[-18deg] select-none">
                  CC HUB PREVIEW
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md">
                480p · Not downloadable
              </div>
            </div>
            <p className="text-sm text-surface-500 mt-4">
              {previewDraft?.description || `${project.creatorName} uploaded a watermarked draft. Final high-resolution files unlock after approval.`}
            </p>
          </div>

          <div className="p-6 bg-surface-50/50">
            <h3 className="text-sm font-semibold text-surface-700 mb-4">Your actions</h3>
            <div className="space-y-3">
              <button type="button" onClick={handleApprove} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm tracking-wide transition">
                APPROVE
              </button>
              <button
                type="button"
                onClick={() => setShowRevision(true)}
                className="w-full py-3.5 rounded-xl border-2 border-surface-300 bg-white hover:bg-surface-50 text-surface-800 font-bold text-sm tracking-wide transition"
              >
                REQUEST REVISION
              </button>
              <button
                type="button"
                onClick={() => setShowIssue(true)}
                className="w-full py-2 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                RAISE AN ISSUE
              </button>
            </div>
            <p className="text-xs text-surface-500 mt-6 leading-relaxed">
              {revisionsUsed} of {revisionsAllowed} revisions used · payment still held
            </p>
            {pricing.paymentPlan === 'split_30_70' && (
              <p className="text-xs text-amber-700 mt-2 font-medium">
                {escrow.remaining > 0 ? `${formatPaymentAmount(escrow.remaining)} remaining to pay` : 'Payment held securely'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to={`/customer/projects/${project.id}/workspace`} className="text-sm text-brand-600 hover:underline">
          Open full workspace →
        </Link>
      </div>

      {showRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Request Revision</h3>
              <button type="button" onClick={() => setShowRevision(false)}><X className="h-5 w-5" /></button>
            </div>
            <textarea
              className="input min-h-[100px] mb-4"
              placeholder="What would you like changed?"
              value={revisionText}
              onChange={(e) => setRevisionText(e.target.value)}
            />
            <button type="button" onClick={handleRequestRevision} className="btn-primary w-full">
              Submit Revision Request
            </button>
          </div>
        </div>
      )}

      {showIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-semibold mb-4">Raise an Issue</h3>
            <select className="input mb-4" value={issueType} onChange={(e) => setIssueType(e.target.value)}>
              <option value="">Select issue type</option>
              <option value="Creator has not started">Creator has not started</option>
              <option value="Creator missed deadline">Creator missed deadline</option>
              <option value="Work does not match requirement">Work does not match requirement</option>
              <option value="Communication issue">Communication issue</option>
              <option value="Other">Other</option>
            </select>
            <button type="button" onClick={handleRaiseIssue} className="btn-primary w-full">Submit Issue</button>
          </div>
        </div>
      )}
    </div>
  );
}
