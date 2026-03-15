import * as z from "zod"

export const gstCategorySchema = z.object({
  gstCategoryId: z.number().optional(),
  gstCategoryCode: z
    .string()
    .min(1, { message: "GST category code is required" })
    .max(50, { message: "GST category code cannot exceed 50 characters" }),
  gstCategoryName: z
    .string()
    .min(2, { message: "GST category name must be at least 2 characters" })
    .max(150, { message: "GST category name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type GstCategorySchemaType = z.infer<typeof gstCategorySchema>
