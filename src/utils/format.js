// Small helpers shared by several screens.

// "react, CSS,  git" -> ['react', 'CSS', 'git'] (duplicates ignored, case-insensitive)
export function parseSkills(text) {
  const seen = new Set()
  const skills = []
  String(text)
    .split(/[,\n]/)
    .forEach((raw) => {
      const skill = raw.trim()
      const key = skill.toLowerCase()
      if (skill && !seen.has(key)) {
        seen.add(key)
        skills.push(skill)
      }
    })
  return skills
}

// Adds https:// when someone types "github.com/name".
export function normalizeUrl(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  return /^https?:\/\//i.test(text) ? text : `https://${text}`
}

// Returns the URL only if it is a safe http(s) link, otherwise null. Use before putting user text in an href.
export function safeHref(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())

export const firstName = (full) => String(full ?? '').trim().split(/\s+/)[0] || ''
