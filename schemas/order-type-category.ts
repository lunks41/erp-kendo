import * as z from "zod"

export const orderTypeCategorySchema = z.object({
  orderTypeCategoryId: z.number().optional(),
  orderTypeCategoryCode: z
    .string()
    .min(1, { message: "Order type category code is required" })
    .max(50, { message: "Order type category code cannot exceed 50 characters" }),
  orderTypeCategoryName: z
    .string()
    .min(2, { message: "Order type category name must be at least 2 characters" })
    .max(150, { message: "Order type category name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type OrderTypeCategorySchemaType = z.infer<typeof orderTypeCategorySchema>
