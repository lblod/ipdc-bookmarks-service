/**
 * Get the session ID from the request headers
 *
 * @return {string} The session ID from the request headers
*/
export function getSessionUri(request) {
  return request.get('mu-session-id');
};
