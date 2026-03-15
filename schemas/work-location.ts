import * as z from "zod"

export const workLocationSchema = z.object({
  workLocationId: z.number().optional(),
  workLocationCode: z
    .string()
    .max(50, { message: "Work location code cannot exceed 50 characters" })
    .optional(),
  workLocationName: z
    .string()
    .min(2, { message: "Work location name must be at least 2 characters" })
    .max(150, { message: "Work location name cannot exceed 150 characters" }),
  address1: z.string().max(255).optional(),
  address2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  countryId: z.number().min(1, { message: "Country is required" }),
  isActive: z.boolean(),
})

export type WorkLocationSchemaType = z.infer<typeof workLocationSchema>
