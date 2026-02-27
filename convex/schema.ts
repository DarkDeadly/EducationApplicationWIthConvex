import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    users : defineTable({
        clerkId : v.string(),
        fullname : v.string(),
        email : v.string(),
        role : v.union(v.literal("pupil"), v.literal("teacher"), v.literal("admin")),
        pointBalance: v.number(),
        classroomId : v.optional(v.id("classrooms"))
    }).index("by_clerkId", ["clerkId"])
    .index("by_classroom" , ["classroomId"])
    ,

     classrooms : defineTable({
      name : v.string(),
      userId : v.id("users"),
      pin : v.string(),
      isActive : v.boolean()
    }).index("by_user", ["userId"]),

    courses : defineTable({
        title : v.string(),
        description : v.string(),
        teacherId : v.id("users"),
        classroomId : v.id("classrooms"),
        isActive : v.boolean()
    })
    .index("by_classroom" , ["classroomId"])
    .index("by_teacher" , ["teacherId"])
    ,
    pointSystem : defineTable({
        pupilId : v.id("users"),
        ammount : v.number(),
        reason : v.string(),
        givenBy : v.id("users"),
        type : v.union(v.literal("earned"), v.literal("penalty"))
    })
    .index("by_pupil" , ["pupilId"]),
    rewards : defineTable({
        name : v.string(),
        cost : v.number(),
        teacherId : v.id("users"),
        classroomId : v.id("classrooms"),
        expireAt : v.optional(v.number()),
    }).index("by_Teacher" , ["teacherId"])
    .index("by_classroom" , ["classroomId"]),
    rewardPurchase : defineTable({
        rewardId : v.id("rewards"),
        rewardName : v.string(),
        pupilId : v.id("users"),
        classroomId:v.id("classrooms"),
        pointsSpent:v.number()
    })
    .index("by_Pupil" , ["pupilId"])
    .index("by_reward" , ["rewardId"]),
   materials: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    storageId: v.id("_storage"), // Store the ID, not just the URL
    duration: v.number(),
    fileSize: v.number()
}).index("by_course", ["courseId"])
})

