import React from "react";
import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import { getPostById } from "@/lib/blog-service";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="py-2">
      <PostForm initialData={post} isEdit={true} />
    </div>
  );
}
