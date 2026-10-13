import { useMemo, useState } from 'react';
import type { PortfolioItem, PortfolioContentType } from '../types';

const TABS: { id: PortfolioContentType; label: string }[] = [
  { id: 'video', label: 'Videos' },
  { id: 'reel', label: 'Reels' },
  { id: 'photo', label: 'Photos' },
];

function inferContentType(item: PortfolioItem): PortfolioContentType {
  if (item.contentType === 'video' || item.contentType === 'reel' || item.contentType === 'photo') {
    return item.contentType;
  }
  const text = `${item.title} ${item.category} ${item.services.join(' ')}`.toLowerCase();
  if (text.includes('reel') || text.includes('short')) return 'reel';
  if (text.includes('photo') || text.includes('shoot') || item.type === 'image') return 'photo';
  return 'video';
}

interface PortfolioTabsProps {
  items: PortfolioItem[];
}

export function PortfolioTabs({ items }: PortfolioTabsProps) {
  const grouped = useMemo(() => {
    const map: Record<PortfolioContentType, PortfolioItem[]> = { video: [], reel: [], photo: [] };
    items.forEach((item) => {
      map[inferContentType(item)].push(item);
    });
    return map;
  }, [items]);

  const defaultTab = TABS.find((t) => grouped[t.id].length > 0)?.id ?? 'video';
  const [activeTab, setActiveTab] = useState<PortfolioContentType>(defaultTab);

  const activeItems = grouped[activeTab];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {tab.label}
            {grouped[tab.id].length > 0 && (
              <span className="ml-1 opacity-70">({grouped[tab.id].length})</span>
            )}
          </button>
        ))}
      </div>

      {activeItems.length === 0 ? (
        <p className="text-sm text-surface-500 py-6 text-center">
          No {activeTab === 'video' ? 'videos' : activeTab === 'reel' ? 'reels' : 'photos'} in portfolio yet.
        </p>
      ) : (
        <div className={`grid gap-3 ${activeTab === 'reel' ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {activeItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl overflow-hidden border border-surface-200 ${
                activeTab === 'reel' ? 'aspect-[9/16]' : activeTab === 'video' ? 'aspect-video' : ''
              }`}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className={`w-full object-cover ${activeTab === 'reel' ? 'h-full' : activeTab === 'video' ? 'h-full' : 'h-32'}`}
              />
              {activeTab !== 'reel' && (
                <div className="p-3">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-surface-500">{item.category}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
