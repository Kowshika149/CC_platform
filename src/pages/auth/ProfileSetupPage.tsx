import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSetupPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState(user?.city || 'Chennai');

  const handleComplete = () => {
    updateUser({ city, onboardingComplete: true });
    navigate('/customer/home');
  };

  if (!user) { navigate('/login'); return null; }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="card max-w-md w-full">
        <h2 className="text-xl font-semibold mb-1">Welcome, {user.fullName}!</h2>
        <p className="text-sm text-surface-500 mb-6">Let's set up your profile</p>
        <div className="space-y-4">
          <div>
            <label className="label">Your City</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="p-4 rounded-xl bg-brand-50 text-sm text-brand-800">
            You're all set to start discovering creators and creating amazing content!
          </div>
          <button onClick={handleComplete} className="btn-primary w-full">Go to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
