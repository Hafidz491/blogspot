import React from "react";
import PostForm from "@/components/admin/PostForm";

export const metadata = {
  title: "Buat Artikel Baru — Admin Dashboard",
};

export default function CreatePostPage() {
  return (
    <div className="py-2">
      <PostForm isEdit={false} />
    </div>
  );
}
