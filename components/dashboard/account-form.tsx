"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { updateProfile } from "@/lib/account/actions";
import { User, ImageIcon } from "lucide-react";

const UPLOAD_HANDLER = "/api/upload";

type AccountFormProps = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };

}

export function AccountForm({
  user: initialUser,
}: AccountFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name);
  const [image, setImage] = useState<string | null>(initialUser.image);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProfileMessage(null);
    try {
      const pathname = `avatars/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-")}`;
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: UPLOAD_HANDLER,
      });
      setImage(blob.url);
      const result = await updateProfile({ image: blob.url });
      if (result.success) {
        setProfileMessage({ type: "success", text: "Profile image updated." });
        router.refresh();
      } else {
        setProfileMessage({ type: "error", text: result.error ?? "Failed to update image." });
      }
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmitName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingProfile(true);
    setProfileMessage(null);
    const result = await updateProfile({ name: name.trim() });
    if (result.success) {
      setProfileMessage({ type: "success", text: "Name updated." });
      router.refresh();
    } else {
      setProfileMessage({ type: "error", text: result.error ?? "Failed to update name." });
    }
    setSavingProfile(false);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" />
            Profile
          </CardTitle>
          <CardDescription>Update your display name and profile photo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col items-start gap-2">
              <Avatar size="lg" className="size-20">
                {image ? (
                  <AvatarImage src={image} alt="" />
                ) : null}
                <AvatarFallback className="text-lg">
                  {name.slice(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Spinner className="size-4" />
                ) : (
                  <>
                    <ImageIcon className="size-4" />
                    Change photo
                  </>
                )}
              </Button>
            </div>
            <form onSubmit={handleSubmitName} className="flex-1 space-y-4">
              <FieldGroup>
                <FieldLabel>Display name</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="max-w-xs"
                  />
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? <Spinner className="size-4" /> : "Save"}
                  </Button>
                </div>
                <FieldError />
              </FieldGroup>
            </form>
          </div>
          {profileMessage && (
            <p
              className={
                profileMessage.type === "success"
                  ? "text-sm text-green-600 dark:text-green-400"
                  : "text-sm text-red-600 dark:text-red-400"
              }
            >
              {profileMessage.text}
            </p>
          )}
        </CardContent>
      </Card>

     
    </div>
  );
}


