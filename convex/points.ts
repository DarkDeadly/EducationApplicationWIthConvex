import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const PointManagementSystem = mutation({
    args : {
         pupilId : v.id("users"),
        ammount : v.number(),
        reason : v.string(),
        
        type : v.union(v.literal("earned"), v.literal("penalty"))
    } ,
    handler : async(ctx , args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) []
        const user =  await ctx.db.query("users").withIndex("by_clerkId" ,
            q =>  q.eq("clerkId" , identity!.subject)
        ).unique()
        if (user?.role !== 'teacher') throw new Error("Only teachers can check pupils in classrooms") 
            const pointChange = args.type === "earned" ? args.ammount : -args.ammount;
        
                await ctx.db.insert("pointSystem" , {
                    pupilId : args.pupilId,
                    ammount : pointChange,
                    reason : args.reason ,
                    givenBy : user._id,
                    type : args.type,
                    
                })
           
            const pupil = await ctx.db.get(args.pupilId);
        if (pupil) {
            await ctx.db.patch(args.pupilId, {
                pointBalance: (pupil.pointBalance ?? 0) + pointChange
            });
        }
           
    }
})

export const showHistory = query({
    args : {pupilId : v.id("users")},
    handler : async(ctx , args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) []
        const user =  await ctx.db.query("users").withIndex("by_clerkId" ,
            q =>  q.eq("clerkId" , identity!.subject)
        ).unique()
        if (user?.role !== 'teacher') throw new Error("Only teachers can check pupils Point History") 
            return await ctx.db.query("pointSystem").withIndex("by_pupil" , q => q.eq(
                "pupilId" , args.pupilId
            )).order("desc").collect()
    }
})