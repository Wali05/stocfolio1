import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine class names using clsx and intelligently merge Tailwind classes with twMerge
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
