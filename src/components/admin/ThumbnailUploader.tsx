"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, Image as ImageIcon, Link as LinkIcon, Loader2, RefreshCw } from "lucide-react";
import { uploadMediaToSupabase } from "@/lib/blog-service";

interface ThumbnailUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFileUpload(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFileUpload(files[0]);
    }
  };

  const processFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed (PNG, JPG, WebP, GIF, SVG).");
      return;
    }

    try {
      setIsUploading(true);
      const { url, error } = await uploadMediaToSupabase(file, "thumbnails");
      if (error || !url) {
        alert("Failed to upload image to storage: " + (error || "Unknown error"));
        return;
      }
      onChange(url);
    } catch (err: unknown) {
      console.error(err);
      alert("An unexpected error occurred while uploading thumbnail.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSetUrl = () => {
    if (inputUrl.trim()) {
      onChange(inputUrl.trim());
      setInputUrl("");
      setShowUrlInput(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div className="relative group w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs">
          <Image
            src={value}
            alt="Post Thumbnail Preview"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-102"
            unoptimized
          />
          <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-white/90 text-stone-900 font-medium text-xs flex items-center gap-1.5 shadow-md hover:bg-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Image
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-4 py-2 rounded-xl bg-red-600/90 text-white font-medium text-xs flex items-center gap-1.5 shadow-md hover:bg-red-600 transition"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
          <div className="absolute bottom-3 left-3 bg-stone-900/70 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3" />
            <span>Thumbnail Ready</span>
          </div>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-amber-700 bg-amber-50/50 scale-[1.01]"
              : "border-stone-300 bg-stone-50/70 hover:bg-stone-100/80 hover:border-stone-400"
          }`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="py-6 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
              <p className="text-sm font-medium text-stone-700">
                Uploading thumbnail to storage...
              </p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center mb-3 text-stone-600 group-hover:text-stone-900 transition">
                <UploadCloud className="w-7 h-7 text-stone-500" />
              </div>
              <h4 className="text-sm font-semibold text-stone-800">
                Drag & drop an image here, or click to browse
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Supports PNG, JPG, WebP, SVG (Max. 10MB). Image is securely hosted.
              </p>

              <div
                className="mt-4 flex items-center gap-3 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center gap-1"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Or use an external image URL
                </button>
              </div>

              {showUrlInput && (
                <div
                  className="mt-4 w-full max-w-md flex items-center gap-2 p-1 bg-white rounded-xl border border-stone-300 shadow-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 text-xs text-stone-800 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSetUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSetUrl}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800"
                  >
                    Apply
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
