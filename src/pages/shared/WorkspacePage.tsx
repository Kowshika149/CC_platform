import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ProjectTimeline } from '../../components/ProjectTimeline';
import { PriceBreakdownView } from '../../components/PriceBreakdown';
import { PaymentSummary } from '../../components/PaymentSummary';
import { formatPaymentAmount } from '../../utils/pricing';
import { getProjectPricing } from '../../utils/projectPricing';
import { canDownloadFinalFiles } from '../../utils/projectDelivery';
import {
  Upload, CheckCircle, AlertTriangle, MessageSquare, Download,
  Clock, FileText, Send, X, XCircle,
} from 'lucide-react';

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function getStatusBadge(project: { workspaceActive: boolean; status: string }, isCreator: boolean) {
  if (project.workspaceActive) return formatStatus(project.status);
  if (isCreator) return 'Awaiting Your Acceptance';
  return 'Waiting for Creator Acceptance';
}

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getProject, approveDraft, requestRevision, raiseIssue, sendMessage,
    completeShoot, uploadDraft, markReadyForFinalDelivery,
    uploadFinal, completeProject, payRemaining,
    acceptProject, declineProject,
  } = useApp();

  const project = getProject(id || '');
  const [tab, setTab] = useState<'overview' | 'files' | 'messages' | 'activity'>('overview');
  const [message, setMessage] = useState('');
  const [showRevision, setShowRevision] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [showIssue, setShowIssue] = useState(false);
  const [issueType, setIssueType] = useState('');
  const [draftName, setDraftName] = useState('');
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  if (!project) return <div className="text-center py-12">Project not found</div>;

  const isPendingRequest = !project.workspaceActive && ['waiting_acceptance', 'request_sent'].includes(project.status);

  const pricing = getProjectPricing(project);
  const breakdownItems = project.priceBreakdown?.items ?? pricing.priceBreakdown?.items ?? [];

  const isCreator = user?.role === 'creator';
  const isCustomer = user?.role === 'seeker';
  const previewDrafts = project.drafts.filter((d) => d.isPreview && !d.isFinal);
  const finalFiles = project.drafts.filter((d) => d.isFinal);
  const pendingRevisions = project.revisions.filter((r) => r.status === 'requested');
  const latestRevision = pendingRevisions[pendingRevisions.length - 1];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessage(project.id, message);
    setMessage('');
  };

  const handleRequestRevision = () => {
    if (!revisionText.trim()) return;
    requestRevision(project.id, revisionText);
    setShowRevision(false);
    setRevisionText('');
  };

  const handleRaiseIssue = () => {
    if (!issueType) return;
    raiseIssue(project.id, {
      raisedBy: isCustomer ? 'customer' : 'creator',
      type: issueType,
      description: issueType,
    });
    setShowIssue(false);
  };

  const handleUploadDraft = () => {
    uploadDraft(project.id, draftName ? {
      name: draftName || 'Draft Preview',
      type: 'video',
      description: 'Watermarked preview — low resolution',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'creator',
      isPreview: true,
      isFinal: false,
    } : undefined);
    setDraftName('');
  };

  const handleUploadFinal = () => {
    uploadFinal(project.id);
  };

  const handlePayRemaining = () => {
    payRemaining(project.id);
    navigate(`/customer/projects/${project.id}/payment`);
  };

  const handleAcceptRequest = () => {
    acceptProject(project.id);
  };

  const handleDeclineRequest = () => {
    if (!declineReason) return;
    declineProject(project.id, declineReason);
    navigate(isCreator ? '/creator/requests' : '/customer/projects');
  };

  const tabs = ['overview', 'files', 'messages', 'activity'] as const;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.requirement.title}</h1>
          <p className="text-surface-500 text-sm">
            {isCustomer ? `Creator: ${project.creatorName}` : `Customer: ${project.customerName}`}
          </p>
        </div>
        <span className={`badge ${project.workspaceActive ? 'badge-success' : 'badge-warning'}`}>
          {getStatusBadge(project, isCreator)}
        </span>
      </div>

      {isPendingRequest && (
        <div className="card mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              {isCreator ? (
                <>
                  <p className="font-medium text-amber-800">New Booking Request</p>
                  <p className="text-sm text-amber-700 mt-1">
                    {project.customerName} has booked you for this project. Review the details and accept or decline to activate the workspace.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={handleAcceptRequest} className="btn-primary flex-1">
                      <CheckCircle className="h-4 w-4" /> Accept Request
                    </button>
                    <button type="button" onClick={() => setShowDecline(true)} className="btn-secondary flex-1 text-red-600">
                      <XCircle className="h-4 w-4" /> Decline
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium text-amber-800">Waiting for Creator Acceptance</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Project activities are disabled until {project.creatorName} accepts your booking request.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-pill ${tab === t ? 'tab-pill-active' : 'tab-pill-inactive'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tab === 'overview' && (
            <>
              <div className="card">
                <h3 className="font-semibold mb-3">Requirements</h3>
                <p className="text-sm text-surface-500">{project.requirement.categoryName} → {project.requirement.subcategoryName}</p>
                <ul className="mt-2 space-y-1">
                  {breakdownItems.map((item) => (
                    <li key={item.serviceId} className="text-sm">{item.label} — {item.customQuoteRequired ? 'Custom Quote' : formatPaymentAmount(item.total)}</li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-surface-100">
                  <PriceBreakdownView breakdown={project.priceBreakdown ?? pricing.priceBreakdown} />
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-4">
                  {isCreator ? 'Payment & Earnings' : 'Payment Status'}
                </h3>
                {isCreator && (
                  <p className="text-xs text-surface-500 mb-3">
                    Customer payment is held securely. You&apos;ll receive earnings as per the selected payment terms.
                  </p>
                )}
                <PaymentSummary
                  totalAmount={pricing.projectTotal}
                  amountPaid={pricing.amountPaid}
                  paymentOption={pricing.paymentPlan}
                  compact
                />
              </div>

              {isCreator && project.workspaceActive && project.status === 'revision_requested' && latestRevision && (
                <div className="card border-amber-200 bg-amber-50/50 space-y-4">
                  <div>
                    <h3 className="font-semibold text-amber-900">Revision Requested</h3>
                    <p className="text-sm text-amber-800 mt-1">
                      {project.customerName} asked for changes on {new Date(latestRevision.requestedAt).toLocaleDateString()}.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-amber-100 p-4">
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-2">Customer feedback</p>
                    <p className="text-sm text-surface-800 whitespace-pre-wrap">{latestRevision.description}</p>
                  </div>
                  {pendingRevisions.length > 1 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-surface-500">All revision requests</p>
                      {pendingRevisions.map((r) => (
                        <div key={r.id} className="text-sm text-surface-700 p-3 rounded-lg bg-white border border-surface-100">
                          {r.description}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Revised draft name (optional)"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                    />
                    <button onClick={handleUploadDraft} className="btn-primary shrink-0">
                      <Upload className="h-4 w-4" /> Re-upload Draft
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {isCreator && project.workspaceActive && (
                <div className="card space-y-3">
                  <h3 className="font-semibold">Creator Actions</h3>
                  {['accepted', 'shoot_scheduled'].includes(project.status) && !project.shootSchedule?.completed && (
                    <button onClick={() => completeShoot(project.id)} className="btn-secondary w-full">
                      <CheckCircle className="h-4 w-4" /> Mark Shoot Day Complete
                    </button>
                  )}
                  {['shoot_completed', 'revision_requested'].includes(project.status) && project.status !== 'revision_requested' && (
                    <div className="flex gap-2">
                      <input className="input flex-1" placeholder="Draft file name" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                      <button onClick={handleUploadDraft} className="btn-primary">
                        <Upload className="h-4 w-4" /> Upload Draft
                      </button>
                    </div>
                  )}
                  {project.status === 'draft_approved' && (
                    <button onClick={() => markReadyForFinalDelivery(project.id)} className="btn-primary w-full">
                      Mark Ready for Final Delivery
                    </button>
                  )}
                  {(project.status === 'ready_for_final_delivery' || (project.status === 'final_payment_pending' && pricing.amountPaid >= pricing.projectTotal)) && (
                    <button onClick={handleUploadFinal} className="btn-primary w-full">
                      <Upload className="h-4 w-4" /> Upload Final Files
                    </button>
                  )}
                  {project.status === 'final_delivered' && (
                    <button onClick={() => completeProject(project.id)} className="btn-primary w-full">
                      Mark Project Completed
                    </button>
                  )}
                </div>
              )}

              {isCustomer && project.workspaceActive && (
                <div className="card space-y-3">
                  <h3 className="font-semibold">Customer Actions</h3>
                  {['draft_submitted', 'revision_requested'].includes(project.status) && (
                    <button onClick={() => navigate(`/customer/projects/${project.id}/preview`)} className="btn-primary w-full">
                      <CheckCircle className="h-4 w-4" /> Review Preview
                    </button>
                  )}
                  {project.status === 'draft_submitted' && (
                    <>
                      <button onClick={() => approveDraft(project.id)} className="btn-primary w-full">
                        <CheckCircle className="h-4 w-4" /> Approve Draft
                      </button>
                      <button onClick={() => setShowRevision(true)} className="btn-secondary w-full">
                        Request Revision
                      </button>
                      <button onClick={() => setShowIssue(true)} className="btn-ghost w-full text-red-600">
                        <AlertTriangle className="h-4 w-4" /> Raise Issue
                      </button>
                    </>
                  )}
                  {project.status === 'final_payment_pending' && (
                    <button onClick={handlePayRemaining} className="btn-primary w-full">
                      Complete Remaining Payment ({formatPaymentAmount(pricing.remainingAmount)})
                    </button>
                  )}
                  {canDownloadFinalFiles(project) && (
                    <button onClick={() => navigate(`/customer/projects/${project.id}/delivery`)} className="btn-primary w-full">
                      <Download className="h-4 w-4" /> Download Final Files
                    </button>
                  )}
                  {project.status === 'final_delivered' && (
                    <button onClick={() => completeProject(project.id)} className="btn-secondary w-full">
                      Confirm & Complete Project
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {tab === 'files' && (
            <div className="card">
              <h3 className="font-semibold mb-4">Project Files</h3>
              {previewDrafts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-surface-500 mb-2">Draft / Preview</h4>
                  {previewDrafts.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 mb-2">
                      <FileText className="h-5 w-5 text-brand-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{f.name}</p>
                        <p className="text-xs text-surface-500">{f.description}</p>
                      </div>
                      <span className="badge-warning text-xs">Preview</span>
                    </div>
                  ))}
                </div>
              )}
              {finalFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-surface-500 mb-2">Final Delivery</h4>
                  {finalFiles.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 mb-2">
                      <Download className="h-5 w-5 text-emerald-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{f.name}</p>
                        <p className="text-xs text-surface-500">{f.description}</p>
                      </div>
                      <button className="btn-primary text-xs py-1.5">Download</button>
                    </div>
                  ))}
                </div>
              )}
              {previewDrafts.length === 0 && finalFiles.length === 0 && (
                <p className="text-surface-500 text-sm text-center py-8">No files uploaded yet</p>
              )}
            </div>
          )}

          {tab === 'messages' && (
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Project Messages
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {project.messages.length === 0 && (
                  <p className="text-sm text-surface-500 text-center py-4">No messages yet</p>
                )}
                {project.messages.map((m) => (
                  <div key={m.id} className={`p-3 rounded-xl text-sm ${m.senderId === user?.id ? 'bg-brand-50 ml-8' : 'bg-surface-50 mr-8'}`}>
                    <p className="font-medium text-xs text-surface-500">{m.senderName}</p>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              {project.workspaceActive && (
                <div className="flex gap-2">
                  <input className="input flex-1" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                  <button onClick={handleSendMessage} className="btn-primary"><Send className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="card">
              <h3 className="font-semibold mb-4">Project Activity</h3>
              <div className="space-y-3">
                {project.activity.map((a) => (
                  <div key={a.id} className="flex gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                    <div>
                      <p>{a.description}</p>
                      <p className="text-xs text-surface-400">{new Date(a.timestamp).toLocaleString()} — {a.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <ProjectTimeline status={project.status} />
          </div>
          {(project.shootSchedule || project.requirement.preferredShootDate) && (
            <div className="card mt-4">
              <h4 className="font-semibold text-sm mb-2">Shoot Day</h4>
              <p className="text-xs text-surface-500 mb-2">
                {isCreator ? "Customer's booked date" : 'Your booked shoot day'}
              </p>
              <p className="text-sm font-medium">
                {project.shootSchedule?.date || project.requirement.preferredShootDate}
                {project.shootSchedule?.time ? ` • ${project.shootSchedule.time}` : ''}
              </p>
              <p className="text-sm text-surface-500">
                {project.shootSchedule?.location || project.requirement.city}
              </p>
              {project.shootSchedule?.completed ? (
                <p className="text-sm text-emerald-600 font-medium mt-2">✓ Shoot Day Complete</p>
              ) : isCreator ? (
                <p className="text-sm text-amber-600 mt-2">Mark complete after the shoot</p>
              ) : (
                <p className="text-sm text-amber-600 mt-2">Creator will confirm after the shoot</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Request Revision</h3>
              <button onClick={() => setShowRevision(false)}><X className="h-5 w-5" /></button>
            </div>
            <textarea className="input min-h-[100px] mb-4" placeholder="What would you like changed?" value={revisionText} onChange={(e) => setRevisionText(e.target.value)} />
            <button onClick={handleRequestRevision} className="btn-primary w-full">Submit Revision Request</button>
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
            <p className="text-xs text-surface-500 mb-4">Resolution will depend on the agreed project terms and applicable platform policies.</p>
            <button onClick={handleRaiseIssue} className="btn-primary w-full">Submit Issue</button>
          </div>
        </div>
      )}

      {showDecline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold">Decline Request</h3>
              <button type="button" onClick={() => setShowDecline(false)}><X className="h-5 w-5" /></button>
            </div>
            <select className="input mb-4" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}>
              <option value="">Select reason</option>
              <option value="Not Available">Not Available</option>
              <option value="Budget Not Suitable">Budget Not Suitable</option>
              <option value="Location Not Suitable">Location Not Suitable</option>
              <option value="Project Not Suitable">Project Not Suitable</option>
              <option value="Other">Other</option>
            </select>
            <button type="button" onClick={handleDeclineRequest} className="btn-primary w-full">Confirm Decline</button>
          </div>
        </div>
      )}

    </div>
  );
}
