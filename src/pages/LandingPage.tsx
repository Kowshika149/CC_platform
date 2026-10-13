import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../constants/brand';
import { Sparkles, Shield, BadgeCheck, ArrowRight, LogIn } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleNeedContent = () => {
    if (isAuthenticated && user?.role === 'seeker') {
      navigate('/customer/start');
    } else {
      navigate('/signup?role=seeker&redirect=customer-start');
    }
  };

  const handleProvideContent = () => {
    if (isAuthenticated && user?.role === 'creator') {
      navigate(user.creatorStatus === 'approved' ? '/creator/dashboard' : '/creator/onboarding');
    } else {
      navigate('/signup?role=creator');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      {/* Hero */}
      <section className="relative bg-hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-40" />
        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-medium text-white/90 mb-8 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {BRAND.fullName}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            {BRAND.name}
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white/95 leading-snug max-w-2xl mx-auto">
            {BRAND.headline}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            {BRAND.subheading}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <span className="trust-badge"><Shield className="h-3.5 w-3.5" /> Secure payments</span>
            <span className="trust-badge"><BadgeCheck className="h-3.5 w-3.5" /> Verified creators</span>
            <span className="trust-badge"><Sparkles className="h-3.5 w-3.5" /> Watermarked previews</span>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="flex-1 -mt-10 relative z-10 px-4 pb-16">
        <div className="max-w-lg mx-auto space-y-4">
          <button type="button" onClick={handleNeedContent} className="action-card-primary group">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">Get started</p>
                <p className="text-lg font-bold text-surface-900">I Need Content</p>
                <p className="text-sm text-surface-500 mt-1">Find creators for your project</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center text-white group-hover:bg-brand-700 transition">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </button>

          <button type="button" onClick={handleProvideContent} className="action-card group">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 mb-1">Join as creator</p>
                <p className="text-lg font-bold text-surface-900">I Want to Provide Content</p>
                <p className="text-sm text-surface-500 mt-1">Apply to offer your services</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-surface-100 flex items-center justify-center text-surface-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </button>

          <Link to="/login" className="action-card flex-row items-center justify-center gap-2 py-4">
            <LogIn className="h-4 w-4 text-surface-500" />
            <span className="font-semibold text-surface-700">Login</span>
          </Link>
        </div>

        <p className="text-center text-xs text-surface-400 mt-10">{BRAND.tagline}</p>
      </section>
    </div>
  );
}
