import './QuestionnaireList.css'

// The admin's existing roles, each with its test. Questions can be previewed and a role can be deleted.
export default function QuestionnaireList({ roles, onCreate, onDelete, deletingId }) {
  const confirmDelete = (role) => {
    const count = role.applicantCount
    const extra = count ? ` This also removes ${count} ${count === 1 ? 'application' : 'applications'}.` : ''
    if (window.confirm(`Delete "${role.title}"?${extra}`)) onDelete(role)
  }

  if (!roles.length) {
    return (
      <div className="empty-state">
        <h3>No questionnaires yet</h3>
        <p>Create a role and its test so employees can start applying.</p>
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          New questionnaire
        </button>
      </div>
    )
  }

  return (
    <ul className="grid-cards">
      {roles.map((role) => (
        <li key={role.id} className="card questionnaire-card">
          <div>
            <h3 className="questionnaire-card__title">{role.title}</h3>
            {role.department && <p className="muted text-sm">{role.department}</p>}
          </div>

          {role.description && <p className="questionnaire-card__description">{role.description}</p>}

          <div className="chips">
            {role.skills.map((skill) => (
              <span key={skill} className="chip">{skill}</span>
            ))}
          </div>

          <dl className="questionnaire-card__stats">
            <div>
              <dt className="muted text-sm">Questions</dt>
              <dd>{role.questions.length}</dd>
            </div>
            <div>
              <dt className="muted text-sm">Applicants</dt>
              <dd>{role.applicantCount}</dd>
            </div>
          </dl>

          <details className="questionnaire-card__preview">
            <summary>View questions</summary>
            <ol className="questionnaire-card__questions">
              {role.questions.map((question) => (
                <li key={question.id}>
                  <p className="questionnaire-card__question">{question.text}</p>
                  <ul className="questionnaire-card__options">
                    {question.options.map((option, index) => (
                      <li key={option + index} className={index === question.correctIndex ? 'is-correct' : undefined}>
                        {option}
                        {index === question.correctIndex && <span className="questionnaire-card__tag"> (correct)</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </details>

          <button
            type="button"
            className="btn btn-danger btn-sm questionnaire-card__delete"
            onClick={() => confirmDelete(role)}
            disabled={deletingId === role.id}
          >
            {deletingId === role.id ? 'Deleting' : 'Delete'}
          </button>
        </li>
      ))}
    </ul>
  )
}
