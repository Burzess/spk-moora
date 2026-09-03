import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function naturalSortByCode<T extends { code: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" })
  );
}

export function calculateCostScore(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 1;

  let num: number;
  if (typeof value === "number") {
    num = value;
  } else {
    const clean = value.replace(/\D/g, "");
    if (!clean) return 1;
    num = parseInt(clean, 10);
  }

  if (isNaN(num) || num <= 0) return 1;
  if (num <= 500_000) return 1;
  if (num <= 800_000) return 2;
  if (num <= 1_100_000) return 3;
  if (num <= 1_400_000) return 4;
  return 5;
}

export function getCostScoreLabel(score: number): string {
  switch (score) {
    case 1:
      return "≤ Rp 500.000 (Nilai 1)";
    case 2:
      return "Rp 500.001 - Rp 800.000 (Nilai 2)";
    case 3:
      return "Rp 800.001 - Rp 1.100.000 (Nilai 3)";
    case 4:
      return "Rp 1.100.001 - Rp 1.400.000 (Nilai 4)";
    case 5:
      return "> Rp 1.400.000 (Nilai 5)";
    default:
      return "Biaya Sewa";
  }
}

