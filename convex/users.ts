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