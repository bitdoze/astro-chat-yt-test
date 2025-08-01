import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";
import { clsx } from "clsx";

function OnlineUsersComponent() {
  const recentActiveUsers = useQuery(api.users.getRecentActiveUsers, { limit: 10 });
  const activeUsersCount = useQuery(api.users.getActiveUsersCount);

  if (recentActiveUsers === undefined || activeUsersCount === undefined) {
    return (
      <div className="p-3">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "online";
    if (minutes < 5) return `${minutes}m`;
    if (minutes < 60) return `${minutes}m`;
    return "offline";
  };

  const isOnline = (timestamp: number) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return timestamp >= fiveMinutesAgo;
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Active Users</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">{activeUsersCount}</span>
        </div>
      </div>

      {recentActiveUsers.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-400 text-sm">No active users</div>
        </div>
      ) : (
        <div className="space-y-2">
          {recentActiveUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className={clsx(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                    isOnline(user.lastSeen) ? "bg-green-500" : "bg-gray-400"
                  )}
                ></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatLastSeen(user.lastSeen)}
                </div>
              </div>
              {user.email && (
                <div className="text-xs text-blue-500">✓</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-500 text-center">
          Users active in the last 30 minutes
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component as default
const OnlineUsers = withConvexProvider(OnlineUsersComponent);
export default OnlineUsers;
