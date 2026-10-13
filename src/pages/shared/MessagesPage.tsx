import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MessagesPage() {
  const { projects } = useApp();
  const { user } = useAuth();

  const withMessages = projects.filter((p) => {
    if (user?.role === 'seeker') return p.customerId === user.id;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" /> Messages
      </h1>
      {withMessages.length === 0 ? (
        <div className="card text-center py-12 text-surface-500">
          <p>No project conversations yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withMessages.map((p) => (
            <Link
              key={p.id}
              to={`/${user?.role === 'creator' ? 'creator' : 'customer'}/projects/${p.id}/workspace`}
              className="card-hover block"
            >
              <p className="font-medium">{p.requirement.title}</p>
              <p className="text-sm text-surface-500">
                {user?.role === 'creator' ? p.customerName : p.creatorName}
              </p>
              {p.messages.length > 0 && (
                <p className="text-sm text-surface-600 mt-1 truncate">
                  {p.messages[p.messages.length - 1].text}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
