/** Placeholder interfaces for future backend integration */

export interface IdentityVerificationService {
  submitIdDocument(file: File, idType: string): Promise<{ referenceId: string }>;
  submitSelfie(file: File): Promise<{ referenceId: string }>;
  getVerificationStatus(userId: string): Promise<'pending' | 'verified' | 'rejected'>;
}

export interface OtpService {
  sendOtp(mobile: string): Promise<void>;
  verifyOtp(mobile: string, code: string): Promise<boolean>;
}

export interface EmailVerificationService {
  sendVerificationEmail(email: string): Promise<void>;
  verifyEmail(token: string): Promise<boolean>;
}

export interface CreatorVerificationApi {
  submitApplication(userId: string): Promise<{ status: string }>;
  getApplicationStatus(userId: string): Promise<string>;
  approveCreator(userId: string): Promise<void>;
}

export interface FileStorageService {
  uploadFile(file: File, folder: string): Promise<{ url: string }>;
}
