import * as z from "zod"

const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
}

function validatePassword(value: string): boolean {
  if (value.length < passwordRequirements.minLength) return false
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(value))
    return false
  if (passwordRequirements.requireLowercase && !/[a-z]/.test(value))
    return false
  if (passwordRequirements.requireNumber && !/\d/.test(value)) return false
  if (passwordRequirements.requireSpecial && !/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;'`~]/.test(value))
    return false
  return true
}

export const registerSchema = z
  .object({
    userName: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be less than 50 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username may only contain letters, numbers, underscores, and hyphens"
      )
      .trim(),
    userEmail: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .max(100, "Email must be less than 100 characters")
      .trim()
      .toLowerCase(),
    userPassword: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .refine(
        validatePassword,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.userPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterSchemaType = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  userName: z.string().min(1, "Username is required").trim(),
  userPassword: z.string().min(1, "Password is required"),
})

export type LoginSchemaType = z.infer<typeof loginSchema>
