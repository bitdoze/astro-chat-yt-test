import { useMutation } from "convex/react";
import { useState, useRef, useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { withConvexProvider } from "../lib/convex";
import { clsx } from "clsx";

function MessageInputComponent() {
  const sendMessage = useMutation(api.messages.sendMessage);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const updateUserActivity = useMutation(api.users.updateUserActivity);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Load author name, email, and user ID from localStorage
  useEffect(() => {
    const savedAuthor = localStorage.getItem("chat-author-name");
    const savedEmail = localStorage.getItem("chat-author-email");
    const savedUserId = localStorage.getItem("chat-user-id");
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
    if (savedEmail) {
      setEmail(savedEmail);
    }
    if (savedUserId) {
      setCurrentUserId(savedUserId);
    }
  }, []);

  // Save author name and email to localStorage when they change
  useEffect(() => {
    if (author) {
      localStorage.setItem("chat-author-name", author);
    }
  }, [author]);

  useEffect(() => {
    if (email) {
      localStorage.setItem("chat-author-email", email);
    }
  }, [email]);

  // Create or get user when author name changes
  useEffect(() => {
    const createUser = async () => {
      if (!author.trim()) return;

      try {
        const user = await getOrCreateUser({
          name: author.trim(),
          email: email.trim() || undefined,
        });

        if (user?._id) {
          setCurrentUserId(user._id);
          localStorage.setItem("chat-user-id", user._id);
        }
      } catch (err) {
        console.error("Failed to create/get user:", err);
      }
    };

    const timeoutId = setTimeout(createUser, 500); // Debounce user creation
    return () => clearTimeout(timeoutId);
  }, [author, email, getOrCreateUser]);

  // Activity tracking effect
  useEffect(() => {
    if (!currentUserId) return;

    const updateActivity = async () => {
      try {
        await updateUserActivity({ userId: currentUserId as any });
        lastActivityRef.current = Date.now();
      } catch (error) {
        console.error("Failed to update user activity:", error);
      }
    };

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && currentUserId) {
        updateActivity();
      }
    };

    // Update activity immediately
    updateActivity();

    // Set up interval to update activity every 2 minutes
    intervalRef.current = setInterval(
      () => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;

        // Only update if user has been active in the last 5 minutes
        if (timeSinceLastActivity < 5 * 60 * 1000) {
          updateActivity();
        }
      },
      2 * 60 * 1000,
    );

    // Listen for user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Listen for visibility changes (tab switching)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUserId, updateUserActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!author.trim() || !body.trim()) {
      setError("Please enter both your name and a message");
      return;
    }

    setIsLoading(true);
    try {
      await sendMessage({
        author: author.trim(),
        body: body.trim(),
        email: email.trim() || undefined,
      });

      // Clear message input and focus it
      setBody("");
      messageInputRef.current?.focus();
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* User info inputs */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <input
            ref={messageInputRef}
            type="text"
            placeholder="Type your message..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !author.trim() || !body.trim()}
            className={clsx(
              "px-6 py-2 rounded-lg font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              isLoading || !author.trim() || !body.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600",
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Export the wrapped component as default
const MessageInput = withConvexProvider(MessageInputComponent);
export default MessageInput;
