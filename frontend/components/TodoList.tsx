import React from "react";
import { Checkbox } from "@nextui-org/checkbox";
import { Button } from "@nextui-org/button";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div key={todo._id} className="flex items-center justify-between">
          <Checkbox
            isSelected={todo.completed}
            onValueChange={() => onToggleComplete(todo._id, todo.completed)}
          >
            {todo.title}
          </Checkbox>
          <div>
            <Button color="primary" size="sm" onPress={() => onEdit(todo)}>
              수정
            </Button>
            <Button color="danger" size="sm" onPress={() => onDelete(todo._id)}>
              삭제
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoList;
