import * as z from "zod"
import { CompleteUser, relatedUserSchema } from "./index"

export const todoSchema = z.object({
  id: z.string(),
  todoTitle: z.string(),
  todoStatus: z.boolean(),
  todoDescription: z.string().nullish(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteTodo extends z.infer<typeof todoSchema> {
  user: CompleteUser
}

/**
 * relatedTodoSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedTodoSchema: z.ZodSchema<CompleteTodo> = z.lazy(() => todoSchema.extend({
  user: relatedUserSchema,
}))
