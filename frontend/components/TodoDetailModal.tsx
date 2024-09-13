import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";

interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TodoDetailModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTodo: Todo) => void;
}

const TodoDetailModal: React.FC<TodoDetailModalProps> = ({
  todo,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [editedTodo, setEditedTodo] = useState<Todo | null>(null);

  useEffect(() => {
    setEditedTodo(todo);
  }, [todo]);

  if (!editedTodo) return null;

  const handleUpdate = () => {
    if (editedTodo) {
      const updatedTodo = {
        ...editedTodo,
        updatedAt: new Date().toISOString(),
      };

      onUpdate(updatedTodo);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">할 일 상세</ModalHeader>
        <ModalBody>
          <Input
            label="제목"
            value={editedTodo.title}
            onChange={(e) =>
              setEditedTodo({ ...editedTodo, title: e.target.value })
            }
          />
          <Textarea
            label="설명"
            value={editedTodo.description || ""}
            onChange={(e) =>
              setEditedTodo({ ...editedTodo, description: e.target.value })
            }
          />
          <p>
            <strong>완료 여부:</strong>{" "}
            {editedTodo.completed ? "완료" : "미완료"}
          </p>
          <p>
            <strong>생성일:</strong>{" "}
            {new Date(editedTodo.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>최종 수정일:</strong>{" "}
            {new Date(editedTodo.updatedAt).toLocaleString()}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={handleUpdate}>
            수정
          </Button>
          <Button color="danger" onPress={onClose}>
            취소
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TodoDetailModal;
