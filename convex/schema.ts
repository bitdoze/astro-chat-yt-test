import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table to store user information
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  // Messages table for chat messages
  messages: defineTable({
    userId: v.id("users"),
    author: v.string(), // Keep for backwards compatibility and display
    body: v.string(),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  // Rooms table for different chat rooms (future enhancement)
  rooms: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isPrivate: v.boolean(),
  }),
});
