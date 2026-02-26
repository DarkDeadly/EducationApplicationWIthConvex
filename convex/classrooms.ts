import { v } from "convex/values";
import { mutation, query } from "./_generated/server";



export const classroomCreation = mutation({
   args: { 
        name: v.string(), 
        pin: v.string() 
    },
    handler : async (ctx , args) => {
        const identity = await ctx.auth.getUserIdentity()
        if(!identity) {
           return "No authenticated user"
        }
        const user = await ctx.db.query("users").withIndex("by_clerkId" , q =>
            q.eq("clerkId", identity.subject)
        ).unique()

        if (user?.role !== "teacher") {
            return "Only teachers can create classrooms"
        }
        const newClassroom = await ctx.db.insert("classrooms", {
            name : args.name,
            userId : user._id,
            pin : args.pin,
            isActive : true
        })
        return newClassroom
        

    }
})

export const getTeacherClassrooms = query({
    args : {} , 
    handler : async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if(!identity) return []
        const user = await ctx.db.query("users").withIndex("by_clerkId" , q =>
            q.eq("clerkId", identity.subject)
        ).unique()

        if (!user) return [];

        const classrooms =  await ctx.db
            .query("classrooms")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

            return classrooms.map((classroom) => ({
                ...classroom,
                teacherName: user.fullname,
                teacherEmail: user.email
            }))
    }

})
export const getClassroom = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return []; // Better to return an empty array than a string for consistency
        }

        // 1. Get all classrooms
        const classrooms = await ctx.db.query("classrooms").order("desc").collect();

        // 2. Decipher the userId for each classroom
        // We use Promise.all to fetch all teacher details simultaneously
        const classroomsWithTeachers = await Promise.all(
            classrooms.map(async (classroom) => {
                // Fetch the teacher document using the ID
                const teacher = await ctx.db.get(classroom.userId);

                return {
                    ...classroom,
                    teacherName: teacher?.fullname ?? "Unknown Teacher",
                    teacherEmail: teacher?.email ?? "No Email",
                };
            })
        );

        return classroomsWithTeachers;
    }
});

export const getPupilsInClass = query({
    // We pass the classroomId so the teacher can switch between their classes
    args: { classroomId: v.id("classrooms") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // 1. Security Check: Make sure the requester is a teacher
        const user = await ctx.db.query("users").withIndex("by_clerkId", q =>
            q.eq("clerkId", identity.subject)
        ).unique();

        if (!user || user.role !== "teacher") {
            throw new Error("Only teachers can check pupils in classrooms");
        }

        // 2. Optimization: Find all users where classroomId matches
        // This uses the index we just added to the schema!
        const pupils = await ctx.db
            .query("users")
            .withIndex("by_classroom", (q) => q.eq("classroomId", args.classroomId))
            .collect();
        const classroom = await ctx.db.get(args.classroomId);
        
        if (!classroom) return null;
        // 3. Return the list of pupils
        const pupilList =  pupils.map((p) => ({
            id: p._id,
            fullname: p.fullname,
            email: p.email,
            pointBalance : p.pointBalance
            
        }));
        const count = pupils.length
        return { pupilList , count  , classroom}
    }
});

export const joinClass = mutation({
    args : {classroomId : v.id("classrooms") , pin : v.string()},
    handler : async(ctx , args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const classroom = await ctx.db.get("classrooms" , args.classroomId)
        if (classroom?.pin !== args.pin) {
            throw new Error("الرمز السري غير صحيح")
        }
        const user = await ctx.db.query("users")
      .withIndex("by_clerkId", q => q.eq("clerkId", identity!.subject))
      .unique();
      await ctx.db.patch(user!._id, {
        classroomId : args.classroomId
      })
    }
})

export const getClassById = query({
    args : {classId : v.id("classrooms")},
    handler : async(ctx , args) => {
        const identity = await ctx.auth.getUserIdentity();
            if (!identity) return [];
            const classroom = await ctx.db.get("classrooms" , args.classId)
            return classroom
        }
        

})
