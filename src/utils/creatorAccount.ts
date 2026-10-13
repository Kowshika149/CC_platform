import { DUMMY_CREATORS } from '../data/creators';
import { DEMO_MODE } from '../constants/demo';
import type { Notification, Project, UserRole } from '../types';

/** Resolve marketplace creator profile id to the linked auth user id. */
export function getCreatorUserId(creatorProfileId: string): string {
  const creator = DUMMY_CREATORS.find((c) => c.id === creatorProfileId || c.userId === creatorProfileId);
  return creator?.userId ?? creatorProfileId;
}

/** Resolve auth user id or stored project creator id back to marketplace profile id. */
export function getCreatorProfileId(creatorIdOrUserId: string): string {
  const byProfile = DUMMY_CREATORS.find((c) => c.id === creatorIdOrUserId);
  if (byProfile) return byProfile.id;
  const byUser = DUMMY_CREATORS.find((c) => c.userId === creatorIdOrUserId);
  return byUser?.id ?? creatorIdOrUserId;
}

/** Match projects to the logged-in creator account. */
export function isProjectForCreator(
  _project: Project,
  _userId?: string,
  _professionalName?: string,
): boolean {
  if (DEMO_MODE.creatorSeesAllProjects) return true;

  if (!_userId) return false;
  const normalizedCreatorId = getCreatorUserId(_project.creatorId);
  if (normalizedCreatorId === _userId || _project.creatorId === _userId) return true;

  const creator = DUMMY_CREATORS.find((c) => c.userId === _userId);
  return creator ? _project.creatorId === creator.id : false;
}

function notificationBelongsToUser(notification: Notification, userId: string): boolean {
  if (notification.userId === userId) return true;
  if (getCreatorUserId(notification.userId) === userId) return true;
  return false;
}

/** Match notifications to the logged-in user and their current role. */
export function isNotificationForUser(
  notification: Notification,
  userId: string,
  role: UserRole,
): boolean {
  if (notificationBelongsToUser(notification, userId)) return true;

  const link = notification.link || '';
  const isCustomerLink = link.startsWith('/customer/');
  const isCreatorLink = link.startsWith('/creator/');

  // Demo mode: show role-appropriate notifications so single-account role-switch testing works.
  if (DEMO_MODE.creatorSeesAllProjects) {
    if (role === 'seeker' && isCustomerLink) return true;
    if (role === 'creator' && isCreatorLink) return true;
  }

  return false;
}
