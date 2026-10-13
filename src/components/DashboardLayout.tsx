import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BRAND } from '../constants/brand';
import {
  Home, Search, FolderOpen, MessageSquare, CreditCard, User,
  LayoutDashboard, Inbox, Briefcase, Image, DollarSign, Bell, Menu, X, LogOut, Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const customerNav = [
  { to: '/customer/home', label: 'Home', icon: Home },
  { to: '/customer/find-creators', label: 'Find Creators', icon: Search },
  { to: '/customer/projects', label: 'My Projects', icon: FolderOpen },
  { to: '/customer/messages', label: 'Messages', icon: MessageSquare },
  { to: '/customer/payments', label: 'Payments', icon: CreditCard },
  { to: '/customer/profile', label: 'Profile', icon: User },
];

const creatorNav = [
  { to: '/creator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/creator/requests', label: 'Booking Requests', icon: Inbox },
  { to: '/creator/projects', label: 'My Projects', icon: Briefcase },
  { to: '/creator/portfolio', label: 'Portfolio', icon: Image },
  { to: '/creator/services', label: 'Services & Rates', icon: DollarSign },
  { to: '/creator/availability', label: 'Availability', icon: Calendar },
  { to: '/creator/earnings', label: 'Earnings', icon: CreditCard },
  { to: '/creator/messages', label: 'Messages', icon: MessageSquare },
  { to: '/creator/profile', label: 'Profile', icon: User },
];

export function DashboardLayout({ role }: { role: 'seeker' | 'creator' }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === 'seeker' ? customerNav : creatorNav;

  return (
    <div className="min-h-screen flex bg-surface-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface-900 border-r border-surface-800 transform transition-transform duration-300 lg:translate-x-0 lg:static ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-surface-800">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">{BRAND.name}</Link>
          <button type="button" onClick={() => setMobileOpen(false)} className="lg:hidden text-surface-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          {nav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-surface-400 hover:bg-surface-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-surface-800">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-surface-800/50">
            <div className="h-9 w-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.fullName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-surface-500 capitalize">{role === 'seeker' ? 'Content Seeker' : 'Creator'}</p>
            </div>
          </div>
          <button type="button" onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-surface-800 hover:text-red-300 transition">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-surface-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <button type="button" onClick={() => setMobileOpen(true)} className="lg:hidden btn-ghost p-1">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link to={`/${role === 'seeker' ? 'customer' : 'creator'}/notifications`} className="relative btn-ghost p-2 rounded-xl">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}
