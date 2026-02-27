import { mixed, object, string } from "yup";


export const courseSchema = object({
    title: string().required("هذه الخانة اساسية"),
    description: string().required("هذه الخانة اساسية")
})

export const MaterialSchema = object({
    title: string().required("هذه الخانة اساسية"),
    file: mixed().required("يجب اختيار ملف")
})