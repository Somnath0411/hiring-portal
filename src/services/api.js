/*
  API LAYER
  ---------
  Every screen talks to the data through the functions in this file and nowhere else.
  Right now they read and write the list-based mock in src/data/mockDb.js.

  To move to MySQL: keep the function names and return shapes, and replace each
  body with a fetch() to your backend (Express, Spring, Django, anything). The
  backend should do the same checks that requireAuth() and the scoring do here.
*/

import { db, saveDb, nextId } from '../data/mockDb'
import { signToken, verifyToken } from './jwt'
import { getToken } from './session'
import { scoreQuiz, scoreResume, combineScores, MAX_TOTAL } from './scoring'
import { normalizeQuestions } from './validation'

// Server-side secret in a real app. Kept here only because this mock runs in the browser.
const MOCK_JWT_SECRET = 'shortlist-dev-secret-change-me'

const STATUSES = ['pending', 'accepted', 'rejected']

const latency = () => new Promise((resolve) => setTimeout(resolve, 200))
const copy = (value) => structuredClone(value)
const publicUser = ({ password: _password, ...rest }) => rest

function apiError(message, code) {
  const err = new Error(message)
  err.code = code
  return err
}

// Checks the JWT, like auth middleware on a server would.
async function requireAuth(role) {
  let claims
  try {
    claims = await verifyToken(getToken(), MOCK_JWT_SECRET)
  } catch (err) {
    throw apiError(
      err.message === 'Session expired' ? 'Your session expired. Log in again.' : 'Log in to continue.',
      'UNAUTHENTICATED',
    )
  }
  if (role && claims.role !== role) throw apiError('You do not have access to this.', 'FORBIDDEN')
  return claims
}

// ---------- auth ----------

export async function login(email, password) {
  await latency()
  const wanted = String(email).trim().toLowerCase()
  const user = db.users.find((u) => u.email.toLowerCase() === wanted)
  if (!user || user.password !== password) throw new Error('Email or password is incorrect.')

  const token = await signToken(
    { sub: user.id, name: user.name, email: user.email, role: user.role },
    MOCK_JWT_SECRET,
  )
  return { token, user: publicUser(user) }
}

export async function getProfile() {
  const claims = await requireAuth()
  await latency()
  const user = db.users.find((u) => u.id === Number(claims.sub))
  if (!user) throw apiError('Log in to continue.', 'UNAUTHENTICATED')
  return publicUser(user)
}

// ---------- roles and questionnaires ----------

// Admin: every role with its questions, correct answers and applicant count.
export async function getRoles() {
  await requireAuth('admin')
  await latency()
  return db.roles.map((role) => ({
    ...copy(role),
    applicantCount: db.applications.filter((a) => a.roleId === role.id).length,
  }))
}

// Any signed-in user: role summaries without answers.
export async function getOpenRoles() {
  await requireAuth()
  await latency()
  return db.roles.map((role) => ({
    id: role.id,
    title: role.title,
    department: role.department,
    description: role.description,
    skills: [...role.skills],
    questionCount: role.questions.length,
  }))
}

// Employee: one role plus its questions, with the correct answers left out.
export async function getRoleForTest(roleId) {
  await requireAuth('employee')
  await latency()
  const role = db.roles.find((r) => r.id === Number(roleId))
  if (!role) throw new Error('This role is no longer open.')
  return {
    id: role.id,
    title: role.title,
    department: role.department,
    description: role.description,
    skills: [...role.skills],
    questions: role.questions.map((q) => ({ id: q.id, text: q.text, options: [...q.options] })),
  }
}

const nextQuestionId = () =>
  db.roles.reduce((max, role) => role.questions.reduce((m, q) => Math.max(m, q.id), max), 0) + 1

