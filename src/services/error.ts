import axios from 'axios';

export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado.',
) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join('\n');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (typeof error.response?.data?.error === 'string') {
      return error.response.data.error;
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function getHttpStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function isNetworkError(error: unknown) {
  return axios.isAxiosError(error) && !error.response;
}
