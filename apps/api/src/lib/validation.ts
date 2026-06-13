import { z } from "zod";
import { ApiError } from "./errors.js";

export function validate<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request", result.error.flatten());
  }

  return result.data;
}
