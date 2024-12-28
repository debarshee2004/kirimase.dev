import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { type getTodos } from "@/lib/api/todos/queries";

import { nanoid, timestamps } from "@/lib/utils";


export const todos = sqliteTable('todos', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  todoTitle: text("todo_title").notNull(),
  todoBoolean: integer("todo_boolean", { mode: "boolean" }).notNull(),
  todoDescription: text("todo_description").notNull(),
  userId: text("user_id").notNull(),
  
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

}, (todos) => {
  return {
    todoTitleIndex: uniqueIndex('todo_todo_title_idx').on(todos.todoTitle),
  }
});


// Schema for todos - used to validate API requests
const baseSchema = createSelectSchema(todos).omit(timestamps)

export const insertTodoSchema = createInsertSchema(todos).omit(timestamps);
export const insertTodoParams = baseSchema.extend({
  todoBoolean: z.coerce.boolean()
}).omit({ 
  id: true,
  userId: true
});

export const updateTodoSchema = baseSchema;
export const updateTodoParams = baseSchema.extend({
  todoBoolean: z.coerce.boolean()
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

