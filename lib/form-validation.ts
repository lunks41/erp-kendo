/**
 * Form validation utilities for React Hook Form + Zod
 *
 * Use zodResolver with your Zod schemas to validate forms before submit.
 * Example:
 *
 *   import { useForm } from "react-hook-form"
 *   import { zodResolver } from "@hookform/resolvers/zod"
 *   import { ArInvoiceHdSchema } from "@/schemas/ar-invoice"
 *
 *   const form = useForm({
 *     resolver: zodResolver(ArInvoiceHdSchema(required, visible)),
 *     defaultValues: { ... },
 *   })
 */

export { zodResolver } from "@hookform/resolvers/zod"
