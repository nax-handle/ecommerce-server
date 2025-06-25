"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Function to ensure the image URL is valid
  const getImageUrl = (url: string) => {
    try {
      return new URL(url).toString();
    } catch (e) {
      // If the URL is invalid, assume it's a relative path
      return url.startsWith("/") ? url : `/${url}`;
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={getImageUrl(images[selectedImage])}
          alt={`Product image ${selectedImage + 1}`}
          className="h-full w-full object-cover object-center"
          width={600}
          height={600}
          priority
        />
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <div className="absolute bottom-4 right-4 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {selectedImage + 1}/{images.length}
        </div>
      </div>
      <div className="mt-5">
        <div className="flex gap-2 overflow-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`gallery-thumb-${index}`}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative flex h-20 w-20 shrink-0 mt-2 items-center justify-center rounded-md hover:opacity-75",
                selectedImage === index
                  ? "ring-2 ring-blue-500"
                  : "ring-1 ring-gray-200"
              )}
            >
              <Image
                src={getImageUrl(image)}
                alt={`Product thumbnail ${index + 1}`}
                className="h-full w-full rounded-md object-cover object-center"
                width={80}
                height={80}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-4">
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Chia sẻ
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-500">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          Yêu thích
        </button>
      </div>
    </div>
  );
}
