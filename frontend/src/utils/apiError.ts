import { AxiosError } from "axios";

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Extracts the most specific, user-actionable message from a failed API call.
 *
 * Priority:
 *  1. Network failure (no response) → a clear "can't reach server" message.
 *  2. Backend validation errors → the first field message.
 *  3. Backend ProblemDetails `detail` (e.g. "Account not found.").
 *  4. Backend `title`, else the provided translated fallback.
 */
export function getApiErrorMessage(
  error: unknown,
  t: (key: string) => string,
  fallbackKey: string,
): string {
  const axiosError = error as AxiosError<ProblemDetails>;

  // No response at all = the request never reached the backend (server down,
  // wrong API URL, or no connection). This is the most common "not connected" case.
  if (axiosError?.isAxiosError && !axiosError.response) {
    return t("common.networkError");
  }

  const data = axiosError?.response?.data;

  // Validation/model errors: surface the first field message so the user knows
  // exactly what to fix.
  if (data?.errors) {
    const firstWithMessage = Object.values(data.errors).find((messages) => messages?.length);
    if (firstWithMessage && firstWithMessage.length > 0) {
      return firstWithMessage[0];
    }
  }

  if (data?.detail) {
    return data.detail;
  }

  return data?.title ?? t(fallbackKey);
}
