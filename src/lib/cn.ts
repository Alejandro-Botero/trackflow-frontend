import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases condicionales y resuelve conflictos de Tailwind (clsx + tailwind-merge). */
export function cn(...clases: Array<string | false | null | undefined>): string {
  return twMerge(clsx(clases));
}