export async function createRole({ title, department, description, skills, questions }) {
  await requireAuth('admin')
  await latency()

  const cleanTitle = String(title ?? '').trim()
  const cleanSkills = (skills ?? []).map((s) => s.trim()).filter(Boolean)
  if (!cleanTitle) throw new Error('Add a role title.')
  if (!cleanSkills.length) throw new Error('Add at least one skill.')
  if (!questions?.length) throw new Error('Add at least one question.')

  const normalized = normalizeQuestions(questions)
  if (normalized.errors.length) throw new Error(normalized.errors[0])

  let questionId = nextQuestionId()
  const role = {
    id: nextId(db.roles),
    title: cleanTitle,
    department: String(department ?? '').trim(),
    description: String(description ?? '').trim(),
    skills: cleanSkills,
    questions: normalized.questions.map((q) => ({ id: questionId++, ...q })),
  }

  db.roles.push(role)
  saveDb()
  return copy(role)
}

// Removes the role and every application made to it.
export async function deleteRole(roleId) {
  await requireAuth('admin')
  await latency()
  db.roles = db.roles.filter((r) => r.id !== Number(roleId))
  db.applications = db.applications.filter((a) => a.roleId !== Number(roleId))
  saveDb()
}

// ---------- applications ----------

function withRole(application) {
  const role = db.roles.find((r) => r.id === application.roleId)
  return {
    ...copy(application),
    roleTitle: role?.title ?? 'Removed role',
    missingSkills: (role?.skills ?? []).filter((s) => !application.matchedSkills.includes(s)),
    total: combineScores(application.quizScore, application.resumeScore),
    maxTotal: MAX_TOTAL,
  }
}

const byRank = (a, b) =>
  b.total - a.total || b.quizScore - a.quizScore || new Date(a.appliedAt) - new Date(b.appliedAt)

// Admin: ranked applicants, optionally for one role. Rank 1 is the best total score.
export async function getLeaderboard(roleId = null) {
  await requireAuth('admin')
  await latency()
  return db.applications
    .filter((a) => !roleId || a.roleId === Number(roleId))
    .map(withRole)
    .sort(byRank)
    .map((row, index) => ({ ...row, rank: index + 1 }))
}

// Employee: their own applications, newest first.
export async function getMyApplications() {
  const claims = await requireAuth('employee')
  await latency()
  return db.applications
    .filter((a) => a.userId === Number(claims.sub))
    .map(withRole)
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
}

// Employee: scores the test and the resume, then stores the application.
export async function submitApplication({ roleId, profile, resumeFileName, resumeText, answers }) {
  const claims = await requireAuth('employee')
  await latency()

  const role = db.roles.find((r) => r.id === Number(roleId))
  if (!role) throw new Error('This role is no longer open.')

  const userId = Number(claims.sub)
  if (db.applications.some((a) => a.userId === userId && a.roleId === role.id)) {
    throw new Error('You already applied for this role.')
  }

  const name = String(profile?.name ?? '').trim()
  const email = String(profile?.email ?? '').trim()
  if (!name || !email) throw new Error('Add your name and email.')
  if (role.questions.some((q) => answers?.[q.id] === undefined)) {
    throw new Error('Answer every question before submitting.')
  }

  const quiz = scoreQuiz(role.questions, answers)
  const resume = scoreResume(resumeText, role.skills)

  const application = {
    id: nextId(db.applications),
    userId,
    roleId: role.id,
    name,
    email,
    phone: String(profile.phone ?? '').trim(),
    linkedin: String(profile.linkedin ?? '').trim(),
    github: String(profile.github ?? '').trim(),
    resumeFileName: resumeFileName || 'resume',
    resumeScore: resume.percent,
    matchedSkills: resume.matched,
    answers: { ...answers },
    quizScore: quiz.percent,
    correctCount: quiz.correct,
    totalQuestions: quiz.total,
    status: 'pending',
    appliedAt: new Date().toISOString(),
  }

  db.applications.push(application)
  saveDb()
  return withRole(application)
}

// Admin: move a candidate to the next round, reject them, or put them back under review.
export async function updateApplicationStatus(applicationId, status) {
  await requireAuth('admin')
  await latency()
  if (!STATUSES.includes(status)) throw new Error('Unknown status.')
  const application = db.applications.find((a) => a.id === Number(applicationId))
  if (!application) throw new Error('This application no longer exists.')
  application.status = status
  saveDb()
  return { id: application.id, status }
}
