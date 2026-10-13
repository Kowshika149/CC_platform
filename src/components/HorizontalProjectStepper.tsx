import type { ProjectStatus } from '../types';

const STEPS = [
  { key: 'booked', label: 'BOOKED' },
  { key: 'in_progress', label: 'IN PROGRESS' },
  { key: 'preview_ready', label: 'PREVIEW READY' },
  { key: 'approved', label: 'APPROVED' },
  { key: 'completed', label: 'COMPLETED' },
] as const;

function getActiveStep(status: ProjectStatus): number {
  const map: Partial<Record<ProjectStatus, number>> = {
    request_sent: 0,
    waiting_acceptance: 0,
    declined: 0,
    accepted: 1,
    shoot_scheduled: 1,
    shoot_completed: 1,
    issue_open: 1,
    draft_submitted: 2,
    revision_requested: 2,
    draft_approved: 3,
    ready_for_final_delivery: 3,
    final_payment_pending: 3,
    final_delivered: 4,
    completed: 4,
    cancelled: 0,
  };
  return map[status] ?? 0;
}

export function HorizontalProjectStepper({ status }: { status: ProjectStatus }) {
  const activeStep = getActiveStep(status);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
      {STEPS.map((step, index) => {
        const isDone = index < activeStep;
        const isCurrent = index === activeStep;
        const isPending = index > activeStep;

        return (
          <div
            key={step.key}
            className={`rounded-xl border px-3 py-3 text-center transition ${
              isCurrent
                ? 'border-brand-400 bg-brand-50 shadow-sm'
                : isDone
                  ? 'border-brand-200 bg-brand-50/60'
                  : 'border-surface-200 bg-white'
            }`}
          >
            <p className={`text-[10px] sm:text-xs font-bold tracking-wide ${
              isPending ? 'text-surface-400' : 'text-brand-800'
            }`}>
              {step.label}
            </p>
            <p className={`text-[10px] mt-1 ${
              isPending ? 'text-surface-400' : 'text-brand-600'
            }`}>
              {isDone || isCurrent ? 'Done' : 'Pending'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
