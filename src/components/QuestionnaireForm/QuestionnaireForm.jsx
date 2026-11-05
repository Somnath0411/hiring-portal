import { useState } from 'react'
import * as api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { normalizeQuestions } from '../../services/validation'
import { parseSkills } from '../../utils/format'
import QuestionEditor from '../QuestionEditor/QuestionEditor'
import AiGenerator from '../AiGenerator/AiGenerator'
import './QuestionnaireForm.css'

let uidCounter = 0
const makeUid = () => `q${Date.now()}-${uidCounter++}`
const blankQuestion = () => ({ uid: makeUid(), text: '', options: ['', '', '', ''], correctIndex: 0 })
const isBlank = (q) => !q.text.trim() && q.options.every((o) => !o.trim())

// Creates a role and its test. Questions can be typed by hand, generated with an AI key, or both.
export default function QuestionnaireForm({ onSaved, onCancel }) {
  const { handleAuthError } = useAuth()
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [questions, setQuestions] = useState(() => [blankQuestion()])
  const [showAi, setShowAi] = useState(false)
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)

  const skills = parseSkills(skillsText)
  const aiTopic = [title.trim(), skills.join(', ')].filter(Boolean).join(': ')

  const updateQuestion = (uid, updated) =>
    setQuestions((prev) => prev.map((q) => (q.uid === uid ? updated : q)))

  const removeQuestion = (uid) => setQuestions((prev) => prev.filter((q) => q.uid !== uid))

  const addQuestion = () => setQuestions((prev) => [...prev, blankQuestion()])

  // Untouched blank questions are dropped so AI results do not sit below an empty one.
  const addGenerated = (generated) =>
    setQuestions((prev) => [...prev.filter((q) => !isBlank(q)), ...generated.map((q) => ({ uid: makeUid(), ...q }))])

  // Pressing Enter in a text box should not save the whole questionnaire.
  const preventEnterSubmit = (event) => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') event.preventDefault()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const problems = []
    if (!title.trim()) problems.push('Add a role title.')
    if (!skills.length) problems.push('Add at least one skill so resumes can be scored.')
    if (!questions.length) problems.push('Add at least one question.')
    const normalized = normalizeQuestions(questions)
    problems.push(...normalized.errors)

    setErrors(problems)
    if (problems.length) return

    setSaving(true)
    try {
      await api.createRole({ title, department, description, skills, questions: normalized.questions })
      onSaved(title.trim())
    } catch (err) {
      setErrors([handleAuthError(err)])
      setSaving(false)
    }
  }

  return (
    <form className="questionnaire-form" onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} noValidate>
      <section className="card stack">
        <h2 className="section-title">Role details</h2>

        <div className="field-row">
          <div className="field">
            <label htmlFor="role-title">Role title</label>
            <input
              id="role-title"
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Frontend Developer"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="role-department">Department</label>
            <input
              id="role-department"
              type="text"
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="role-description">Description</label>
          <textarea
            id="role-description"
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will this person do?"
          />
        </div>

        <div className="field">
          <label htmlFor="role-skills">Required skills</label>
          <input
            id="role-skills"
            type="text"
            className="input"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="react, javascript, css, git"
          />
          <span className="field-hint">
            Separate with commas. A resume's score is the share of these skills it mentions.
          </span>
          {skills.length > 0 && (
            <div className="chips questionnaire-form__skills">
              {skills.map((skill) => (
                <span key={skill} className="chip">{skill}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="stack">
        <div className="row row--between">
          <h2 className="section-title">Questions ({questions.length})</h2>
          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={addQuestion}>
              Add question
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              aria-expanded={showAi}
              aria-controls="ai-panel"
              onClick={() => setShowAi((open) => !open)}
            >
              {showAi ? 'Hide AI generator' : 'Generate with AI'}
            </button>
          </div>
        </div>

        {showAi && (
          <div id="ai-panel">
            <AiGenerator defaultTopic={aiTopic} onGenerated={addGenerated} />
          </div>
        )}

        {questions.length === 0 ? (
          <div className="empty-state">
            <h3>No questions yet</h3>
            <p>Add one by hand, or generate a set with an AI key.</p>
          </div>
        ) : (
          questions.map((question, index) => (
            <QuestionEditor
              key={question.uid}
              index={index}
              question={question}
              onChange={(updated) => updateQuestion(question.uid, updated)}
              onRemove={() => removeQuestion(question.uid)}
            />
          ))
        )}
      </section>

      {errors.length > 0 && (
        <div className="alert alert--error" role="alert">
          <ul>
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="row">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? (
            <>
              <span className="spinner" aria-hidden="true" /> Saving
            </>
          ) : (
            'Save questionnaire'
          )}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  )
}
