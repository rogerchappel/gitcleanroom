export class CleanroomError extends Error {
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'CleanroomError';
    this.code = code;
    this.details = details;
  }
}

export function toErrorPayload(error: unknown): Record<string, unknown> {
  if (error instanceof CleanroomError) {
    return {
      ok: false,
      code: error.code,
      error: error.message,
      ...error.details
    };
  }

  return {
    ok: false,
    code: 'unexpected_error',
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
