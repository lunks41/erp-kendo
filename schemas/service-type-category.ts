import * as z from "zod"

export const serviceTypeCategorySchema = z.object({
  serviceTypeCategoryId: z.number().optional(),
  serviceTypeCategoryCode: z
    .string()
    .min(1, { message: "Service type category code is required" })
    .max(50, { message: "Service type category code cannot exceed 50 characters" }),
  serviceTypeCategoryName: z
    .string()
    .min(2, { message: "Service type category name must be at least 2 characters" })
    .max(150, { message: "Service type category name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type ServiceTypeCategorySchemaType = z.infer<typeof serviceTypeCategorySchema>
