export interface ParsedError {
  message: string;
  isNetworkError: boolean;
  status?: number;
  retryable: boolean;
}

export const parseError = (error: unknown): ParsedError => {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    return {
      message: (e.message as string) || 'An unexpected error occurred.',
      isNetworkError: Boolean(e.isNetworkError),
      status: e.status as number | undefined,
      retryable: e.isNetworkError === true || e.status === 429 || (e.status as number) >= 500,
    };
  }
  return { message: String(error), isNetworkError: false, retryable: false };
};
