/*
  Minimal HS256 JSON Web Token helpers.

  How the pieces map to a real backend later:
    signToken / verifyToken  ->  run on your server (Node, Express, etc.), with the secret kept private
    decodeToken              ->  stays in the browser, only to read the name/role for the UI

  In this mock, api.js plays the part of the server, so the secret sits in the
  browser bundle. That is fine for local testing and NOT secure for production.
*/

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function bytesToB64Url(bytes) {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64UrlToBytes(text) {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=')
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
}

const encodePart = (obj) => bytesToB64Url(encoder.encode(JSON.stringify(obj)))
const decodePart = (part) => JSON.parse(decoder.decode(b64UrlToBytes(part)))

async function hmac(message, secret) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Open the app at http://localhost so the browser allows token signing.')
  }
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return bytesToB64Url(new Uint8Array(signature))
}

export function isExpired(claims) {
  return !claims || typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now()
}

export async function signToken(payload, secret, expiresInSeconds = 8 * 60 * 60) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const body = { ...payload, iat: now, exp: now + expiresInSeconds }
  const unsigned = `${encodePart(header)}.${encodePart(body)}`
  return `${unsigned}.${await hmac(unsigned, secret)}`
}

export async function verifyToken(token, secret) {
  const parts = typeof token === 'string' ? token.split('.') : []
  if (parts.length !== 3) throw new Error('Invalid token')
  const expected = await hmac(`${parts[0]}.${parts[1]}`, secret)
  if (expected !== parts[2]) throw new Error('Invalid token')
  const claims = decodePart(parts[1])
  if (isExpired(claims)) throw new Error('Session expired')
  return claims
}

// Reads the payload without checking the signature. For display only.
export function decodeToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return decodePart(parts[1])
  } catch {
    return null
  }
}
