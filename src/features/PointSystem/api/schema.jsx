import { number, object, string } from "yup";




export const pointSystemSchema = object({
    reason : string().required("هذه الخانة اساسية"),
    ammount : number().required("هذه الخانة اساسية").min(1)
})