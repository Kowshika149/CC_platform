import { DUMMY_CREATORS } from '../../data/creators';
import { PRICING_UNIT_LABELS, SERVICE_LABELS } from '../../types';
import { formatCurrency } from '../../utils/pricing';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { CreatorPackage } from '../../types';
import { generateId } from '../../utils/pricing';

export default function CreatorServicesPage() {
  const creator = DUMMY_CREATORS[0];
  const [packages, setPackages] = useState(creator.packages);
  const [newPkg, setNewPkg] = useState({ name: '', description: '', price: '6000', deliveryDays: '7' });

  const addPackage = () => {
    if (!newPkg.name) return;
    const pkg: CreatorPackage = {
      id: generateId(),
      name: newPkg.name,
      description: newPkg.description,
      price: parseInt(newPkg.price) || 0,
      deliveryDays: parseInt(newPkg.deliveryDays) || 7,
      items: creator.services.slice(0, 3).map((s) => ({
        serviceId: s,
        quantity: s === 'photography' ? 10 : 1,
        label: SERVICE_LABELS[s],
      })),
    };
    setPackages((p) => [...p, pkg]);
    setNewPkg({ name: '', description: '', price: '6000', deliveryDays: '7' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Services & Rates</h1>
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Your Rate Card</h3>
          <button type="button" className="btn-primary text-sm">+ Add Service</button>
        </div>
        <div className="space-y-3">
          {creator.rates.map((rate) => (
            <div key={rate.serviceId} className="flex items-center justify-between p-4 rounded-xl bg-surface-50">
              <div>
                <p className="font-medium">{rate.serviceName}</p>
                <p className="text-sm text-surface-500">{PRICING_UNIT_LABELS[rate.pricingUnit]}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatCurrency(rate.rate)}</span>
                <button type="button" className="btn-ghost text-sm">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Packages</h3>
        </div>
        <div className="space-y-3 mb-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="p-4 rounded-xl bg-surface-50 flex justify-between">
              <div>
                <p className="font-medium">{pkg.name}</p>
                <p className="text-sm text-surface-500">{pkg.items.map((i) => `${i.quantity} ${i.label}`).join(' • ')}</p>
                <p className="text-sm font-semibold mt-1">{formatCurrency(pkg.price)} • {pkg.deliveryDays} days</p>
              </div>
              <button type="button" onClick={() => setPackages((p) => p.filter((x) => x.id !== pkg.id))}><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-surface-200 space-y-3">
          <input className="input" placeholder="Package Name" value={newPkg.name} onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })} />
          <textarea className="input" placeholder="Description" value={newPkg.description} onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="input" placeholder="Price (₹)" value={newPkg.price} onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })} />
            <input type="number" className="input" placeholder="Delivery (days)" value={newPkg.deliveryDays} onChange={(e) => setNewPkg({ ...newPkg, deliveryDays: e.target.value })} />
          </div>
          <button type="button" onClick={addPackage} className="btn-secondary w-full"><Plus className="h-4 w-4" /> Add Package</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Payment Preferences</h3>
        <div className="space-y-2 text-sm">
          <p>☑ Full Payment</p>
          <p>☑ 30% Booking Payment + 70% After Final Delivery</p>
        </div>
      </div>
    </div>
  );
}
