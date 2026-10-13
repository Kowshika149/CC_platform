import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  Project, Notification, RequirementDraft, Message, ProjectStatus,
  PaymentOption, ProjectRequirement, Revision, Issue, ProjectFile, ShootSchedule,
  BookingDraft, ProjectPricing, ProjectReview,
} from '../types';
import { generateId, getRemainingAmount } from '../utils/pricing';
import { applyPaymentToPricing, syncProjectFromPricing } from '../utils/projectPricing';
import { getCreatorUserId, isNotificationForUser } from '../utils/creatorAccount';
import { buildPreviewDraftFile, buildDemoFinalFiles, toProjectFiles } from '../utils/demoFiles';
import { useAuth } from './AuthContext';

interface AppContextType {
  projects: Project[];
  notifications: Notification[];
  requirementDraft: RequirementDraft;
  setRequirementDraft: (draft: RequirementDraft | ((prev: RequirementDraft) => RequirementDraft)) => void;
  clearRequirementDraft: () => void;
  selectedCreatorId: string | null;
  setSelectedCreatorId: (id: string | null) => void;
  selectedPaymentOption: PaymentOption | null;
  setSelectedPaymentOption: (opt: PaymentOption | null) => void;
  bookingDraft: BookingDraft | null;
  setBookingDraft: (draft: BookingDraft | null | ((prev: BookingDraft | null) => BookingDraft | null)) => void;
  clearBookingDraft: () => void;
  createProject: (data: {
    creatorId: string;
    creatorName: string;
    requirement: ProjectRequirement;
    pricing: ProjectPricing;
  }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProject: (id: string) => Project | undefined;
  acceptProject: (id: string) => void;
  declineProject: (id: string, reason: string) => void;
  scheduleShoot: (id: string, schedule: ShootSchedule) => void;
  completeShoot: (id: string) => void;
  uploadDraft: (id: string, file?: Omit<ProjectFile, 'id'>) => void;
  requestRevision: (id: string, description: string) => void;
  acknowledgeRevision: (id: string, revisionId: string) => void;
  approveDraft: (id: string) => void;
  markReadyForFinalDelivery: (id: string) => void;
  payRemaining: (id: string) => void;
  uploadFinal: (id: string, file?: Omit<ProjectFile, 'id'>) => void;
  completeProject: (id: string) => void;
  submitProjectReview: (id: string, review: Omit<ProjectReview, 'submittedAt'>) => void;
  raiseIssue: (id: string, issue: Omit<Issue, 'id' | 'createdAt' | 'status'>) => void;
  sendMessage: (projectId: string, text: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

const PROJECTS_KEY = 'cc_projects';
const NOTIF_KEY = 'cc_notifications';
const DRAFT_KEY = 'cc_draft';
const BOOKING_KEY = 'cc_booking';

const emptyDraft: RequirementDraft = { items: [] };

function addActivity(project: Project, type: string, description: string, actor: string): Project {
  return {
    ...project,
    activity: [
      { id: generateId(), type, description, timestamp: new Date().toISOString(), actor },
      ...project.activity,
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem(PROJECTS_KEY);
    const parsed: Project[] = stored ? JSON.parse(stored) : [];
    return parsed.map((p) => ({ ...p, creatorId: getCreatorUserId(p.creatorId) }));
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem(NOTIF_KEY);
    const parsed: Notification[] = stored ? JSON.parse(stored) : [];
    return parsed.map((n) => ({ ...n, userId: getCreatorUserId(n.userId) }));
  });
  const [requirementDraft, setRequirementDraftState] = useState<RequirementDraft>(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    return stored ? JSON.parse(stored) : emptyDraft;
  });
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null);
  const [bookingDraft, setBookingDraftState] = useState<BookingDraft | null>(() => {
    const stored = localStorage.getItem(BOOKING_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(requirementDraft)); }, [requirementDraft]);
  useEffect(() => {
    if (bookingDraft) localStorage.setItem(BOOKING_KEY, JSON.stringify(bookingDraft));
    else localStorage.removeItem(BOOKING_KEY);
  }, [bookingDraft]);

  const setRequirementDraft = useCallback((draft: RequirementDraft | ((prev: RequirementDraft) => RequirementDraft)) => {
    setRequirementDraftState(draft);
  }, []);

  const clearRequirementDraft = useCallback(() => setRequirementDraftState(emptyDraft), []);

  const setBookingDraft = useCallback((draft: BookingDraft | null | ((prev: BookingDraft | null) => BookingDraft | null)) => {
    setBookingDraftState(draft);
  }, []);

  const clearBookingDraft = useCallback(() => setBookingDraftState(null), []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const n: Notification = { ...notif, id: generateId(), createdAt: new Date().toISOString(), read: false };
    setNotifications((prev) => [n, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const unreadCount = notifications.filter(
    (n) => !n.read && isNotificationForUser(n, user?.id || '', user?.role || 'seeker'),
  ).length;

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
  }, []);

  const getProject = useCallback((id: string) => projects.find((p) => p.id === id), [projects]);

  const createProject = useCallback((data: {
    creatorId: string; creatorName: string; requirement: ProjectRequirement;
    pricing: ProjectPricing;
  }) => {
    const creatorUserId = getCreatorUserId(data.creatorId);
    const project: Project = {
      id: generateId(),
      customerId: user?.id || '',
      customerName: user?.fullName || 'Customer',
      creatorId: creatorUserId,
      creatorName: data.creatorName,
      requirement: data.requirement,
      pricing: data.pricing,
      priceBreakdown: data.pricing.priceBreakdown,
      totalAmount: data.pricing.projectTotal,
      paymentOption: data.pricing.paymentPlan,
      amountPaid: data.pricing.amountPaid,
      status: 'waiting_acceptance',
      workspaceActive: false,
      drafts: [],
      revisions: [],
      issues: [],
      messages: [],
      activity: [{
        id: generateId(), type: 'request_sent',
        description: 'Booking request sent to creator',
        timestamp: new Date().toISOString(), actor: user?.fullName || 'Customer',
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, project]);
    addNotification({
      userId: creatorUserId,
      title: 'New Project Request',
      message: `${user?.fullName} sent you a new project request: ${data.requirement.title}`,
      type: 'action',
      link: `/creator/requests/${project.id}`,
    });
    return project;
  }, [user, addNotification]);

  const acceptProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const shootSchedule: ShootSchedule = {
        date: p.requirement.preferredShootDate || '',
        time: 'As booked',
        location: p.requirement.exactLocation || p.requirement.city || '',
        completed: false,
      };
      return addActivity(
        {
          ...p,
          status: 'accepted' as ProjectStatus,
          workspaceActive: true,
          shootSchedule,
        },
        'accepted', 'Creator accepted the project', p.creatorName
      );
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.customerId,
        title: 'Project Accepted',
        message: `${p.creatorName} accepted your request.`,
        type: 'success',
        link: `/customer/projects/${id}/workspace`,
      });
    }
  }, [projects, addNotification]);

  const declineProject = useCallback((id: string, reason: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const updated = addActivity(
        { ...p, status: 'declined' as ProjectStatus, declineReason: reason, workspaceActive: false },
        'declined', `Creator declined: ${reason}`, p.creatorName
      );
      return updated;
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.customerId,
        title: 'Request Declined',
        message: `${p.creatorName} declined your request.`,
        type: 'warning',
        link: `/customer/find-creators`,
      });
    }
  }, [projects, addNotification]);

  const scheduleShoot = useCallback((id: string, schedule: ShootSchedule) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      return addActivity(
        { ...p, shootSchedule: schedule, status: 'shoot_scheduled' as ProjectStatus },
        'shoot_scheduled', `Shoot scheduled for ${schedule.date}`, p.creatorName
      );
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.customerId,
        title: 'Shoot Scheduled',
        message: `Your shoot has been scheduled for ${schedule.date}.`,
        type: 'info',
        link: `/customer/projects/${id}/workspace`,
      });
    }
  }, [projects, addNotification]);

  const completeShoot = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const shootSchedule: ShootSchedule = p.shootSchedule ?? {
        date: p.requirement.preferredShootDate || '',
        time: 'As booked',
        location: p.requirement.exactLocation || p.requirement.city || '',
        completed: false,
      };
      return addActivity(
        {
          ...p,
          status: 'shoot_completed' as ProjectStatus,
          shootSchedule: { ...shootSchedule, completed: true },
        },
        'shoot_completed', 'Creator marked shoot day complete', p.creatorName
      );
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.customerId,
        title: 'Shoot Day Complete',
        message: `${p.creatorName} marked the shoot day as complete.`,
        type: 'info',
        link: `/customer/projects/${id}/workspace`,
      });
    }
  }, [projects, addNotification]);

  const uploadDraft = useCallback((id: string, file?: Omit<ProjectFile, 'id'>) => {
    const project = projects.find((x) => x.id === id);
    const version = (project?.drafts.filter((d) => d.isPreview).length || 0) + 1;
    const draftFile = file ?? {
      ...buildPreviewDraftFile(project?.creatorName || 'Creator'),
      name: `Preview v${version}`,
    };
    const newFile: ProjectFile = { ...draftFile, id: generateId() };
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const resolvedRevisions = p.revisions.map((r) =>
        r.status === 'requested'
          ? { ...r, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
          : r,
      );
      let updated = {
        ...p,
        drafts: [...p.drafts, newFile],
        revisions: resolvedRevisions,
        status: 'draft_submitted' as ProjectStatus,
      };
      updated = addActivity(
        updated,
        'draft_uploaded',
        version > 1 ? `Revised draft uploaded: ${newFile.name}` : `Draft uploaded: ${newFile.name}`,
        p.creatorName,
      );
      return updated;
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.customerId,
        title: version > 1 ? 'Revised Preview Ready' : 'Preview Ready',
        message: version > 1
          ? 'Your creator uploaded a revised preview for review.'
          : 'Your watermarked preview is ready for review.',
        type: 'action',
        link: `/customer/projects/${id}/preview`,
      });
    }
  }, [projects, addNotification]);

  const requestRevision = useCallback((id: string, description: string) => {
    const revision: Revision = {
      id: generateId(), requestedAt: new Date().toISOString(),
      description, status: 'requested',
    };
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      let updated = { ...p, revisions: [...p.revisions, revision], status: 'revision_requested' as ProjectStatus };
      updated = addActivity(updated, 'revision_requested', `Customer requested revision: ${description}`, p.customerName);
      return updated;
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.creatorId,
        title: 'Revision Requested',
        message: description.length > 120 ? `${description.slice(0, 120)}…` : description,
        type: 'action',
        link: `/creator/projects/${id}/workspace`,
      });
    }
  }, [projects, addNotification]);

  const acknowledgeRevision = useCallback((id: string, revisionId: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const revisions = p.revisions.map((r) =>
        r.id === revisionId ? { ...r, status: 'acknowledged' as const } : r
      );
      let updated = { ...p, revisions };
      updated = addActivity(updated, 'revision_acknowledged', 'Creator acknowledged revision request', p.creatorName);
      return updated;
    }));
  }, []);

  const approveDraft = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      let updated = { ...p, status: 'draft_approved' as ProjectStatus };
      updated = addActivity(updated, 'draft_approved', 'Customer approved the draft', p.customerName);
      return updated;
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.creatorId,
        title: 'Draft Approved',
        message: 'Customer approved your draft.',
        type: 'success',
        link: `/creator/projects/${id}/workspace`,
      });
    }
  }, [projects, addNotification]);

  const markReadyForFinalDelivery = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const newStatus = p.paymentOption === 'split_30_70' ? 'final_payment_pending' as ProjectStatus : 'ready_for_final_delivery' as ProjectStatus;
      let updated = { ...p, status: newStatus };
      updated = addActivity(updated, 'ready_for_delivery', 'Creator marked ready for final delivery', p.creatorName);
      return updated;
    }));
    const p = projects.find((x) => x.id === id);
    if (p && p.paymentOption === 'split_30_70') {
      addNotification({
        userId: p.customerId,
        title: 'Complete Payment',
        message: 'Complete your remaining payment to receive final delivery.',
        type: 'action',
        link: `/customer/projects/${id}/payment`,
      });
    }
  }, [projects, addNotification]);

  const payRemaining = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const remaining = getRemainingAmount(p.pricing?.projectTotal ?? p.totalAmount, p.pricing?.amountPaid ?? p.amountPaid);
      const updatedPricing = applyPaymentToPricing(
        p.pricing ?? {
          projectTotal: p.totalAmount,
          paymentPlan: p.paymentOption,
          advanceAmount: 0,
          finalAmount: remaining,
          amountPaid: p.amountPaid,
          remainingAmount: remaining,
          paymentStatus: 'advance_paid',
          priceBreakdown: p.priceBreakdown,
          bookingType: 'services',
        },
        remaining
      );
      let updated = syncProjectFromPricing(
        { ...p, status: 'ready_for_final_delivery' as ProjectStatus },
        updatedPricing
      );
      updated = addActivity(updated, 'final_payment', 'Customer completed final payment', p.customerName);
      return updated;
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.creatorId,
        title: 'Final Payment Received',
        message: 'Customer completed the final payment.',
        type: 'success',
        link: `/creator/projects/${id}/workspace`,
      });
    }
  }, [projects, addNotification]);

  const uploadFinal = useCallback((id: string, file?: Omit<ProjectFile, 'id'>) => {
    const p = projects.find((x) => x.id === id);
    const newFiles: ProjectFile[] = file
      ? [{ ...file, id: generateId(), isFinal: true, isPreview: false }]
      : toProjectFiles(buildDemoFinalFiles());
    setProjects((prev) => prev.map((proj) => {
      if (proj.id !== id) return proj;
      let updated = {
        ...proj,
        drafts: [...proj.drafts, ...newFiles],
        status: 'final_delivered' as ProjectStatus,
      };
      updated = addActivity(
        updated,
        'final_delivered',
        `Final files delivered (${newFiles.length} files)`,
        proj.creatorName,
      );
      return updated;
    }));
    if (p) {
      addNotification({
        userId: p.customerId,
        title: 'Final Files Ready',
        message: 'Your final deliverables are ready for download.',
        type: 'success',
        link: `/customer/projects/${id}/delivery`,
      });
    }
  }, [projects, addNotification]);

  const completeProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      let updated = { ...p, status: 'completed' as ProjectStatus };
      updated = addActivity(updated, 'completed', 'Project completed', 'System');
      return updated;
    }));
  }, []);

  const submitProjectReview = useCallback((id: string, review: Omit<ProjectReview, 'submittedAt'>) => {
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const fullReview: ProjectReview = { ...review, submittedAt: new Date().toISOString() };
      return addActivity(
        { ...p, review: fullReview, status: 'completed' as ProjectStatus },
        'review_submitted',
        'Customer submitted a project review',
        p.customerName,
      );
    }));
    const p = projects.find((x) => x.id === id);
    if (p) {
      addNotification({
        userId: p.creatorId,
        title: 'New Review Received',
        message: `${p.customerName} rated your work ${review.overallRating}/5.`,
        type: 'success',
        link: `/creator/projects/${id}/workspace`,
      });
    }
  }, [projects, addNotification]);

  const raiseIssue = useCallback((id: string, issue: Omit<Issue, 'id' | 'createdAt' | 'status'>) => {
    const newIssue: Issue = { ...issue, id: generateId(), createdAt: new Date().toISOString(), status: 'under_review' };
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      let updated = { ...p, issues: [...p.issues, newIssue], status: 'issue_open' as ProjectStatus };
      updated = addActivity(updated, 'issue_raised', `Issue raised: ${issue.type}`, issue.raisedBy === 'customer' ? p.customerName : p.creatorName);
      return updated;
    }));
  }, []);

  const sendMessage = useCallback((projectId: string, text: string) => {
    const msg: Message = {
      id: generateId(),
      senderId: user?.id || '',
      senderName: user?.fullName || 'User',
      text,
      timestamp: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, messages: [...p.messages, msg] } : p
    ));
  }, [user]);

  return (
    <AppContext.Provider value={{
      projects, notifications, requirementDraft, setRequirementDraft, clearRequirementDraft,
      bookingDraft, setBookingDraft, clearBookingDraft,
      selectedCreatorId, setSelectedCreatorId, selectedPaymentOption, setSelectedPaymentOption,
      createProject, updateProject, getProject, acceptProject, declineProject,
      scheduleShoot, completeShoot, uploadDraft, requestRevision, acknowledgeRevision,
      approveDraft, markReadyForFinalDelivery, payRemaining, uploadFinal, completeProject,
      submitProjectReview,
      raiseIssue, sendMessage, addNotification, markNotificationRead, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
