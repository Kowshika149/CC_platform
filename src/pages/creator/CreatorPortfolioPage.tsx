import { useState } from 'react';
import { DUMMY_CREATORS } from '../../data/creators';
import { PortfolioTabs } from '../../components/PortfolioTabs';
import { Plus } from 'lucide-react';
import type { PortfolioContentType, PortfolioItem } from '../../types';
import { generateId } from '../../utils/pricing';

export default function CreatorPortfolioPage() {
  const creator = DUMMY_CREATORS[0];
  const [items, setItems] = useState(creator.portfolio);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '', category: '', description: '', contentType: 'video' as PortfolioContentType,
  });

  const addItem = () => {
    if (!newItem.title) return;
    const item: PortfolioItem = {
      id: generateId(),
      title: newItem.title,
      category: newItem.category,
      services: [newItem.contentType],
      description: newItem.description,
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
      type: newItem.contentType === 'photo' ? 'image' : 'video',
      contentType: newItem.contentType,
    };
    setItems((prev) => [...prev, item]);
    setNewItem({ title: '', category: '', description: '', contentType: 'video' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <button type="button" onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 space-y-3">
          <label className="label">Content Type</label>
          <div className="flex gap-4 text-sm">
            {(['video', 'reel', 'photo'] as PortfolioContentType[]).map((t) => (
              <label key={t} className="flex items-center gap-1.5 capitalize cursor-pointer">
                <input type="radio" name="ptype" checked={newItem.contentType === t} onChange={() => setNewItem({ ...newItem, contentType: t })} />
                {t === 'video' ? 'Video' : t === 'reel' ? 'Reel' : 'Photo'}
              </label>
            ))}
          </div>
          <input className="input" placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
          <input className="input" placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
          <textarea className="input" placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
          <div className="p-3 rounded-lg border border-dashed text-center text-xs text-surface-500">Upload Content (prototype)</div>
          <button type="button" onClick={addItem} className="btn-secondary w-full">Save to Portfolio</button>
        </div>
      )}

      <div className="card">
        <PortfolioTabs items={items} />
      </div>
    </div>
  );
}
