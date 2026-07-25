import Anthropic from '@anthropic-ai/sdk';

export interface ProviderHttpError {
  status: number;
  message: string;
  providerStatus?: number;
  requestId?: string;
}

export function toProviderHttpError(error: unknown): ProviderHttpError {
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return {
      status: 503,
      message: 'AI provider temporarily unavailable',
    };
  }

  if (error instanceof Anthropic.APIConnectionError) {
    return {
      status: 503,
      message: 'AI provider temporarily unavailable',
    };
  }

  if (error instanceof Anthropic.APIError) {
    const metadata = {
      providerStatus: error.status,
      requestId: error.requestID ?? undefined,
    };

    if (error.status === 401 || error.status === 403) {
      return {
        status: 502,
        message: 'AI provider authentication failed',
        ...metadata,
      };
    }

    if (error.status === 429) {
      return {
        status: 429,
        message: 'AI provider rate limit exceeded',
        ...metadata,
      };
    }

    if (
      error.status === 404 ||
      (error.status === 400 && error.message.toLowerCase().includes('model'))
    ) {
      return {
        status: 503,
        message: 'Configured AI model is unavailable',
        ...metadata,
      };
    }

    if (error.status !== undefined && error.status >= 500) {
      return {
        status: 503,
        message: 'AI provider temporarily unavailable',
        ...metadata,
      };
    }
  }

  return {
    status: 500,
    message: 'Analysis failed',
  };
}
