import { useNavigate } from 'react-router-dom';
import { Camera, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../constants/brand';
import type { UserRole } from '../../types';

export default function SelectRolePage() {
  const { updateUser, user } = useAuth();
  const navigate = useNavigate();

  const selectRole = (role: UserRole) => {
    updateUser({ role, ...(role === 'creator' ? { creatorStatus: 'draft' as const } : {}) });
    if (role === 'creator') {
      navigate('/creator/onboarding');
    } else {
      navigate('/profile-setup');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-surface-900">How do you want to use {BRAND.displayName}?</h1>
          <p className="text-surface-500 mt-2">You can switch between roles later from profile settings</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <button onClick={() => selectRole('seeker')} className="card-hover text-left p-8 group">
            <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-200 transition">
              <Search className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold">I need Content</h3>
            <p className="text-sm text-surface-500 mt-2">Find and hire content creators for your projects</p>
            <span className="badge-brand mt-4">CONTENT SEEKER</span>
          </button>
          <button onClick={() => selectRole('creator')} className="card-hover text-left p-8 group">
            <div className="h-14 w-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-200 transition">
              <Camera className="h-7 w-7 text-brand-600" />
            </div>
            <h3 className="text-lg font-semibold">I provide Content Services</h3>
            <p className="text-sm text-surface-500 mt-2">Offer your creative services and get paid</p>
            <span className="badge-brand mt-4">CREATOR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
