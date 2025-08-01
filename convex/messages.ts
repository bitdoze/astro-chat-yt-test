import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all messages (with real-time updates!)
export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    // Get the last 50 messages, ordered by timestamp
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .order("desc")
      .take(50);

    // Return them in chronological order (oldest first)
    return messages.reverse();
  },
});

// Mutation to send a new message
export const sendMessage = mutation({
  args: {
    author: v.string(),
    body: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate input
    if (!args.author.trim()) {
      throw new Error("Author name is required");
    }

    if (!args.body.trim()) {
      throw new Error("Message cannot be empty");
    }

    // Get or create user
    let user = null;
    if (args.email) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
    }

    // If no email match, try to find by name
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_name", (q) => q.eq("name", args.author.trim()))
        .first();
    }

    // Create new user if not found
    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: args.author.trim(),
        email: args.email,
        lastSeen: Date.now(),
      });
      user = await ctx.db.get(userId);
    } else {
      // Update last seen timestamp for existing user
      await ctx.db.patch(user._id, {
        lastSeen: Date.now(),
      });
      user = await ctx.db.get(user._id);
    }

    if (!user) {
      throw new Error("Failed to create or retrieve user");
    }

    // Insert the message with current timestamp and user reference
    await ctx.db.insert("messages", {
      userId: user._id,
      author: args.author.trim(),
      body: args.body.trim(),
      timestamp: Date.now(),
    });
  },
});

// Query to get messages with user information
export const getMessagesWithUsers = query({
  args: {},
  handler: async (ctx) => {
    // Get the last 50 messages, ordered by timestamp
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .order("desc")
      .take(50);

    // Get user information for each message
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        return {
          ...message,
          user: user || { name: message.author, _id: message.userId },
        };
      }),
    );

    // Return them in chronological order (oldest first)
    return messagesWithUsers.reverse();
  },
});

// Query to get messages for a specific user
export const getMessagesByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return messages.reverse();
  },
});

// Query to get message count (for stats)
export const getMessageCount = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return messages.length;
  },
});

// Query to get message count for a specific user
export const getUserMessageCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return messages.length;
  },
});
