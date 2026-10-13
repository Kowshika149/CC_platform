import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../constants/brand';
import { Sparkles } from 'lucide-react';

function getPostLoginPath(u: { role?: string; creatorStatus?: string } | null) {
  if (!u) return '/';
  if (u.role === 'creator') {
    if (u.creatorStatus === 'approved') return '/creator/dashboard';
    if (u.creatorStatus === 'pending_verification' || u.creatorStatus === 'under_review') return '/creator/pending';
    return '/creator/onboarding';
  }
  return '/customer/home';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    const success = login(email, password);
    if (success) {
      const stored = localStorage.getItem('cc_auth');
      const u = stored ? JSON.parse(stored) : null;
      navigate(getPostLoginPath(u));
    } else {
      setError('Invalid email or password. Try demo accounts below.');
    }
  };

  const quickLogin = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh px-4">
      <div className="card-elevated max-w-md w-full animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-brand-700">
            <Sparkles className="h-5 w-5" />
            {BRAND.name}
          </Link>
          <h2 className="text-xl font-semibold mt-6">Welcome back</h2>
          <p className="text-sm text-surface-500 mt-1">Login to your {BRAND.displayName} account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>}
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Login</button>
        </form>
        <div className="mt-5 p-4 rounded-xl bg-brand-50/80 border border-brand-100 text-sm">
          <p className="font-medium text-brand-800 mb-2">Demo Accounts:</p>
          <button type="button" onClick={() => quickLogin('kowshika@demo.com', 'demo123')} className="block text-brand-600 hover:underline">
            Customer: kowshika@demo.com
          </button>
          <button type="button" onClick={() => quickLogin('arjun@demo.com', 'demo123')} className="block text-brand-600 hover:underline mt-1">
            Creator (Approved): arjun@demo.com
          </button>
          <button type="button" onClick={() => quickLogin('pending@demo.com', 'demo123')} className="block text-brand-600 hover:underline mt-1">
            Creator (Pending): pending@demo.com
          </button>
        </div>
        <p className="text-center text-sm text-surface-500 mt-5">
          Don't have an account? <Link to="/signup" className="text-brand-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
