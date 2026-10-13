import type { Project } from '../types';

const DOWNLOADABLE_STATUSES = new Set(['final_delivered', 'completed']);

export function hasFinalDeliverables(project: Project): boolean {
  return project.drafts.some((d) => d.isFinal);
}

export function canDownloadFinalFiles(project: Project): boolean {
  return DOWNLOADABLE_STATUSES.has(project.status) && hasFinalDeliverables(project);
}
