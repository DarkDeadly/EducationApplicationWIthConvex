import { object, string } from "yup";


export const createClassroomSchema = object({
    name : string().required("اسم القسم مطلوب"),
    pin : string().min(4, "يجب أن يتكون رمز الدخول من 4 أرقام").required("رمز الدخول مطلوب"),
})