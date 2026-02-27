import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const CreateUser = mutation({
    args : {
        clerkId : v.string(), 
        fullname : v.string(), 
        email : v.string(), 
        role : v.union(v.literal("pupil"), v.literal("teacher"), v.literal("admin")),
        pointBalance : v.number(),
        
    
    },
       
    handler : async (ctx , args) => {
        const existingUser = await ctx.db.query("users").withIndex("by_clerkId", q =>
            q.eq("clerkId", args.clerkId)
        ).unique();

        if(!existingUser){
            await ctx.db.insert('users', {
                clerkId : args.clerkId,
                fullname : args.fullname,
                email : args.email,
                role : args.role,
                pointBalance : args.pointBalance,
                
            })
        }
        return existingUser?._id
    }
})

export const getUserByClerkId = query({
    args : {}, 
    handler : async (ctx) => {
        const authenticatedUser = await ctx.auth.getUserIdentity()
        if (!authenticatedUser) {
            return "No authenticated user";
        }
        const user = await ctx.db.query("users").withIndex('by_clerkId' , 
            q => q.eq("clerkId", authenticatedUser.subject)
        ).unique()
        return user
    }
})

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (currentUser?.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("users").collect();
  },
});

export const promoteUser = mutation({
  args: { 
    userId: v.id("users"), 
    role: v.union(v.literal("pupil"), v.literal("teacher"), v.literal("admin")) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (adminUser?.role !== "admin") {
      throw new Error("Unauthorized: Only admins can modify roles");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return { success: true };
  },
});