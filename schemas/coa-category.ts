import * as z from "zod"

const baseCoaCategorySchema = z.object({
  coaCategoryId: z.number().optional(),
  coaCategoryCode: z
    .string()
    .min(1, { message: "COA category code is required" })
    .max(50, { message: "COA category code cannot exceed 50 characters" }),
  coaCategoryName: z
    .string()
    .min(2, { message: "COA category name must be at least 2 characters" })
    .max(150, { message: "COA category name cannot exceed 150 characters" }),
  seqNo: z.number().min(0, { message: "Sequence number is required" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export const coaCategory1Schema = baseCoaCategorySchema
export type CoaCategory1SchemaType = z.infer<typeof coaCategory1Schema>

export const coaCategory2Schema = baseCoaCategorySchema
export type CoaCategory2SchemaType = z.infer<typeof coaCategory2Schema>

export const coaCategory3Schema = baseCoaCategorySchema
export type CoaCategory3SchemaType = z.infer<typeof coaCategory3Schema>
