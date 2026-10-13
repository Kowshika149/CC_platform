import { useState } from 'react';
import { DUMMY_CREATORS } from '../data/creators';
import { getApprovedCreators } from '../utils/pricing';
import { BRAND } from '../constants/brand';
import { Star, MapPin, BadgeCheck, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  const filtered = getApprovedCreators(DUMMY_CREATORS).filter((c) => {
    const matchSearch = !search || c.professionalName.toLowerCase().includes(search.toLowerCase()) || c.services.some((s) => s.includes(search.toLowerCase()));
    const matchLocation = !location || c.city.toLowerCase().includes(location.toLowerCase());
    return matchSearch && matchLocation;
  });

  return (
    <div className="min-h-screen bg-surface-50">
      <nav className="bg-white border-b border-surface-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand-700">{BRAND.name}</Link>
          <div className="flex gap-3">
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/signup" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Creators</h1>
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input className="input pl-10" placeholder="Search creators or services" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <input className="input w-48" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((c) => (
            <Link key={c.id} to={`/customer/creator/${c.id}`} className="card-hover">
              <img src={c.avatar} alt={c.professionalName} className="h-20 w-20 rounded-xl object-cover mx-auto" />
              <h3 className="font-semibold text-center mt-3 flex items-center justify-center gap-1">
                {c.professionalName}
                {c.verified && c.status === 'approved' && <BadgeCheck className="h-4 w-4 text-brand-600" />}
              </h3>
              <p className="text-sm text-surface-500 text-center flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" /> {c.city}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{c.rating}</span>
                <span className="text-sm text-surface-400">({c.reviewCount})</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center mt-3">
                {c.services.slice(0, 3).map((s) => (
                  <span key={s} className="badge-neutral text-xs capitalize">{s}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
