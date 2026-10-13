import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUMMY_CREATORS } from '../../data/creators';
import { useApp } from '../../context/AppContext';
import { CreatorCard } from '../../components/CreatorCard';
import { filterCreators, hasSearchCriteria, getSearchFilterItems } from '../../utils/pricing';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function FindCreatorsPage() {
  const navigate = useNavigate();
  const { requirementDraft, setSelectedCreatorId } = useApp();
  const items = getSearchFilterItems(requirementDraft);
  const withReqs = hasSearchCriteria(requirementDraft);

  const [filters, setFilters] = useState({
    location: '',
    category: requirementDraft.categoryId || '',
    service: '',
    minRating: 0,
    minExperience: 0,
    maxPrice: 0,
    verifiedOnly: true,
    sortBy: 'recommended' as const,
  });
  const [showFilters, setShowFilters] = useState(false);

  const results = filterCreators(DUMMY_CREATORS, items, {
    ...filters,
    approvedOnly: true,
  });

  const handleBook = (creatorId: string) => {
    setSelectedCreatorId(creatorId);
    navigate(`/customer/creator/${creatorId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Find Creators</h1>
          {requirementDraft.categoryName && (
            <p className="text-surface-500 text-sm mt-1">
              {requirementDraft.categoryName} → {requirementDraft.subcategoryName}
              {withReqs && ` • ${items.length} content types`}
            </p>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="card mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Location</label>
            <input className="input" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Chennai" />
          </div>
          <div>
            <label className="label">Min Rating</label>
            <select className="input" value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}>
              <option value={0}>Any</option>
              <option value={4}>4+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>
          <div>
            <label className="label">Sort By</label>
            <select className="input" value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as typeof filters.sortBy })}>
              <option value="recommended">Recommended</option>
              <option value="lowest_price">Lowest Price</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="most_experienced">Most Experienced</option>
              <option value="nearest">Nearest</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="verified" checked={filters.verifiedOnly} onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })} />
            <label htmlFor="verified" className="text-sm">Verified Creators Only</label>
          </div>
        </div>
      )}

      {!withReqs && (
        <div className="card mb-6 bg-brand-50 border-brand-100">
          <p className="text-sm text-brand-800">
            Browsing all verified creators. <button type="button" onClick={() => navigate('/customer/start')} className="font-medium underline">Start a project</button> to see requirement-based pricing.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {results.map(({ creator, pricing }) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            pricing={pricing}
            requiredItems={items}
            onViewProfile={() => navigate(`/customer/creator/${creator.id}`)}
            onSelect={() => handleBook(creator.id)}
          />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12 text-surface-500">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No creators match your search. Try adjusting filters.</p>
        </div>
      )}
    </div>
  );
}
