import { AxiosError } from "axios";

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(
  error: unknown,
  t: (key: string) => string,
  fallbackKey: string,
): string {
  const axiosError = error as AxiosError<ProblemDetails>;

  if (axiosError?.isAxiosError && !axiosError.response) {
    return t("common.networkError");
  }

  const data = axiosError?.response?.data;

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
