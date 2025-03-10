"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type Todo, CompleteTodo } from "@/lib/db/schema/todos";
import Modal from "@/components/shared/Modal";

import { useOptimisticTodos } from "@/app/(app)/todos/useOptimisticTodos";
import { Button } from "@/components/ui/button";
import TodoForm from "./TodoForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (todo?: Todo) => void;

export default function TodoList({
  todos,
   
}: {
  todos: CompleteTodo[];
   
}) {
  const { optimisticTodos, addOptimisticTodo } = useOptimisticTodos(
    todos,
     
  );
  const [open, setOpen] = useState(false);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const openModal = (todo?: Todo) => {
    setOpen(true);
    todo ? setActiveTodo(todo) : setActiveTodo(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeTodo ? "Edit Todo" : "Create Todo"}
      >
        <TodoForm
          todo={activeTodo}
          addOptimistic={addOptimisticTodo}
          openModal={openModal}
          closeModal={closeModal}
          
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticTodos.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticTodos.map((todo) => (
            <Todo
              todo={todo}
              key={todo.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Todo = ({
  todo,
  openModal,
}: {
  todo: CompleteTodo;
  openModal: TOpenModal;
}) => {
  const optimistic = todo.id === "optimistic";
  const deleting = todo.id === "delete";
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes("todos")
    ? pathname
    : pathname + "/todos/";


  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{todo.todoTitle}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={ basePath + "/" + todo.id }>
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No todos
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new todo.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Todos </Button>
      </div>
    </div>
  );
};
