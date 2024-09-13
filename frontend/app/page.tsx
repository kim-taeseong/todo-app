"use client";

import { useState, useEffect } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Checkbox } from "@nextui-org/checkbox";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { toast } from "react-toastify";

import { useAuth } from "@/contexts/AuthContext";
import TodoDetailModal from "@/components/TodoDetailModal";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const logError = (error: unknown) => {
  console.log(error);
};

export default function TodoPage() {
  const [todo, setTodo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { username } = useAuth();

  useEffect(() => {
    if (username) {
      fetchTodos();
    }
  }, [username]);

  const fetchTodos = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/todos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setTodos(data);
      } else {
        toast.error("할 일 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      toast.error("네트워크 오류가 발생했습니다.");
      logError(error);
    }
  };

  const handleSubmit = async () => {
    if (todo.trim() === "") return;

    setIsLoading(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");

      console.log(token);
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: todo }),
      });

      if (response.ok) {
        const newTodo = await response.json();

        setTodos([...todos, newTodo]);
        toast.success("할 일이 성공적으로 저장되었습니다.");
        setTodo("");
      } else {
        const errorData = await response.json();

        toast.error(`할 일 저장 중 오류가 발생했습니다: ${errorData.message}`);
        logError(errorData);
      }
    } catch (error) {
      toast.error("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      logError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTodo = async (updatedTodo: Todo) => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/todos/${updatedTodo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTodo),
      });

      if (response.ok) {
        const updatedTodoFromServer = await response.json();

        setTodos(
          todos.map((t) =>
            t._id === updatedTodoFromServer._id ? updatedTodoFromServer : t,
          ),
        );
        toast.success("할 일이 성공적으로 수정되었습니다.");
      } else {
        toast.error("할 일 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("할 일 수정 중 오류 발생:", error);
      toast.error("네트워크 오류가 발생했습니다.");
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        fetchTodos(); // 할 일 목록 새로고침
        toast.success("할 일 상태가 변경되었습니다.");
      } else {
        toast.error("할 일 상태 변경에 실패했습니다.");
      }
    } catch (error) {
      toast.error("네트워크 오류가 발생했습니다.");
      logError(error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo._id !== id));
        toast.success("할 일이 성공적으로 삭제되었습니다.");
      } else {
        toast.error("할 일 삭제에 실패했습니다.");
      }
    } catch (error) {
      toast.error("네트워크 오류가 발생했습니다.");
      logError(error);
    }
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div className="flex flex-col h-screen p-4">
      {username && (
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold mb-4">안녕하세요, {username}님!</h1>
        </div>
      )}
      <div className="flex-grow flex justify-center items-center mb-8">
        <div className="flex flex-col w-full max-w-sm gap-4">
          <Input
            className="w-full"
            disabled={isLoading || !username}
            label="할 일"
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              disabled={isLoading || !username}
              size="lg"
              onClick={handleSubmit}
            >
              {isLoading ? "추가 중..." : "추가"}
            </Button>
          </div>
        </div>
      </div>
      {username ? (
        <div className="flex">
          <div className="w-1/2 pr-2">
            <h2 className="text-xl font-bold mb-4">할 일 목록</h2>
            <Table aria-label="할 일 목록">
              <TableHeader>
                <TableColumn>완료</TableColumn>
                <TableColumn>제목</TableColumn>
                <TableColumn>작업</TableColumn>
              </TableHeader>
              <TableBody>
                {incompleteTodos.map((todo) => (
                  <TableRow key={todo._id}>
                    <TableCell>
                      <Checkbox
                        isSelected={todo.completed}
                        onValueChange={() =>
                          handleToggleComplete(todo._id, todo.completed)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => handleTodoClick(todo)}
                      >
                        {todo.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="danger"
                        size="sm"
                        onPress={() => handleDeleteTodo(todo._id)}
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="w-1/2 pl-2">
            <h2 className="text-xl font-bold mb-4">완료된 할 일</h2>
            <Table aria-label="완료된 할 일 목록">
              <TableHeader>
                <TableColumn>완료</TableColumn>
                <TableColumn>제목</TableColumn>
                <TableColumn>작업</TableColumn>
              </TableHeader>
              <TableBody>
                {completedTodos.map((todo) => (
                  <TableRow key={todo._id}>
                    <TableCell>
                      <Checkbox
                        isSelected={todo.completed}
                        onValueChange={() =>
                          handleToggleComplete(todo._id, todo.completed)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => handleTodoClick(todo)}
                      >
                        {todo.title}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="danger"
                        size="sm"
                        onPress={() => handleDeleteTodo(todo._id)}
                      >
                        삭제
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center mt-4">
          <p>할 일 목록을 보려면 로그인이 필요합니다.</p>
        </div>
      )}
      <TodoDetailModal
        isOpen={isModalOpen}
        todo={selectedTodo}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateTodo}
      />
    </div>
  );
}
