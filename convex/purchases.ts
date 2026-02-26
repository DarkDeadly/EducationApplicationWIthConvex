import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const purchasReward = mutation({
    args : {classId : v.id("classrooms") , rewardId : v.id("rewards")},
    handler : async(ctx , args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const user = await ctx.db.query("users").withIndex("by_clerkId", 
            q => q.eq("clerkId" , identity.subject)
        ).unique()
        if (user?.role !== "pupil") throw new Error("only pupils are allowed to buy rewards")
            const classroom = await ctx.db.get("classrooms", args.classId)
        if (classroom?._id !== user?.classroomId) throw new Error("you are not enrolled in this classroom")
            const reward = await ctx.db.get("rewards" , args.rewardId)
        if (reward!.cost > user.pointBalance) throw new Error("not enough to buy it")
            await ctx.db.insert("rewardPurchase" , {
                classroomId : args.classId,
                pupilId : user._id ,
                rewardId : args.rewardId ,
                pointsSpent : reward!.cost,
                rewardName : reward!.name

            })
            const userBalance = user.pointBalance ?? 0;
           // 2. Deduct the Points (Corrected Syntax)
        await ctx.db.patch(user._id, {
            pointBalance: userBalance - reward!.cost
        });
    }
})

export const getPupilPurhcases = query({
    args : {pupilId : v.id("users") , classId : v.id("classrooms")},
    handler : async(ctx , args) => {
        const identity = await ctx.auth.getUserIdentity()
        if(!identity)return []
        const teacher = await ctx.db.query("users").withIndex("by_clerkId"
            , q => q.eq("clerkId" , identity.subject)
        ).unique()
        if (teacher?.role !=="teacher") throw new Error("you are not a teacher")
            const classroom = await ctx.db.get("classrooms" , args.classId)
        if (classroom?.userId !== teacher?._id) throw new Error ("you dont teach this class")
            const purchases = await ctx.db.query("rewardPurchase").withIndex("by_Pupil" , 
                q => q.eq("pupilId" , args.pupilId)
            ).collect()

            return await Promise.all(
            purchases.map(async (purchase) => {
                const reward = await ctx.db.get(purchase.rewardId);
                return {
                    ...purchase,
                    rewardName: reward?.name ?? "تم حذف المكافئة",
                };
            })
        );
            
    }
})