import './RoleCard.css'

const MAX_SKILLS_SHOWN = 5

// An open role on the employee home screen. Click it to start the application.
// When the employee has already applied it turns into a plain, non-clickable card.
export default function RoleCard({ role, applied, onApply }) {
  const { title, department, description, skills, questionCount } = role
  const shown = skills.slice(0, MAX_SKILLS_SHOWN)
  const hidden = skills.length - shown.length

  const body = (
    <>
      <span className="role-card__top">
        <span className="role-card__title">{title}</span>
        {department && <span className="muted text-sm">{department}</span>}
      </span>

      {description && <span className="role-card__description">{description}</span>}

      <span className="chips">
        {shown.map((skill) => (
          <span key={skill} className="chip">{skill}</span>
        ))}
        {hidden > 0 && <span className="chip chip--missing">+{hidden} more</span>}
      </span>

      <span className="role-card__footer">
        <span className="muted text-sm">
          Test with {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </span>
        {applied ? (
          <span className="badge badge--ok">Applied</span>
        ) : (
          <span className="role-card__cta">Start application</span>
        )}
      </span>
    </>
  )

  if (applied) return <div className="role-card is-applied">{body}</div>

  return (
    <button type="button" className="role-card" onClick={() => onApply(role)}>
      {body}
    </button>
  )
}
