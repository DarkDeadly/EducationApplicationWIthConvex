import { object, string } from "yup";


export const courseSchema = object({
    title : string().required("هذه الخانة اساسية"),
    description: string().required("هذه الخانة اساسية")
})