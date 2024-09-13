"use client";

import { useState, useEffect, useRef } from "react";
import { Input, Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/utils/api";
import { getSignedUrl } from "@/utils/s3";

interface UserProfile {
  username: string;
  name: string;
  isVerified: boolean;
  lastLogin: string | null;
  roles: string[];
  avatar: string;
  bio: string;
  location: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const { username, logout } = useAuth();
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { checkTokenExpiration } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    if (profile?.avatar) {
      // URL에서 키 추출
      const key = profile.avatar.split("/").slice(-2).join("/");

      getSignedUrl(key)
        .then((url) => {
          setAvatarUrl(url);
        })
        .catch((error) => {
          console.error("Error getting signed URL:", error);
        });
    }
  }, [profile?.avatar]);

  const fetchProfile = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await apiRequest(
        `${API_URL}/users/profile`,
        {
          method: "GET",
        },
        checkTokenExpiration,
      );

      if (response.ok) {
        const data = await response.json();

        setProfile(data);
        setEditedProfile(data);
      } else {
        console.error("프로필 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Token expired") {
        // 토큰이 만료되었을 때 처리
        logout();
      } else {
        console.error("네트워크 오류가 발생합니다.", error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setAvatarFile(file);
      const localUrl = URL.createObjectURL(file);

      setEditedProfile((prev) => ({
        ...prev,
        avatar: localUrl,
      }));
      setAvatarUrl(localUrl);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const formData = new FormData();

      Object.keys(editedProfile).forEach((key) => {
        const value = editedProfile[key as keyof UserProfile];

        if (key === "avatar") {
          if (avatarFile) {
            formData.append("avatar", avatarFile);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await apiRequest(
        `${API_URL}/users/profile`,
        {
          method: "PATCH",
          body: formData,
        },
        checkTokenExpiration,
      );

      if (response.ok) {
        const updatedProfile = await response.json();

        setProfile(updatedProfile);
        setIsEditing(false);
        setAvatarFile(null);
        toast.success("프로필이 성공적으로 업데이트되었습니다.");
      } else {
        toast.error("프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      if (error instanceof Error && error.message === "Token expired") {
        logout();
        toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        console.error("네트워크 오류가 발생했습니다.", error);
        toast.error("네트워크 오류가 발생했습니다.");
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      )
    ) {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await apiRequest(
          `${API_URL}/users/profile`,
          {
            method: "DELETE",
          },
          checkTokenExpiration,
        );

        if (response.ok) {
          toast.success("계정이 성공적으로 삭제되었습니다.");
          logout();
          router.push("/");
        } else {
          toast.error("계정 삭제에 실패했습니다.");
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Token expired") {
          logout();
          toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          console.error("계정 삭제 중 오류 발생:", error);
          toast.error("네트워크 오류가 발생했습니다.");
        }
      }
    }
  };

  if (!profile) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-center">
          <h1 className="text-2xl font-bold">내 정보</h1>
        </CardHeader>
        <CardBody>
          <div className="flex">
            <div className="w-1/3 pr-4 flex flex-col items-center">
              <Image
                alt="Avatar"
                className="rounded-full w-32 h-32 object-cover"
                fallbackSrc="https://images.unsplash.com/broken"
                src={avatarUrl || undefined}
              />
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    type="file"
                    onChange={handleFileChange}
                  />
                  <Button
                    className="mt-2"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    이미지 선택
                  </Button>
                </>
              )}
            </div>
            <div className="w-2/3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">사용자명:</span>
                  <span>{profile.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">이름:</span>
                  {isEditing ? (
                    <Input
                      className="max-w-[200px]"
                      size="sm"
                      value={editedProfile.name || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{profile.name}</span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">인증 상태:</span>
                  <span>{profile.isVerified ? "인증됨" : "미인증"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">마지막 로그인:</span>
                  <span>
                    {profile.lastLogin
                      ? new Date(profile.lastLogin).toLocaleString()
                      : "없음"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">역할:</span>
                  <span>{profile.roles.join(", ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">위치:</span>
                  {isEditing ? (
                    <Input
                      className="max-w-[200px]"
                      size="sm"
                      value={editedProfile.location || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          location: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <span>{profile.location || "없음"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">자기소개</h2>
            {isEditing ? (
              <Textarea
                value={editedProfile.bio || ""}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, bio: e.target.value })
                }
              />
            ) : (
              <p>{profile.bio || "자기소개가 없습니다."}</p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            {isEditing ? (
              <>
                <Button color="primary" onClick={handleUpdateProfile}>
                  저장
                </Button>
                <Button className="ml-2" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)}>편집</Button>
                <Button
                  className="ml-2"
                  color="danger"
                  onClick={handleDeleteAccount}
                >
                  계정 삭제
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
