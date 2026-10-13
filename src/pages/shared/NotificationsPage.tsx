import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { isNotificationForUser } from '../../utils/creatorAccount';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useApp();
  const { user } = useAuth();

  const role = user?.role || 'seeker';
  const roleLabel = role === 'seeker' ? 'Content Seeker' : 'Creator';

  const mine = notifications.filter((n) =>
    isNotificationForUser(n, user?.id || '', role),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <Bell className="h-6 w-6" /> Notifications
      </h1>
      <p className="text-sm text-surface-500 mb-6">
        Showing notifications for your <span className="font-medium">{roleLabel}</span> account
      </p>
      {mine.length === 0 ? (
        <div className="card text-center py-12 text-surface-500">
          <p>No notifications for your {roleLabel.toLowerCase()} account yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mine.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`card cursor-pointer ${!n.read ? 'border-brand-200 bg-brand-50/30' : ''}`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-surface-500">{n.message}</p>
                  {n.link && (
                    <p className="text-xs text-surface-400 mt-1">
                      {n.link.startsWith('/customer/') ? 'For content seeker' : 'For creator'}
                    </p>
                  )}
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-brand-600 mt-2 shrink-0" />}
              </div>
              {n.link && (
                <Link
                  to={n.link}
                  onClick={() => markNotificationRead(n.id)}
                  className="text-sm text-brand-600 mt-2 inline-block"
                >
                  View →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
