import type { AudienceType, ContentServiceId } from '../types';

export const CATEGORIES = [
  // INDIVIDUAL
  {
    id: 'events',
    name: 'Events',
    icon: 'Calendar',
    audiences: ['individual'] as AudienceType[],
    subcategories: [
      { id: 'wedding', name: 'Wedding' },
      { id: 'birthday', name: 'Birthday' },
      { id: 'engagement', name: 'Engagement' },
      { id: 'anniversary', name: 'Anniversary' },
      { id: 'baby-shower', name: 'Baby Shower' },
      { id: 'private-party', name: 'Private Party' },
      { id: 'farewell', name: 'Farewell' },
      { id: 'college-event', name: 'College Event' },
      { id: 'festival', name: 'Festival / Celebration' },
      { id: 'other-event', name: 'Other Event' },
    ],
  },
  {
    id: 'social-content',
    name: 'Social Content',
    icon: 'Smartphone',
    audiences: ['individual'] as AudienceType[],
    subcategories: [
      { id: 'youtube', name: 'YouTube Content' },
      { id: 'instagram', name: 'Instagram Content' },
      { id: 'other-personal', name: 'Other Personal Content' },
    ],
  },
  {
    id: 'career',
    name: 'Career',
    icon: 'Briefcase',
    audiences: ['individual'] as AudienceType[],
    subcategories: [
      { id: 'resume-cv', name: 'Resume / CV Creation' },
      { id: 'video-resume', name: 'Video Resume' },
      { id: 'linkedin', name: 'LinkedIn Profile Content' },
      { id: 'headshots', name: 'Professional Headshots' },
      { id: 'portfolio-creation', name: 'Portfolio Creation' },
    ],
  },
  // BUSINESS
  {
    id: 'business-promotion',
    name: 'Business Promotion',
    icon: 'Building2',
    audiences: ['business'] as AudienceType[],
    subcategories: [
      { id: 'restaurant-cafe', name: 'Restaurant & Café' },
      { id: 'salon-beauty', name: 'Salon & Beauty' },
      { id: 'gym-fitness', name: 'Gym & Fitness' },
      { id: 'hotel-resort', name: 'Hotel & Resort' },
      { id: 'startup-company', name: 'Startup / Company' },
      { id: 'retail-store', name: 'Retail Store' },
      { id: 'other-business', name: 'Other Business' },
    ],
  },
  {
    id: 'product-content',
    name: 'Product Content',
    icon: 'Package',
    audiences: ['business'] as AudienceType[],
    subcategories: [
      { id: 'ecommerce', name: 'E-commerce Products' },
      { id: 'd2c', name: 'D2C Products' },
      { id: 'food-beverage', name: 'Food & Beverage Products' },
      { id: 'beauty-products', name: 'Beauty Products' },
      { id: 'clothing', name: 'Clothing Products' },
      { id: 'other-products', name: 'Other Products' },
    ],
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: 'Home',
    audiences: ['business'] as AudienceType[],
    subcategories: [
      { id: 'residential', name: 'Residential Property' },
      { id: 'commercial', name: 'Commercial Property' },
      { id: 'land-plots', name: 'Land / Plots' },
      { id: 'construction', name: 'Construction Projects' },
    ],
  },
  {
    id: 'fashion-beauty',
    name: 'Fashion & Beauty',
    icon: 'Sparkles',
    audiences: ['business'] as AudienceType[],
    subcategories: [
      { id: 'fashion-brand', name: 'Fashion Brand' },
      { id: 'jewellery', name: 'Jewellery' },
      { id: 'makeup-hair', name: 'Makeup & Hair' },
      { id: 'beauty-brand', name: 'Beauty Brand' },
      { id: 'model-shoot', name: 'Model Shoot' },
    ],
  },
  {
    id: 'social-media-content',
    name: 'Social Media Content',
    icon: 'Share2',
    audiences: ['business'] as AudienceType[],
    subcategories: [
      { id: 'instagram-content', name: 'Instagram Content' },
      { id: 'youtube-content', name: 'YouTube Content' },
      { id: 'short-form', name: 'Short-Form Content' },
      { id: 'monthly-package', name: 'Monthly Content Package' },
      { id: 'social-photography', name: 'Social Media Photography' },
      { id: 'other-social', name: 'Other Social Content' },
    ],
  },
  {
    id: 'organisation-content',
    name: 'Organisation & Institutional Content',
    icon: 'Landmark',
    audiences: ['business'] as AudienceType[],
    subcategories: [
      { id: 'education', name: 'Educational Institution' },
      { id: 'coaching', name: 'Coaching Centre' },
      { id: 'clinic-healthcare', name: 'Clinic / Healthcare' },
      { id: 'travel-tourism', name: 'Travel & Tourism' },
      { id: 'event-management', name: 'Event Management Company' },
      { id: 'other-organisation', name: 'Other Organisation' },
    ],
  },
];

/** Recommended services shown as hints for specific subcategories */
export const RECOMMENDED_SERVICES: Record<string, ContentServiceId[]> = {
  wedding: ['videography', 'photography', 'reels', 'drone'],
  'video-resume': ['videography', 'editing', 'script-writing'],
  'gym-fitness': ['videography', 'reels', 'photography'],
  youtube: ['videography', 'editing', 'script-writing'],
  instagram: ['reels', 'photography', 'ugc'],
};

export function getCategoriesForAudience(audience: AudienceType) {
  return CATEGORIES.filter((c) => c.audiences.includes(audience));
}

export function getRecommendedServices(subcategoryId: string): ContentServiceId[] {
  return RECOMMENDED_SERVICES[subcategoryId] || [];
}

export const BUDGET_OPTIONS = [
  'Flexible',
  'Under ₹5,000',
  '₹5,000 – ₹10,000',
  '₹10,000 – ₹25,000',
  '₹25,000+',
];

export const AUDIENCE_OPTIONS = [
  {
    id: 'individual' as AudienceType,
    title: 'Individual',
    description: 'For personal events, social content and career needs.',
    examples: ['Wedding', 'Birthday', 'YouTube Content', 'Instagram Content', 'Resume'],
  },
  {
    id: 'business' as AudienceType,
    title: 'Business',
    description: 'For businesses, brands, products and organisations.',
    examples: ['Restaurant', 'Salon', 'Gym', 'Product', 'Real Estate', 'Fashion'],
  },
];
