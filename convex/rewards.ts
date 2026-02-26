import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const getClassReward = query({
    args: { classroomId: v.id("classrooms") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const user = await ctx.db.query('users').withIndex("by_clerkId",
            q => q.eq("clerkId", identity.subject)
        ).unique()
        return await ctx.db.query("rewards").withIndex('by_classroom',
            q => q.eq("classroomId", args.classroomId)
        ).collect()
    }
})

export const addReward = mutation({
    args: {
        classroomId: v.id("classrooms"),
        name: v.string(),
        cost: v.number(),
        teacherId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const user = await ctx.db.query("users").withIndex("by_clerkId",
            q => q.eq("clerkId", identity.subject)
        ).unique()
        if (user?.role !== "teacher") {
            throw new Error("this teacher doesnt own this classroom")
        }
        const classroom = await ctx.db.get("classrooms", args.classroomId)
        if (classroom?.userId !== user._id) throw new Error("this teacher doesnt own this classroom")
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const expirationDate = Date.now() + sevenDaysInMs;
        return await ctx.db.insert("rewards", {
            classroomId: classroom._id,
            name: args.name,
            cost: args.cost,
            teacherId: user._id,
            expireAt: expirationDate
            })
    }
})