import StatusBadge from '../StatusBadge/StatusBadge'
import ScoreBar from '../ScoreBar/ScoreBar'
import { formatDate } from '../../utils/format'
import './ApplicationList.css'

// The employee's own applications with their scores and whether they made the next round.
export default function ApplicationList({ applications }) {
  return (
    <ul className="application-list">
      {applications.map((app) => (
        <li key={app.id} className="application-row">
          <div className="application-row__role">
            <h3 className="application-row__title">{app.roleTitle}</h3>
            <p className="muted text-sm">Applied {formatDate(app.appliedAt)}</p>
          </div>

          <div className="application-row__bars">
            <ScoreBar
              label="Test"
              value={app.quizScore}
              detail={`${app.correctCount} of ${app.totalQuestions} correct`}
            />
            <ScoreBar label="Resume" value={app.resumeScore} />
          </div>

          <div className="application-row__result">
            <span className="application-row__total">
              <span className="application-row__total-value">{app.total}</span>
              <span className="muted text-sm">out of {app.maxTotal}</span>
            </span>
            <StatusBadge status={app.status} />
          </div>
        </li>
      ))}
    </ul>
  )
}
