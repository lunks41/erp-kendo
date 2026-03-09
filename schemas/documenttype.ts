import * as z from "zod"

export const documentTypeSchema = z.object({
  documentTypeId: z.number().optional(),
  documentTypeCode: z
    .string()
    .min(1, { message: "Document type code is required" })
    .max(50, { message: "Document type code cannot exceed 50 characters" }),
  documentTypeName: z
    .string()
    .min(1, { message: "Document type name must be at least 1 character" })
    .max(150, { message: "Document type name cannot exceed 150 characters" }),

  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
})

export type DocumentTypeSchemaType = z.infer<typeof documentTypeSchema>

export const documentTypeFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export type DocumentTypeFiltersValues = z.infer<typeof documentTypeFiltersSchema>
