import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const courseCreation = mutation({
    args: { 
        title: v.string(), 
        description: v.string(), 
        classroomId: v.id("classrooms") ,
        isActive : v.boolean()
    }, 
    handler : async(ctx , args) => {
        const identity  = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const user =  await ctx.db.query("users").withIndex("by_clerkId" ,
            q =>  q.eq("clerkId" , identity.subject)
        ).unique()
        const classroom = await ctx.db.get(args.classroomId)
        if (!classroom || classroom.userId !== user?._id )  throw new Error("ليس صفك")
        const courseContent = await ctx.db.insert("courses" , {
            title : args.title,
            description : args.description ,
            classroomId : args.classroomId , 
            teacherId : user._id,
            isActive :args.isActive

        })

        return courseContent
            
    }
})

export const getClassCourses = query({
    args : {classroomId : v.id("classrooms")},
    handler :async(ctx , args) => {
         const identity  = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const courses = await ctx.db.query("courses")
        .withIndex("by_classroom" , q => q.eq("classroomId" , args.classroomId))
        .collect()
        return courses
    }
})

export const getCoursebyId = query({
    args : {courseId : v.id("courses")} , 
    handler : async(ctx , args) => {
         const identity  = await ctx.auth.getUserIdentity()
        if (!identity) return []
        return await ctx.db.get("courses",args.courseId)
    }
})