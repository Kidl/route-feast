import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add line-clamp utilities for text truncation
export const lineClamp = {
  1: "line-clamp-1",
  2: "line-clamp-2", 
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6"
} as const;
