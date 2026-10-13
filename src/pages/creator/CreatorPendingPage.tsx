import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../constants/brand';
import { CheckCircle, Clock, Home, FileText, Lock, Shield, Image } from 'lucide-react';

export default function CreatorPendingPage() {
  const { user, updateUser } = useAuth();

  const isApproved = user?.creatorStatus === 'approved';

  const simulateApproval = () => {
    updateUser({
      creatorStatus: 'approved',
      onboardingComplete: true,
    });
  };

  if (isApproved) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 animate-fade-in">
        <div className="card-elevated">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="page-title">Congratulations!</h1>
          <p className="text-surface-600 mt-2 mb-1">Your creator profile has been verified.</p>
          <p className="text-surface-500 mb-8">Your profile is now live on {BRAND.displayName}.</p>
          <div className="text-left mb-6 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-emerald-600"><CheckCircle className="h-4 w-4" /> Appear in creator search</p>
            <p className="flex items-center gap-2 text-emerald-600"><CheckCircle className="h-4 w-4" /> Receive booking requests</p>
            <p className="flex items-center gap-2 text-emerald-600"><CheckCircle className="h-4 w-4" /> Verified Creator Badge active</p>
          </div>
          <Link to="/creator/dashboard" className="btn-primary w-full">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const timeline = [
    { label: 'Application Submitted', done: true, icon: CheckCircle },
    { label: 'Identity Verification', done: user?.creatorApplication?.identityComplete, active: !user?.creatorApplication?.identityComplete, icon: Shield },
    { label: 'Portfolio Review', done: user?.creatorApplication?.portfolioComplete, active: user?.creatorApplication?.identityComplete && !user?.creatorApplication?.portfolioComplete, icon: Image },
    { label: 'Profile Approval', done: false, active: user?.creatorStatus === 'under_review', icon: Lock },
    { label: 'Creator Account Activated', done: false, icon: CheckCircle },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card-elevated text-center mb-6">
        <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="page-title text-2xl">Application Submitted</h1>
        <p className="text-surface-500 mt-2">
          Your application is currently being reviewed.
        </p>
        <span className="badge-warning mt-4 inline-block text-sm px-4 py-1">PENDING VERIFICATION</span>
      </div>

      <div className="alert-warning mb-6">
        Your creator profile is pending verification. You will be notified once approved.
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold mb-6">Verification Timeline</h3>
        <div className="space-y-0">
          {timeline.map((step) => {
            const Icon = step.icon;
            const isDone = step.done;
            const isActive = step.active;
            return (
              <div key={step.label} className="timeline-step pb-6 last:pb-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  isDone ? 'bg-emerald-100 text-emerald-600' :
                  isActive ? 'bg-brand-100 text-brand-600 ring-2 ring-brand-200' :
                  'bg-surface-100 text-surface-400'
                }`}>
                  {isDone ? <CheckCircle className="h-4 w-4" /> : isActive ? <Clock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${isDone ? 'text-emerald-700' : isActive ? 'text-brand-700' : 'text-surface-400'}`}>
                    {isDone ? '✓ ' : isActive ? '⏳ ' : '○ '}{step.label}
                  </p>
                  {isActive && <p className="text-xs text-surface-500 mt-0.5">In progress</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mb-6 text-sm text-surface-600">
        <p className="flex items-center gap-2 text-surface-500">
          <Clock className="h-4 w-4" /> Estimated review time: Usually within 24–48 hours
        </p>
      </div>

      <div className="flex gap-3">
        <Link to="/creator/onboarding" className="btn-secondary flex-1"><FileText className="h-4 w-4" /> View Application</Link>
        <Link to="/" className="btn-ghost flex-1"><Home className="h-4 w-4" /> Back to Home</Link>
      </div>

      <div className="mt-8 p-4 rounded-2xl border border-dashed border-brand-300 bg-brand-50/50">
        <p className="text-xs text-brand-700 mb-2 font-medium">Prototype Demo: Simulate Approval</p>
        <button type="button" onClick={simulateApproval} className="btn-primary w-full text-sm">Approve Creator (Demo)</button>
      </div>
    </div>
  );
}
