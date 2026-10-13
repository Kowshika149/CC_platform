export type UserRole = 'seeker' | 'creator';

export type AudienceType = 'individual' | 'business';

export type CreatorStatus =
  | 'draft'
  | 'pending_verification'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'needs_more_information';

export type ContentServiceId =
  | 'videography'
  | 'reels'
  | 'photography'
  | 'ugc'
  | 'design'
  | 'editing'
  | 'drone'
  | 'script-writing';

export type PricingUnit =
  | 'per_video'
  | 'per_reel'
  | 'per_photo'
  | 'per_design'
  | 'per_script'
  | 'per_session'
  | 'per_hour'
  | 'per_day'
  | 'per_project';

export type PaymentOption = 'full' | 'split_30_70';

export type ProjectStatus =
  | 'request_sent'
  | 'waiting_acceptance'
  | 'declined'
  | 'accepted'
  | 'shoot_scheduled'
  | 'shoot_completed'
  | 'draft_submitted'
  | 'revision_requested'
  | 'draft_approved'
  | 'ready_for_final_delivery'
  | 'final_payment_pending'
  | 'final_delivered'
  | 'completed'
  | 'cancelled'
  | 'issue_open';

export interface ServiceRate {
  serviceId: ContentServiceId;
  serviceName: string;
  pricingUnit: PricingUnit;
  rate: number;
  customQuoteRequired?: boolean;
}

export interface RequirementItem {
  serviceId: ContentServiceId;
  quantity: number;
  unit?: PricingUnit;
}

export interface ProjectRequirement {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  items: RequirementItem[];
  title: string;
  description: string;
  city: string;
  exactLocation?: string;
  preferredShootDate: string;
  preferredDeliveryDate: string;
  budgetPreference: string;
  specialRequirements?: string;
  referenceFiles?: string[];
}

export interface PriceBreakdownItem {
  serviceId: ContentServiceId;
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
  customQuoteRequired?: boolean;
}

export interface PriceBreakdown {
  items: PriceBreakdownItem[];
  total: number;
  hasCustomQuote: boolean;
}

export type PortfolioContentType = 'video' | 'reel' | 'photo';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  services: string[];
  description: string;
  imageUrl: string;
  type: 'image' | 'video';
  contentType?: PortfolioContentType;
  projectLink?: string;
}

export interface CreatorPortfolioEntry {
  id: string;
  title: string;
  category: string;
  contentType: PortfolioContentType | string;
  description: string;
  fileName?: string;
  projectLink?: string;
  socialLink?: string;
}

export interface IdentityVerification {
  idType?: 'aadhaar' | 'pan' | 'driving_licence' | 'passport';
  idDocumentUploaded?: boolean;
  selfieUploaded?: boolean;
  submitted?: boolean;
}

export interface ProfessionalLinks {
  website?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  portfolioLink?: string;
}

export interface CreatorApplication {
  profileComplete?: boolean;
  servicesComplete?: boolean;
  portfolioComplete?: boolean;
  identityComplete?: boolean;
  submittedAt?: string;
  portfolioItems?: CreatorPortfolioEntry[];
  identity?: IdentityVerification;
  professionalLinks?: ProfessionalLinks;
  languages?: string[];
  state?: string;
}

export interface CreatorPackage {
  id: string;
  name: string;
  description: string;
  items: { serviceId: ContentServiceId; quantity: number; label: string }[];
  price: number;
  deliveryDays: number;
}

export interface CreatorAvailabilityData {
  bookedDates: string[];
  unavailableDates: string[];
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
  projectTitle: string;
}

