import * as z from "zod";

export const departmentSchema = z.object({
  departmentId: z.number().optional(),
  departmentCode: z
    .string()
    .min(1, { message: "Department code is required" })
    .max(50, { message: "Department code cannot exceed 50 characters" }),
  departmentName: z
    .string()
    .min(2, { message: "Department name must be at least 2 characters" })
    .max(150, { message: "Department name cannot exceed 150 characters" }),
  remarks: z
    .string()
    .max(255, { message: "Remarks cannot exceed 255 characters" })
    .optional(),
  isActive: z.boolean(),
});

export type DepartmentSchemaType = z.infer<typeof departmentSchema>;
