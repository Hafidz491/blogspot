import React from "react";
import PostForm from "@/components/admin/PostForm";

export const metadata = {
  title: "New Post — Admin Dashboard",
};

export default function CreatePostPage() {
  return (
    <div className="py-2">
      <PostForm isEdit={false} />
    </div>
  );
}
