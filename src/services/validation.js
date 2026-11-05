// Cleans up questions typed in the form: trims text, drops blank options and keeps
// `correctIndex` pointing at the right option after blanks are removed.
export function normalizeQuestions(questions) {
  const errors = []

  const cleaned = questions.map((q, i) => {
    const number = i + 1
    const text = (q.text || '').trim()
    const options = []
    let correctIndex = -1

    q.options.forEach((option, index) => {
      const value = (option || '').trim()
      if (!value) return
      if (index === q.correctIndex) correctIndex = options.length
      options.push(value)
    })

    if (!text) errors.push(`Question ${number} needs text.`)
    if (options.length < 2) errors.push(`Question ${number} needs at least two options.`)
    else if (correctIndex === -1) errors.push(`Question ${number} needs a correct answer that is not blank.`)

    return { text, options, correctIndex }
  })

  return { questions: cleaned, errors }
}
