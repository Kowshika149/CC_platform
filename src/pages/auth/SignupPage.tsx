import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../constants/brand';
import type { UserRole } from '../../types';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || undefined;
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '',
    professionalName: '', city: '', yearsExperience: '',
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.mobile || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    signup({
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      password: form.password,
      role: initialRole || 'seeker',
      city: form.city,
      professionalName: form.professionalName,
      yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
      creatorStatus: initialRole === 'creator' ? 'draft' : undefined,
    });
    if (initialRole === 'creator') {
      navigate('/creator/onboarding');
    } else if (searchParams.get('redirect') === 'customer-start') {
      navigate('/customer/start');
    } else {
      navigate('/select-role');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4 py-8">
      <div className="card max-w-lg w-full">
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold text-brand-700">{BRAND.name}</Link>
          <h2 className="text-xl font-semibold mt-4">Create your account</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Mobile Number *</label>
            <input className="input" value={form.mobile} onChange={(e) => handleChange('mobile', e.target.value)} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div>
            <label className="label">Password *</label>
            <input type="password" className="input" value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
          </div>
          {initialRole === 'creator' && (
            <>
              <div>
                <label className="label">Professional Name</label>
                <input className="input" value={form.professionalName} onChange={(e) => handleChange('professionalName', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input className="input" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input type="number" className="input" value={form.yearsExperience} onChange={(e) => handleChange('yearsExperience', e.target.value)} />
                </div>
              </div>
            </>
          )}
          <button type="submit" className="btn-primary w-full">Continue</button>
        </form>
        <p className="text-center text-sm text-surface-500 mt-4">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
