
import { number, object, string } from "yup";


export const rewardSchema = object({
    name : string().required("هذه الخانة اساسية"),
    cost : number().required("هذه الخانة اساسية").min(1)
})