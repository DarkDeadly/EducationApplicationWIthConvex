import { object, string } from "yup";

export const ClassEntrySchema = object({
    pin : string().required("للإنضمام هذه الخانة إجبارية")
})