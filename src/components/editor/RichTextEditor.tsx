"use client";

import React, { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Upload,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import { uploadMediaToSupabase } from "@/lib/blog-service";

interface RichTextEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your engaging story, insights, and lessons here...",
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaModalType, setMediaModalType] = useState<"image-url" | "youtube" | null>(null);
  const [mediaInputUrl, setMediaInputUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-6 shadow-sm mx-auto",
        },
      }),
      Youtube.configure({
        inline: false,
        nocookie: true,
        HTMLAttributes: {
          class: "rounded-xl overflow-hidden w-full aspect-video my-6 shadow-sm",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-800 underline underline-offset-4 font-medium hover:text-amber-900",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if changed externally (e.g. edit mode initial load)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!isMounted || !editor) {
    return (
      <div className="w-full h-80 rounded-2xl border border-stone-200 bg-white/70 animate-pulse flex items-center justify-center text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Editor...</span>
      </div>
    );
  }

  // Handle direct file upload for editor images
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { url, error } = await uploadMediaToSupabase(file, "editor");
      if (error || !url) {
        alert("Upload media failed: " + (error || "Unknown error"));
        return;
      }
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err: unknown) {
      console.error(err);
      alert("Error uploading media file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add Link
  const setLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let finalUrl = linkUrl;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: finalUrl }).run();
    }
    setLinkModalOpen(false);
    setLinkUrl("");
  };

  // Add Image or Video from URL
  const handleInsertMediaUrl = () => {
    if (!mediaInputUrl.trim()) return;

    if (mediaModalType === "image-url") {
      editor.chain().focus().setImage({ src: mediaInputUrl.trim() }).run();
    } else if (mediaModalType === "youtube") {
      editor.chain().focus().setYoutubeVideo({ src: mediaInputUrl.trim() }).run();
    }

    setMediaModalType(null);
    setMediaInputUrl("");
  };

  // Word and character count
  const textContent = editor.getText();
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-stone-400 transition-all">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Editor Main Toolbar */}
      <div className="bg-[#FAF8F5] border-b border-stone-200/90 p-2.5 flex flex-wrap items-center gap-1.5 text-stone-700">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-stone-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r border-stone-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg font-heading font-bold text-xs flex items-center gap-1 transition ${
              editor.isActive("heading", { level: 1 })
                ? "bg-stone-900 text-white"
                : "hover:bg-stone-200"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
            <span>H1</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg font-heading font-bold text-xs flex items-center gap-1 transition ${
              editor.isActive("heading", { level: 2 })
                ? "bg-stone-900 text-white"
                : "hover:bg-stone-200"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
            <span>H2</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg font-heading font-bold text-xs flex items-center gap-1 transition ${
              editor.isActive("heading", { level: 3 })
                ? "bg-stone-900 text-white"
                : "hover:bg-stone-200"
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
            <span>H3</span>
          </button>
        </div>

        {/* Text Styles: Bold, Italic, Underline, Strike */}
        <div className="flex items-center gap-1 pr-2 border-r border-stone-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("bold") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("italic") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("underline") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("strike") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
        </div>

        {/* Text Alignments */}
        <div className="flex items-center gap-1 pr-2 border-r border-stone-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive({ textAlign: "left" }) ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive({ textAlign: "center" }) ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive({ textAlign: "right" }) ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive({ textAlign: "justify" }) ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center gap-1 pr-2 border-r border-stone-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("bulletList") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("orderedList") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("blockquote") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("codeBlock") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Links, Media & Upload */}
        <div className="flex items-center gap-1">
          {/* Link Button */}
          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes("link").href || "";
              setLinkUrl(previousUrl);
              setLinkModalOpen(true);
            }}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive("link") ? "bg-stone-900 text-white" : "hover:bg-stone-200"
            }`}
            title="Insert / Edit Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Upload Image to Supabase Storage */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-xs font-medium text-stone-800 transition"
            title="Upload Image to Supabase Storage"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-stone-600" />
            )}
            <span>Upload Image</span>
          </button>

          {/* Image by URL */}
          <button
            type="button"
            onClick={() => setMediaModalType("image-url")}
            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-700 transition"
            title="Insert Image by URL"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* YouTube / Video Embed */}
          <button
            type="button"
            onClick={() => setMediaModalType("youtube")}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-stone-200 text-xs font-medium text-stone-700 transition"
            title="Embed YouTube Video"
          >
            <Video className="w-4 h-4 text-red-600" />
            <span>Embed Video</span>
          </button>
        </div>
      </div>

      {/* Pop-up Modal for Link Input */}
      {linkModalOpen && (
        <div className="bg-stone-50 border-b border-stone-200 p-3 flex items-center gap-2 text-sm animate-in fade-in duration-150">
          <LinkIcon className="w-4 h-4 text-stone-400" />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com/source"
            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              }
            }}
          />
          <button
            type="button"
            onClick={setLink}
            className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
          >
            Save Link
          </button>
          <button
            type="button"
            onClick={() => setLinkModalOpen(false)}
            className="px-2.5 py-1.5 rounded-lg text-stone-600 hover:bg-stone-200 text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Pop-up Modal for Media URL (Image URL or YouTube Video) */}
      {mediaModalType && (
        <div className="bg-amber-50/70 border-b border-amber-200/80 p-3 flex items-center gap-2 text-sm animate-in fade-in duration-150">
          {mediaModalType === "image-url" ? (
            <ImageIcon className="w-4 h-4 text-amber-700" />
          ) : (
            <Video className="w-4 h-4 text-red-600" />
          )}
          <input
            type="url"
            value={mediaInputUrl}
            onChange={(e) => setMediaInputUrl(e.target.value)}
            placeholder={
              mediaModalType === "image-url"
                ? "Enter image URL (https://...jpg, png, webp)"
                : "Enter YouTube Video URL (e.g., https://www.youtube.com/watch?v=...)"
            }
            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleInsertMediaUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleInsertMediaUrl}
            className="px-3.5 py-1.5 rounded-lg bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900"
          >
            Insert {mediaModalType === "image-url" ? "Image" : "Video"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMediaModalType(null);
              setMediaInputUrl("");
            }}
            className="px-2.5 py-1.5 rounded-lg text-stone-600 hover:bg-stone-200 text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="p-6 md:p-8 flex-1 min-h-[360px] cursor-text">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Footer / Stats Bar */}
      <div className="bg-[#FAF8F5] border-t border-stone-200/90 px-4 py-2 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-4">
          <span>
            Words: <strong className="text-stone-700">{wordCount}</strong>
          </span>
          <span>
            Characters: <strong className="text-stone-700">{charCount}</strong>
          </span>
          {isUploading && (
            <span className="flex items-center text-amber-700 font-medium animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              Uploading media to Supabase Storage...
            </span>
          )}
        </div>
        <div className="text-[11px] text-stone-400">
          Markdown / HTML Supported • TipTap Rich Text
        </div>
      </div>
    </div>
  );
}
