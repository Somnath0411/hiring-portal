# Shortlist: hiring tests and rankings

React + Vite app with a landing page, JWT login, an admin dashboard and an employee side.

## Run it

```bash
npm install
npm run dev
```

Open the address Vite prints (use `http://localhost`, the token signing needs it).

Demo accounts (from `src/data/mockDb.js`):

| Role     | Email                  | Password      |
| -------- | ---------------------- | ------------- |
| Admin    | admin@shortlist.dev    | admin123      |
| Employee | ravi@shortlist.dev     | employee123   |

Other seeded employees (meera, karthik, divya, arjun `@shortlist.dev`, same password) already have applications so the leaderboard is not empty.

## What it does

**Admin**
- **Questionnaires tab:** create a role (title, department, description, required skills) and its test. Add questions by hand, or open "Generate with AI", paste an API key (Anthropic or OpenAI), give a topic and get questions to review before saving. View questions or delete a role from the list.
- **Leaderboard tab:** grid of cards ranked by test score + resume score. Click a card for an overlay with email, phone, LinkedIn, GitHub, resume file, skills found, and buttons to move the person to the next round or reject them. Filter by role.

**Employee**
- Home shows their applications (test score, resume score, total, status) and the open roles.
- Click a role: step 1 is details and resume upload (PDF or .txt), step 2 is the test. Submitting returns to home with the scores.

## How scoring works (`src/services/scoring.js`)

- Test score = percent of questions correct (0-100).
- Resume score = percent of the role's required skills found in the resume text (0-100). Whole-word match, so `css` matches `CSS3` but `c` does not match inside `css`.
- Total = test + resume (max 200). Change `SCORE_WEIGHTS` to weight them differently.

## Project structure

```
src/
  index.css            all shared styles: tokens, buttons, fields, cards, badges, alerts
  components/
    Header/            Header.jsx + Header.css
    Modal/  Tabs/  ScoreBar/  CandidateCard/  CandidateOverlay/  RoleCard/
    ApplicationList/  QuestionEditor/  AiGenerator/  QuestionnaireForm/
    QuestionnaireList/  Leaderboard/  StatusBadge/  ProtectedRoute/
  pages/
    Landing/  Login/  AdminDashboard/  EmployeeHome/  ApplyRole/  NotFound/
  context/AuthContext.jsx
  services/
    api.js             the only file that touches data (swap this for MySQL)
    jwt.js  session.js scoring.js  validation.js  ai.js
  data/
    mockDb.js          list-based mock database + seed data
    constants.js
  utils/               format.js  paths.js  resumeParser.js
```

Each component folder holds its own `.jsx` and `.css`. Anything used in more than one place (buttons, `.input`, `.card`, `.badge`, `.alert`, `.grid-cards`, colours, spacing) lives in `index.css`.

## Adding MySQL later

Every screen calls functions in `src/services/api.js` and nothing else. To connect a database:

1. Build a backend (Express, Spring, Django...) with the same operations: `login`, `getRoles`, `getOpenRoles`, `getRoleForTest`, `createRole`, `deleteRole`, `getLeaderboard`, `getMyApplications`, `submitApplication`, `updateApplicationStatus`, `getProfile`.
2. Replace each function body in `api.js` with a `fetch()` to that backend. Keep the return shapes the same and the screens will not change.
3. The table layout is sketched at the top of `src/data/mockDb.js`.
4. Delete `mockDb.js` and the `requireAuth` helper in `api.js` once the backend does those checks.

Things the real backend must take over:
- **JWT:** sign and verify tokens on the server and keep the secret there. Right now the secret sits in the browser bundle (`MOCK_JWT_SECRET` in `api.js`), which is only fine for local testing. Prefer an httpOnly cookie over localStorage.
- **Passwords:** the seed data stores plain text. Store hashes (bcrypt or argon2).
- **Resumes:** upload the file to the server, store it, and parse/score it there. Today only the file name is saved and the text is read in the browser.
- **AI key:** call the AI provider from the backend so the key never reaches the browser. `src/services/ai.js` is the single place to change.
- **Scoring:** `submitApplication` already scores on the "server" side of the API layer, so move that logic over as is.

## Notes

- Data is kept in browser localStorage (`shortlist_db_v1`) so refreshes keep what you add. Clear that key, or call `resetDb()`, to return to the seed data.
- Resume reading supports text-based PDFs and `.txt`. Scanned PDFs and Word files are not supported yet.
