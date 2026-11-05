import StatusBadge from '../StatusBadge/StatusBadge'
import ScoreBar from '../ScoreBar/ScoreBar'
import './CandidateCard.css'

// One ranked applicant in the leaderboard grid. The whole card is a button that opens the overlay.
export default function CandidateCard({ candidate, onOpen }) {
  const { rank, name, roleTitle, total, maxTotal, quizScore, resumeScore, status } = candidate

  return (
    <button type="button" className="candidate-card" aria-haspopup="dialog" onClick={() => onOpen(candidate)}>
      <span className="candidate-card__top">
        <span className={`candidate-card__rank${rank === 1 ? ' is-first' : ''}`}>
          <span className="visually-hidden">Rank </span>#{rank}
        </span>
        <StatusBadge status={status} />
      </span>

      <span className="candidate-card__identity">
        <span className="candidate-card__name">{name}</span>
        <span className="candidate-card__role">{roleTitle}</span>
      </span>

      <span className="candidate-card__total">
        <span className="candidate-card__total-value">{total}</span>
        <span className="candidate-card__total-max">out of {maxTotal}</span>
      </span>

      <span className="candidate-card__bars">
        <ScoreBar label="Test" value={quizScore} />
        <ScoreBar label="Resume" value={resumeScore} />
      </span>
    </button>
  )
}
