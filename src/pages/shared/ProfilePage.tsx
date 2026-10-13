import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser, switchRole } = useAuth();

  if (!user) return null;

  const isCreator = user.role === 'creator';

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <div className="card space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold">
            {user.fullName[0]}
          </div>
          <div>
            <p className="font-semibold text-lg">{user.fullName}</p>
            <p className="text-sm text-surface-500 capitalize">{user.role === 'seeker' ? 'Content Seeker' : 'Creator'}</p>
          </div>
        </div>
        <div><label className="label">Email</label><input className="input" value={user.email} readOnly /></div>
        <div><label className="label">Mobile</label><input className="input" value={user.mobile} readOnly /></div>
        <div><label className="label">City</label><input className="input" value={user.city || ''} onChange={(e) => updateUser({ city: e.target.value })} /></div>
        {isCreator && (
          <>
            <div><label className="label">Professional Name</label><input className="input" value={user.professionalName || ''} onChange={(e) => updateUser({ professionalName: e.target.value })} /></div>
            <div><label className="label">Bio</label><textarea className="input" value={user.bio || ''} onChange={(e) => updateUser({ bio: e.target.value })} /></div>
          </>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Switch Role</h3>
        <p className="text-sm text-surface-500 mb-4">Switch between Content Seeker and Creator modes</p>
        <div className="flex gap-3">
          <button
            onClick={() => switchRole('seeker')}
            className={`btn-secondary flex-1 ${user.role === 'seeker' ? 'ring-2 ring-brand-500' : ''}`}
          >
            Content Seeker
          </button>
          <button
            onClick={() => switchRole('creator')}
            className={`btn-secondary flex-1 ${user.role === 'creator' ? 'ring-2 ring-brand-500' : ''}`}
          >
            Creator
          </button>
        </div>
      </div>
    </div>
  );
}
