// Labels and colours for each application status.
// `tone` maps to the .badge--{tone} classes in index.css.
export const APPLICATION_STATUS = {
  pending: { label: 'Under review', tone: 'warn' },
  accepted: { label: 'Next round', tone: 'ok' },
  rejected: { label: 'Not selected', tone: 'bad' },
}
