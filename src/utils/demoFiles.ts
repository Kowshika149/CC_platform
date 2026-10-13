import type { ProjectFile } from '../types';
import { generateId } from './pricing';

const PREVIEW_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200';

export function buildPreviewDraftFile(creatorName: string): Omit<ProjectFile, 'id'> {
  return {
    name: 'Preview v1',
    type: 'video',
    description: `${creatorName} uploaded a watermarked draft. Final high-resolution files unlock after approval.`,
    size: '480p preview',
    thumbnailUrl: PREVIEW_IMAGE,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'creator',
    isPreview: true,
    isFinal: false,
  };
}

export function buildDemoFinalFiles(): Omit<ProjectFile, 'id'>[] {
  const now = new Date().toISOString();
  return [
    {
      name: 'Promotional Video.mp4',
      type: 'video',
      description: 'High-resolution promotional video',
      size: '1.2 GB',
      uploadedAt: now,
      uploadedBy: 'creator',
      isPreview: false,
      isFinal: true,
    },
    {
      name: 'Reel 01.mp4',
      type: 'video',
      description: 'Instagram reel deliverable',
      size: '48 MB',
      uploadedAt: now,
      uploadedBy: 'creator',
      isPreview: false,
      isFinal: true,
    },
    {
      name: 'Reel 02.mp4',
      type: 'video',
      description: 'Instagram reel deliverable',
      size: '52 MB',
      uploadedAt: now,
      uploadedBy: 'creator',
      isPreview: false,
      isFinal: true,
    },
    {
      name: 'Photo Package.zip',
      type: 'document',
      description: 'Edited photo package',
      size: '240 MB',
      uploadedAt: now,
      uploadedBy: 'creator',
      isPreview: false,
      isFinal: true,
    },
  ];
}

export function toProjectFiles(files: Omit<ProjectFile, 'id'>[]): ProjectFile[] {
  return files.map((file) => ({ ...file, id: generateId() }));
}

export function getFileExtension(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
}

export function triggerDemoDownload(fileName: string) {
  const blob = new Blob([`Demo download for ${fileName}\n\nThis is a prototype file.`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
