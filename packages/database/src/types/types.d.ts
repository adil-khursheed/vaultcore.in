import { type ReactFormExtendedApi } from "@tanstack/react-form";
import { z } from "zod";

import { ItemSchema } from "./zod-schema";

export type ItemFormValues = z.infer<typeof ItemSchema>;

/**
 * A helper type to simplify the 12-generic requirement of TanStack Form's ReactFormExtendedApi.
 */
export type TanStackForm<TData = any> = ReactFormExtendedApi<
  TData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export interface ItemFormProps {
  initialValues?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}
