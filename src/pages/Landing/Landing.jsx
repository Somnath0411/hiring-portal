import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../utils/paths'
import ScoreBar from '../../components/ScoreBar/ScoreBar'
import './Landing.css'

// Sample data for the preview panel only. It is not read from the database.
const SAMPLE_BOARD = [
  { name: 'Meera Nair', test: 100, resume: 80 },
  { name: 'Divya Subramanian', test: 60, resume: 100 },
  { name: 'Karthik Raja', test: 80, resume: 60 },
  { name: 'Arjun Patel', test: 40, resume: 40 },
]

const STEPS = [
  {
    title: 'Write the test',
    text: 'Add multiple-choice questions by hand, or paste an AI key and generate them from a topic.',
  },
  {
    title: 'Candidates apply',
    text: 'They pick a role, upload a resume and answer the questions. Their scores appear on their home screen.',
  },
  {
    title: 'Review the ranking',
    text: 'Test score and resume match are added together. Open any card for contact details and move people to the next round.',
  },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <main>
      <section className="hero container">
        <div className="hero__copy">
          <h1 className="hero__title">Know who to interview next.</h1>
          <p className="hero__lead">
            Write a short test for each role. Candidates upload a resume and take it. Shortlist adds the two
            scores and ranks everyone for you.
          </p>
          <div className="row">
            <Link className="btn btn-primary" to={user ? homePathFor(user.role) : '/login'}>
              {user ? 'Go to your dashboard' : 'Log in'}
            </Link>
            <a className="btn btn-secondary" href="#how-it-works">
              See how it works
            </a>
          </div>
        </div>

        <figure className="hero__board">
          <figcaption className="hero__board-caption">
            <span className="hero__board-title">Frontend Developer</span>
            <span className="muted text-sm">4 applicants, best total first</span>
          </figcaption>

          <ol className="hero__rows">
            {SAMPLE_BOARD.map((row, index) => (
              <li key={row.name} className="hero__row">
                <span className="hero__rank">{index + 1}</span>
                <div className="hero__who">
                  <span className="hero__name">{row.name}</span>
                  <div className="hero__bars">
                    <ScoreBar label="Test" value={row.test} animate delay={250 + index * 140} />
                    <ScoreBar label="Resume" value={row.resume} animate delay={350 + index * 140} />
                  </div>
                </div>
                <span className="hero__total">{row.test + row.resume}</span>
              </li>
            ))}
          </ol>
        </figure>
      </section>

      <section className="how container" id="how-it-works" aria-labelledby="how-title">
        <h2 id="how-title" className="how__title">How it works</h2>
        <ol className="how__steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="how__step">
              <span className="how__number" aria-hidden="true">{index + 1}</span>
              <h3 className="how__step-title">{step.title}</h3>
              <p className="muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="landing-footer container">
        <p className="muted text-sm">
          Demo build. Data is stored in your browser until a database is connected.
        </p>
      </footer>
    </main>
  )
}
