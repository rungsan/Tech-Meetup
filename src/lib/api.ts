import { NextResponse } from "next/server";

// Consistent error contract (D-003): { error: { code, message, fields? } }
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export function apiError(
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
) {
  return NextResponse.json({ error: { code, message, fields } }, { status: STATUS[code] });
}

export function apiOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Short correlation id for request logs/spans. */
export function newRequestId() {
  return crypto.randomUUID();
}
