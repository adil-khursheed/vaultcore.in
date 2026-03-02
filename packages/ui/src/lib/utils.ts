import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cardBrands = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "amex", label: "Amex" },
  { value: "discover", label: "Discover" },
  { value: "rupay", label: "RuPay" },
  { value: "maestro", label: "Maestro" },
  { value: "diners_club", label: "Diners Club" },
  { value: "jcb", label: "JCB" },
  { value: "other", label: "Other" },
];

export const months = [
  { value: "01", label: "01-January" },
  { value: "02", label: "02-February" },
  { value: "03", label: "03-March" },
  { value: "04", label: "04-April" },
  { value: "05", label: "05-May" },
  { value: "06", label: "06-June" },
  { value: "07", label: "07-July" },
  { value: "08", label: "08-August" },
  { value: "09", label: "09-September" },
  { value: "10", label: "10-October" },
  { value: "11", label: "11-November" },
  { value: "12", label: "12-December" },
];
