import { object, string } from "yup";


export const userSchema = object({
    fullname : string().required("الاسم الكامل مطلوب"),
    email : string().email("بريد إلكتروني غير صالح").required("البريد الإلكتروني مطلوب"),
    password : string().min(8 , "يجب أن تحتوي كلمة المرور على 8 أحرف أو أكثر").required("كلمة المرور مطلوبة"),
})

export const loginSchema = object({
    email : string().email("بريد إلكتروني غير صالح").required("البريد الإلكتروني مطلوب"),
    password : string().required("كلمة المرور مطلوبة"),
})