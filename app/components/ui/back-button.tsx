"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()}
      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
    >
      Back
    </button>
  );
}