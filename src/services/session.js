// Where the login token is kept in the browser.
// With a real backend, prefer an httpOnly cookie set by the server so scripts cannot read the token.

const KEY = 'shortlist_token'

export function getToken() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // Storage blocked: the user will need to log in again after a refresh.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}
