import './QuestionEditor.css'

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 6

// Edits one multiple-choice question. The radio button marks the correct option.
// The parent owns the data: this calls onChange with the updated question.
export default function QuestionEditor({ index, question, onChange, onRemove }) {
  const number = index + 1
  const groupName = `correct-${question.uid}`

  const setOption = (optionIndex, value) =>
    onChange({
      ...question,
      options: question.options.map((option, i) => (i === optionIndex ? value : option)),
    })

  const addOption = () => onChange({ ...question, options: [...question.options, ''] })

  const removeOption = (optionIndex) => {
    let { correctIndex } = question
    if (optionIndex === correctIndex) correctIndex = 0
    else if (optionIndex < correctIndex) correctIndex -= 1
    onChange({
      ...question,
      options: question.options.filter((_, i) => i !== optionIndex),
      correctIndex,
    })
  }

  return (
    <fieldset className="question-editor">
      <div className="question-editor__head">
        <legend className="question-editor__legend">Question {number}</legend>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove}>
          Remove question {number}
        </button>
      </div>

      <div className="field">
        <label htmlFor={`${groupName}-text`}>Question text</label>
        <textarea
          id={`${groupName}-text`}
          className="input"
          rows={2}
          value={question.text}
          onChange={(event) => onChange({ ...question, text: event.target.value })}
          placeholder="What do you want to ask?"
        />
      </div>

      <div className="question-editor__options">
        <span className="field-label">Options (select the correct one)</span>
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="question-editor__option">
            <input
              type="radio"
              name={groupName}
              checked={question.correctIndex === optionIndex}
              onChange={() => onChange({ ...question, correctIndex: optionIndex })}
              aria-label={`Mark option ${optionIndex + 1} as the correct answer`}
            />
            <input
              type="text"
              className="input"
              value={option}
              onChange={(event) => setOption(optionIndex, event.target.value)}
              placeholder={`Option ${optionIndex + 1}`}
              aria-label={`Option ${optionIndex + 1} text`}
            />
            {question.options.length > MIN_OPTIONS && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeOption(optionIndex)}
                aria-label={`Remove option ${optionIndex + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {question.options.length < MAX_OPTIONS && (
          <button type="button" className="btn btn-ghost btn-sm question-editor__add" onClick={addOption}>
            Add option
          </button>
        )}
      </div>
    </fieldset>
  )
}
