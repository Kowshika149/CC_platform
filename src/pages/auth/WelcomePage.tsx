import { Link } from 'react-router-dom';
import { BRAND } from '../../constants/brand';
import { ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-brand-700 mb-2">{BRAND.name}</h1>
        <p className="text-surface-500 mb-8">{BRAND.tagline}</p>
        <div className="space-y-3">
          <Link to="/signup" className="btn-primary w-full text-base py-3">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="btn-secondary w-full text-base py-3">Login</Link>
        </div>
        <Link to="/" className="mt-6 inline-block text-sm text-surface-500 hover:text-brand-600">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
