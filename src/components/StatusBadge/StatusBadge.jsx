import { APPLICATION_STATUS } from '../../data/constants'

// Uses the shared .badge classes from index.css, so it needs no stylesheet of its own.
export default function StatusBadge({ status }) {
  const meta = APPLICATION_STATUS[status] ?? APPLICATION_STATUS.pending
  return <span className={`badge badge--${meta.tone}`}>{meta.label}</span>
}
