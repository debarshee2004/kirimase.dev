import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getTodoById } from "@/lib/api/todos/queries";
import OptimisticTodo from "./OptimisticTodo";
import { checkAuth } from "@/lib/auth/utils";


import { BackButton } from "@/components/shared/BackButton";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function TodoPage({
  params,
}: {
  params: { todoId: string };
}) {

  return (
    <main className="overflow-auto">
      <Todo id={params.todoId} />
    </main>
  );
}

const Todo = async ({ id }: { id: string }) => {
  await checkAuth();

  const { todo } = await getTodoById(id);
  

  if (!todo) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="todos" />
        <OptimisticTodo todo={todo}  />
      </div>
    </Suspense>
  );
};
