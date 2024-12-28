import { sql } from "drizzle-orm";
import { varchar, boolean, text, timestamp, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getTodos } from "@/lib/api/todos/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const todos = pgTable('todos', {
  id: varchar("id", { length: 191 }).primaryKey().$defaultFn(() => nanoid()),
  todoTitle: varchar("todo_title", { length: 256 }).notNull(),
  todoStatus: boolean("todo_status").notNull(),
  todoDescription: text("todo_description"),
  userId: varchar("user_id", { length: 256 }).notNull(),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),

}, (todos) => {
  return {
    todoTitleIndex: uniqueIndex('todo_todo_title_idx').on(todos.todoTitle),
  }
});


// Schema for todos - used to validate API requests
const baseSchema = createSelectSchema(todos).omit(timestamps)

export const insertTodoSchema = createInsertSchema(todos).omit(timestamps);
export const insertTodoParams = baseSchema.extend({
  todoStatus: z.coerce.boolean()
}).omit({ 
  id: true,
  userId: true
});

export const updateTodoSchema = baseSchema;
export const updateTodoParams = baseSchema.extend({
  todoStatus: z.coerce.boolean()
}).omit({ 
  userId: true
});
export const todoIdSchema = baseSchema.pick({ id: true });

// Types for todos - used to type API request params and within Components
export type Todo = typeof todos.$inferSelect;
export type NewTodo = z.infer<typeof insertTodoSchema>;
export type NewTodoParams = z.infer<typeof insertTodoParams>;
export type UpdateTodoParams = z.infer<typeof updateTodoParams>;
export type TodoId = z.infer<typeof todoIdSchema>["id"];
    
// this type infers the return from getTodos() - meaning it will include any joins
export type CompleteTodo = Awaited<ReturnType<typeof getTodos>>["todos"][number];

