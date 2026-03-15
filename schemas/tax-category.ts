import * as z from "zod"

export const taxCategorySchema = z.object({
  taxCategoryId: z.number().optional(),
  taxCategoryCode: z
    .string()
    .min(1, { message: "Tax category code is required" })
    .max(50, { message: "Tax category code cannot exceed 50 characters" }),
  taxCategoryName: z
    .string()
    .min(2, { message: "Tax category name must be at least 2 characters" })
    .max(150, { message: "Tax category name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type TaxCategorySchemaType = z.infer<typeof taxCategorySchema>
