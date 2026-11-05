// Scoring rules. Change the weights here and the whole app follows.
//
// Test score   = percent of questions answered correctly (0-100)
// Resume score = percent of the role's required skills found in the resume text (0-100)
// Total        = test * weight + resume * weight, which is what the leaderboard ranks by.

export const SCORE_WEIGHTS = { quiz: 1, resume: 1 }
export const MAX_TOTAL = 100 * (SCORE_WEIGHTS.quiz + SCORE_WEIGHTS.resume)

export function scoreQuiz(questions, answers) {
  const total = questions.length
  const correct = questions.reduce((count, q) => count + (answers?.[q.id] === q.correctIndex ? 1 : 0), 0)
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 }
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function scoreResume(text, skills) {
  const haystack = ` ${String(text ?? '').toLowerCase()} `
  const matched = []
  const missing = []

  skills.forEach((skill) => {
    const needle = skill.trim().toLowerCase()
    if (!needle) return
    // A skill counts only as a whole word, so "c" does not match inside "css".
    // Trailing digits are allowed so "css" still matches "CSS3" and "html" matches "HTML5".
    const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(needle)}\\d*($|[^a-z0-9+#])`)
    if (pattern.test(haystack)) matched.push(skill)
    else missing.push(skill)
  })

  const count = matched.length + missing.length
  return { percent: count ? Math.round((matched.length / count) * 100) : 0, matched, missing }
}

export function combineScores(quizPercent, resumePercent) {
  return Math.round(quizPercent * SCORE_WEIGHTS.quiz + resumePercent * SCORE_WEIGHTS.resume)
}
