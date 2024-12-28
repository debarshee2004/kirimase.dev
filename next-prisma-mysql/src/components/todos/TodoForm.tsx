import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/todos/useOptimisticTodos";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";


import { Checkbox } from "@/components/ui/checkbox"

import { type Todo, insertTodoParams } from "@/lib/db/schema/todos";
import {
  createTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from "@/lib/actions/todos";


const TodoForm = ({
  
  todo,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  todo?: Todo | null;
  
  openModal?: (todo?: Todo) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Todo>(insertTodoParams);
  const editing = !!todo?.id;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("todos");


  const onSuccess = (
    action: Action,
    data?: { error: string; values: Todo },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Todo ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const todoParsed = await insertTodoParams.safeParseAsync({  ...payload });
    if (!todoParsed.success) {
      setErrors(todoParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = todoParsed.data;
    const pendingTodo: Todo = {
      updatedAt: todo?.updatedAt ?? new Date(),
      createdAt: todo?.createdAt ?? new Date(),
      id: todo?.id ?? "",
      userId: todo?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic && addOptimistic({
          data: pendingTodo,
          action: editing ? "update" : "create",
        });

        const error = editing
          ? await updateTodoAction({ ...values, id: todo.id })
          : await createTodoAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingTodo 
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
              <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.todoTitle ? "text-destructive" : "",
          )}
        >
          Todo Title
        </Label>
        <Input
          type="text"
          name="todoTitle"
          className={cn(errors?.todoTitle ? "ring ring-destructive" : "")}
          defaultValue={todo?.todoTitle ?? ""}
        />
        {errors?.todoTitle ? (
          <p className="text-xs text-destructive mt-2">{errors.todoTitle[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
<div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.todoStatus ? "text-destructive" : "",
          )}
        >
          Todo Status
        </Label>
        <br />
        <Checkbox defaultChecked={todo?.todoStatus} name={'todoStatus'} className={cn(errors?.todoStatus ? "ring ring-destructive" : "")} />
        {errors?.todoStatus ? (
          <p className="text-xs text-destructive mt-2">{errors.todoStatus[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
        <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.todoDescription ? "text-destructive" : "",
          )}
        >
          Todo Description
        </Label>
        <Input
          type="text"
          name="todoDescription"
          className={cn(errors?.todoDescription ? "ring ring-destructive" : "")}
          defaultValue={todo?.todoDescription ?? ""}
        />
        {errors?.todoDescription ? (
          <p className="text-xs text-destructive mt-2">{errors.todoDescription[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: todo });
              const error = await deleteTodoAction(todo.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: todo,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default TodoForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
