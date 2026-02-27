import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate an upload URL using a mutation that calls storage.generateUploadUrl().
export const generateStorageId = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl()
    }
})

export const AddMaterial = mutation({
    args: {
        title: v.string(),
        storageId: v.id("_storage"),
        fileSize: v.number(),
        duration: v.number(),
        courseId : v.id("courses") // Optional: can be 0 if not calculated
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const user = await ctx.db.query("users").withIndex("by_clerkId",
            q => q.eq("clerkId", identity.subject)
        ).unique()
        if (user?.role !== 'teacher') throw new Error("only teachers allowed to do that")
        const course = await ctx.db.get("courses", args.courseId)
        if (course?.teacherId !== user._id) throw new Error("this is not your course")
        return await ctx.db.insert("materials", {
            title: args.title , 
            courseId : course._id,
            fileSize : args.fileSize,
            duration : args.duration,
            storageId : args.storageId
        })
    }
})

export const getCourseMaterials = query({
    args : {courseId : v.id("courses")},
    handler : async (ctx , args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return []
      const materials  = await ctx.db.query("materials").withIndex("by_course" , 
            q => q.eq("courseId" , args.courseId)
        ).collect()
        return Promise.all(
      materials.map(async (material) => ({
        ...material,
        fileUrl: await ctx.storage.getUrl(material.storageId),
      }))
    );
    }
})