export interface Creator {
  id: string;
  userId?: string;
  name: string;
  professionalName: string;
  avatar: string;
  city: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  verified: boolean;
  status: CreatorStatus;
  bio: string;
  categories: string[];
  services: ContentServiceId[];
  rates: ServiceRate[];
  paymentPreferences: PaymentOption[];
  availability: string;
  availabilityCalendar?: CreatorAvailabilityData;
  packages: CreatorPackage[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  distanceKm?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  avatar?: string;
  city?: string;
  state?: string;
  professionalName?: string;
  yearsExperience?: number;
  categories?: string[];
  services?: ContentServiceId[];
  rates?: ServiceRate[];
  packages?: CreatorPackage[];
  paymentPreferences?: PaymentOption[];
  bio?: string;
  languages?: string[];
  onboardingComplete?: boolean;
  creatorStatus?: CreatorStatus;
  creatorApplication?: CreatorApplication;
  emailVerified?: boolean;
  mobileVerified?: boolean;
}

export interface ShootSchedule {
  date: string;
  time: string;
  location: string;
  notes?: string;
  completed?: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'video' | 'image' | 'document';
  description?: string;
  size?: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: 'creator' | 'customer';
  isPreview: boolean;
  isFinal: boolean;
}

export interface Revision {
  id: string;
  requestedAt: string;
  description: string;
  referenceFiles?: string[];
  status: 'requested' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
}

export interface ProjectReview {
  overallRating: number;
  qualityRating: number;
  communicationRating: number;
  timelinessRating: number;
  comment: string;
  submittedAt: string;
}

export interface Issue {
  id: string;
  raisedBy: 'customer' | 'creator';
  type: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  attachment?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface CustomQuote {
  amount: number;
  description: string;
  deliveryTimeline: string;
  status: 'pending' | 'accepted' | 'declined';
}

export type PaymentStatus = 'unpaid' | 'advance_paid' | 'fully_paid';

export interface ProjectPricing {
  projectTotal: number;
  paymentPlan: PaymentOption;
  advanceAmount: number;
  finalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  priceBreakdown: PriceBreakdown;
  bookingType: 'services' | 'package';
  selectedPackageId?: string;
  selectedPackageName?: string;
}

export type BookingJourney = 'start_project' | 'direct_book';

export type BookingStep = 'mode' | 'select' | 'requirements' | 'review';

export interface BookingDraft {
  creatorId: string;
  creatorName: string;
  journey: BookingJourney;
  step?: BookingStep;
  bookingType: 'services' | 'package';
  contentTypes?: ContentServiceId[];
  items: RequirementItem[];
  selectedPackageId?: string;
  pricing: ProjectPricing | null;
  title: string;
  description: string;
  city: string;
  preferredShootDate: string;
  preferredDeliveryDate: string;
  deliveryExpectation: string;
  purpose?: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  audienceType?: AudienceType;
  budgetPreference?: string;
  specialRequirements?: string;
  serviceDetails?: Partial<Record<ContentServiceId, {
    contentType?: string;
    duration?: string;
    platform?: string;
    photoStyle?: string;
  }>>;
}

export interface Project {
  id: string;
  customerId: string;
  customerName: string;
  creatorId: string;
  creatorName: string;
  requirement: ProjectRequirement;
  priceBreakdown: PriceBreakdown;
  pricing?: ProjectPricing;
  totalAmount: number;
  paymentOption: PaymentOption;
  amountPaid: number;
  status: ProjectStatus;
  workspaceActive: boolean;
  shootSchedule?: ShootSchedule;
  drafts: ProjectFile[];
  revisions: Revision[];
  issues: Issue[];
  messages: Message[];
  activity: ActivityItem[];
  customQuote?: CustomQuote;
  declineReason?: string;
  review?: ProjectReview;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface RequirementDraft {
  audienceType?: AudienceType;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  /** Content types selected during search (no quantities) */
  contentTypes?: ContentServiceId[];
  items: RequirementItem[];
  title?: string;
  description?: string;
  city?: string;
  exactLocation?: string;
  preferredShootDate?: string;
  preferredDeliveryDate?: string;
  budgetPreference?: string;
  specialRequirements?: string;
  selectedPackageId?: string;
  bookingType?: 'services' | 'package';
  serviceDetails?: Partial<Record<ContentServiceId, {
    contentType?: string;
    duration?: string;
    platform?: string;
  }>>;
  deliveryExpectation?: string;
}

export interface CreatorFilters {
  location: string;
  category: string;
  service: string;
  minRating: number;
  minExperience: number;
  maxPrice: number;
  verifiedOnly: boolean;
  sortBy: 'recommended' | 'lowest_price' | 'highest_rated' | 'most_experienced' | 'nearest';
}

export const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
  per_video: 'Per Video',
  per_reel: 'Per Reel',
  per_photo: 'Per Photo',
  per_design: 'Per Design',
  per_script: 'Per Script',
  per_session: 'Per Session',
  per_hour: 'Per Hour',
  per_day: 'Per Day',
  per_project: 'Per Project',
};

export const SERVICE_LABELS: Record<ContentServiceId, string> = {
  videography: 'Videography',
  reels: 'Reels / Short Videos',
  photography: 'Photography',
  ugc: 'UGC / On-Camera Content',
  design: 'Design',
  editing: 'Editing',
  drone: 'Drone',
  'script-writing': 'Script Writing',
};

export const SERVICE_DESCRIPTIONS: Record<ContentServiceId, string> = {
  videography: 'Professional video production for businesses, brands, products or events.',
  reels: 'Short-form vertical videos for Instagram, YouTube Shorts and social media.',
  photography: 'Professional photos for businesses, products, events or personal branding.',
  ugc: 'Authentic creator-led content where a person appears on camera.',
  design: 'Posters, banners, social media creatives and promotional designs.',
  editing: 'Customer already has footage or images and only requires editing.',
  drone: 'Aerial photography and video coverage.',
  'script-writing': 'Scripts, concepts and content planning for videos.',
};

export const QUANTITY_LABELS: Record<ContentServiceId, string> = {
  videography: 'Number of videos',
  reels: 'Number of reels',
  photography: 'Number of photos',
  ugc: 'Number of UGC videos',
  design: 'Number of designs',
  editing: 'Number of videos to edit',
  drone: 'Number of sessions',
  'script-writing': 'Number of scripts',
};

export const SESSION_BASED_SERVICES: ContentServiceId[] = ['drone'];
