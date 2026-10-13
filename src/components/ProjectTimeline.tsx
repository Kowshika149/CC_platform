import { Check, Circle } from 'lucide-react';
import type { ProjectStatus } from '../types';

const STEPS = [
  { key: 'request_sent', label: 'Request Sent' },
  { key: 'accepted', label: 'Creator Accepted' },
  { key: 'shoot_day', label: 'Shoot Day Complete' },
  { key: 'draft_submitted', label: 'Draft Pending' },
  { key: 'draft_approved', label: 'Review' },
  { key: 'final_delivered', label: 'Final Delivery' },
  { key: 'completed', label: 'Completed' },
];

function getStepIndex(status: ProjectStatus): number {
  const map: Record<string, number> = {
    request_sent: 0, waiting_acceptance: 0, declined: 0,
    accepted: 2, shoot_scheduled: 2, shoot_completed: 3,
    draft_submitted: 3, revision_requested: 3,
    draft_approved: 4, ready_for_final_delivery: 4, final_payment_pending: 4,
    final_delivered: 5, completed: 6, cancelled: -1, issue_open: 3,
  };
  return map[status] ?? 0;
}

export function ProjectTimeline({ status }: { status: ProjectStatus }) {
  const current = getStepIndex(status);

  return (
    <div className="space-y-0">
      <h4 className="text-sm font-semibold text-surface-700 mb-4">PROJECT STATUS</h4>
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {done ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : active ? (
                <Circle className="h-5 w-5 text-brand-600 fill-brand-100" />
              ) : (
                <Circle className="h-5 w-5 text-surface-300" />
              )}
              {i < STEPS.length - 1 && (
                <div className={`w-0.5 h-6 ${done ? 'bg-emerald-300' : 'bg-surface-200'}`} />
              )}
            </div>
            <span className={`text-sm pb-4 ${active ? 'font-semibold text-brand-700' : done ? 'text-surface-600' : 'text-surface-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
