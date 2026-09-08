/**
 * Parse an API error response and return a user-friendly message.
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Network error – no response received at all
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  const status = error.response.status;
  const serverMessage = error.response.data?.message || error.response.data?.error;

  switch (status) {
    case 400:
      return "We couldn't process that request. Please check your input and try again.";

    case 401:
      return 'Your session has expired. Please log in again.';

    case 403:
      return "You don't have permission to perform this action.";

    case 404:
      return 'The resource you are looking for was not found.';

    case 409:
      return "You've already shortened this URL.";

    case 429:
      return "You're doing that a little too quickly. Please wait a moment and try again.";

    case 500:
      return 'Something went wrong on our side. Please try again later.';

    case 502:
      return 'The server is temporarily unavailable. Please try again shortly.';

    case 503:
      return 'Service temporarily unavailable. Please try again in a moment.';

    default:
      return 'An unexpected error occurred. Please try again.';
  }
};
