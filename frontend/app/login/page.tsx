"use client";

import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("token", data.access_token);

        login(username);
        toast.success("로그인 성공");
        router.push("/");
      } else {
        const errorData = await response.json();

        toast.error(`로그인 실패: ${errorData.message}`);
      }
    } catch (error) {
      toast.error("로그인 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center">
          <h1 className="text-2xl font-bold">로그인</h1>
        </CardHeader>
        <CardBody>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              required
              label="계정명"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              required
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              type="submit"
            >
              {isLoading ? "그인 중..." : "로그인"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
