"use client";

import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("회원가입 성공! 로그인 페이지로 이동합니다.");
        router.push("/login");
      } else {
        toast.error(
          `회원가입 실패: ${data.message || "알 수 없는 오류가 발생했습니다."}`,
        );
      }
    } catch (error) {
      toast.error("회원가입 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="flex justify-center">
          <h1 className="text-2xl font-bold">회원가입</h1>
        </CardHeader>
        <CardBody>
          <form className="space-y-4" onSubmit={handleRegister}>
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
            <Input
              required
              label="이름"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              className="w-full"
              color="primary"
              isLoading={isLoading}
              type="submit"
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link className="text-primary" href="/login">
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
