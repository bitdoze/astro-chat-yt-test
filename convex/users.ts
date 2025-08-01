import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create a user
export const getOrCreateUser = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by email first, then by name
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
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .first();
    }

    // Create new user if not found
    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: args.name,
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

    return user;
  },
});

// Update user's last seen timestamp
export const updateUserActivity = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastSeen: Date.now(),
    });
  },
});

// Get user by ID
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user message history
export const getUserMessageHistory = query({
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

// Get all users with their message counts
export const getAllUsersWithStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const messageCount = await ctx.db
          .query("messages")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        return {
          ...user,
          messageCount: messageCount.length,
        };
      }),
    );

    return usersWithStats.sort((a, b) => b.lastSeen - a.lastSeen);
  },
});

// Get active users (users who have been active in the last 5 minutes)
export const getActiveUsersCount = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const activeUsers = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("lastSeen"), fiveMinutesAgo))
      .collect();

    return activeUsers.length;
  },
});

// Get recent active users
export const getRecentActiveUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    const recentUsers = await ctx.db
      .query("users")
      .filter((q) => q.gte(q.field("lastSeen"), thirtyMinutesAgo))
      .order("desc")
      .take(limit);

    return recentUsers;
  },
});
