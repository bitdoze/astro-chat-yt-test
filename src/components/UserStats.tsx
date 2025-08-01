import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";
import { clsx } from "clsx";

function UserStatsComponent() {
  const usersWithStats = useQuery(api.users.getAllUsersWithStats);
  const activeUsersCount = useQuery(api.users.getActiveUsersCount);
  const totalMessageCount = useQuery(api.messages.getMessageCount);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  const userMessages = useQuery(
    api.users.getUserMessageHistory,
    selectedUserId ? { userId: selectedUserId as any } : "skip",
  );

  if (
    usersWithStats === undefined ||
    activeUsersCount === undefined ||
    totalMessageCount === undefined
  ) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Stats Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-2">Chat Statistics</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {activeUsersCount}
            </div>
            <div className="text-xs text-gray-500">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {usersWithStats.length}
            </div>
            <div className="text-xs text-gray-500">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {totalMessageCount}
            </div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>
        </div>
      </div>

      {/* User List Toggle */}
      <div className="p-4">
        <button
          onClick={() => setShowUserList(!showUserList)}
          className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>View All Users</span>
          <svg
            className={clsx(
              "w-4 h-4 transition-transform",
              showUserList ? "rotate-180" : "",
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* User List */}
        {showUserList && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {usersWithStats.map((user) => (
              <div
                key={user._id}
                className={clsx(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedUserId === user._id
                    ? "bg-blue-50 border-blue-200"
                    : "hover:bg-gray-50 border-gray-200",
                )}
                onClick={() =>
                  setSelectedUserId(
                    selectedUserId === user._id ? null : user._id,
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {user.name}
                      </div>
                      {user.email && (
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user.messageCount}
                    </div>
                    <div className="text-xs text-gray-500">messages</div>
                    <div className="text-xs text-gray-400">
                      {formatLastSeen(user.lastSeen)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected User Messages */}
        {selectedUserId && userMessages && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Recent Messages</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {userMessages.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No messages yet
                </p>
              ) : (
                userMessages.slice(-10).map((message) => (
                  <div
                    key={message._id}
                    className="p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900">
                        {message.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleDateString()}{" "}
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the wrapped component as default
const UserStats = withConvexProvider(UserStatsComponent);
export default UserStats;
