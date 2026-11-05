import { useState } from 'react'
import { AI_PROVIDERS, generateQuestions } from '../../services/ai'
import './AiGenerator.css'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

// Asks an AI provider for multiple-choice questions and hands them to the parent.
// This sits inside the questionnaire <form>, so it uses buttons with onClick rather than a nested form.
export default function AiGenerator({ defaultTopic, onGenerated }) {
  const [provider, setProvider] = useState(AI_PROVIDERS[0].id)
  const [apiKey, setApiKey] = useState('')
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('Medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(0)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setAdded(0)
    try {
      const questions = await generateQuestions({
        provider,
        apiKey,
        topic: topic.trim() || defaultTopic,
        count,
        difficulty,
      })
      onGenerated(questions)
      setAdded(questions.length)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-generator">
      <div className="field-row">
        <div className="field">
          <label htmlFor="ai-provider">AI provider</label>
          <select id="ai-provider" className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
            {AI_PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="ai-key">API key</label>
          <input
            id="ai-key"
            type="password"
            className="input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            placeholder="Paste your key"
          />
          <span className="field-hint">Used from this browser only. It is not saved.</span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="ai-topic">What should the questions cover?</label>
        <input
          id="ai-topic"
          type="text"
          className="input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={defaultTopic || 'For example: React hooks and state management'}
        />
        {defaultTopic && <span className="field-hint">Leave blank to use the role title and skills above.</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="ai-count">Number of questions</label>
          <input
            id="ai-count"
            type="number"
            className="input"
            min={1}
            max={15}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
          />
        </div>

        <div className="field">
          <label htmlFor="ai-difficulty">Difficulty</label>
          <select id="ai-difficulty" className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {DIFFICULTIES.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="alert alert--error" role="alert">{error}</p>}
      {added > 0 && (
        <p className="alert alert--success" role="status">
          Added {added} {added === 1 ? 'question' : 'questions'} below. Review them before saving.
        </p>
      )}

      <div>
        <button type="button" className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" /> Generating questions
            </>
          ) : (
            'Generate questions'
          )}
        </button>
      </div>
    </div>
  )
}
