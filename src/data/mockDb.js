/*
  MOCK DATABASE  (swap for MySQL later)
  -------------------------------------
  Everything the app stores lives in the `db` object below, as plain arrays.
  Only src/services/api.js reads or writes it. When you add MySQL, replace the
  functions in api.js with fetch() calls to your backend and delete this file.

  Suggested MySQL tables (one per array):
    users         id, name, email, password_hash, role ('admin' | 'employee'), phone, linkedin, github
    roles         id, title, department, description, skills (JSON, or a role_skills table)
    questions     id, role_id, text, correct_index
    options       id, question_id, position, text
    applications  id, user_id, role_id, name, email, phone, linkedin, github,
                  resume_file_name, resume_score, matched_skills (JSON), quiz_score,
                  correct_count, total_questions, answers (JSON),
                  status ('pending' | 'accepted' | 'rejected'), applied_at

  Here the questions and options are embedded inside each role to keep the mock simple.

  The data is also copied to localStorage so a page refresh keeps whatever you
  add while testing. Call resetDb() (or delete the "shortlist_db_v1" key in
  your browser's storage) to go back to the seed data.
*/

const STORAGE_KEY = 'shortlist_db_v1'

const seed = {
  users: [
    {
      id: 1,
      name: 'Asha Menon',
      email: 'admin@shortlist.dev',
      password: 'admin123', // plain text only because this is a mock. Store a hash in MySQL.
      role: 'admin',
      phone: '',
      linkedin: '',
      github: '',
    },
    {
      id: 2,
      name: 'Ravi Kumar',
      email: 'ravi@shortlist.dev',
      password: 'employee123',
      role: 'employee',
      phone: '+91 98765 43210',
      linkedin: 'https://www.linkedin.com/in/ravi-kumar',
      github: 'https://github.com/ravi-kumar',
    },
    {
      id: 3,
      name: 'Meera Nair',
      email: 'meera@shortlist.dev',
      password: 'employee123',
      role: 'employee',
      phone: '+91 91234 56780',
      linkedin: 'https://www.linkedin.com/in/meera-nair',
      github: 'https://github.com/meera-nair',
    },
    {
      id: 4,
      name: 'Karthik Raja',
      email: 'karthik@shortlist.dev',
      password: 'employee123',
      role: 'employee',
      phone: '+91 99887 76655',
      linkedin: 'https://www.linkedin.com/in/karthik-raja',
      github: 'https://github.com/karthik-raja',
    },
    {
      id: 5,
      name: 'Divya Subramanian',
      email: 'divya@shortlist.dev',
      password: 'employee123',
      role: 'employee',
      phone: '+91 90000 11122',
      linkedin: 'https://www.linkedin.com/in/divya-subramanian',
      github: 'https://github.com/divya-subramanian',
    },
    {
      id: 6,
      name: 'Arjun Patel',
      email: 'arjun@shortlist.dev',
      password: 'employee123',
      role: 'employee',
      phone: '+91 97777 33445',
      linkedin: 'https://www.linkedin.com/in/arjun-patel',
      github: 'https://github.com/arjun-patel',
    },
  ],

  roles: [
    {
      id: 1,
      title: 'Frontend Developer',
      department: 'Engineering',
      description:
        'Build and maintain the screens our customers use every day. You will work in React with a small product team and ship weekly.',
      skills: ['react', 'javascript', 'css', 'html', 'git'],
      questions: [
        {
          id: 1,
          text: 'Which React hook is meant for running side effects after render and cleaning them up?',
          options: ['useState', 'useEffect', 'useMemo', 'useRef'],
          correctIndex: 1,
        },
        {
          id: 2,
          text: 'Which CSS declaration turns an element into a grid container?',
          options: ['display: grid', 'grid: container', 'position: grid', 'layout: grid'],
          correctIndex: 0,
        },
        {
          id: 3,
          text: 'What does Array.prototype.map return?',
          options: [
            'A single accumulated value',
            'The original array, modified in place',
            'A new array with each item transformed',
            'The first item that matches',
          ],
          correctIndex: 2,
        },
        {
          id: 4,
          text: 'Which HTTP status code means the request has no valid credentials?',
          options: ['200', '404', '500', '401'],
          correctIndex: 3,
        },
        {
          id: 5,
          text: 'Why do list items rendered in React need a stable key?',
          options: [
            'It sets the CSS class of the item',
            'It sorts the list automatically',
            'It lets React match items between renders',
            'It prevents the list from re-rendering',
          ],
          correctIndex: 2,
        },
      ],
    },
    {
      id: 2,
      title: 'Data Analyst',
      department: 'Analytics',
      description:
        'Turn raw numbers into answers for the sales and operations teams. You will write SQL daily and present findings in plain language.',
      skills: ['sql', 'excel', 'python', 'tableau', 'statistics'],
      questions: [
        {
          id: 6,
          text: 'Which SQL clause filters rows after GROUP BY has been applied?',
          options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
          correctIndex: 1,
        },
        {
          id: 7,
          text: 'Which measure of central tendency is least affected by extreme outliers?',
          options: ['Mean', 'Range', 'Median', 'Variance'],
          correctIndex: 2,
        },
        {
          id: 8,
          text: 'Which join keeps every row from the left table, even without a match on the right?',
          options: ['INNER JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'LEFT JOIN'],
          correctIndex: 3,
        },
        {
          id: 9,
          text: 'Which chart is the usual choice for showing a trend over time?',
          options: ['Line chart', 'Pie chart', 'Scatter matrix', 'Treemap'],
          correctIndex: 0,
        },
        {
          id: 10,
          text: 'In pandas, which method gives count, mean and standard deviation of numeric columns?',
          options: ['df.head()', 'df.describe()', 'df.info()', 'df.shape'],
          correctIndex: 1,
        },
      ],
    },
  ],

  applications: [
    {
      id: 1,
      userId: 3,
      roleId: 1,
      name: 'Meera Nair',
      email: 'meera@shortlist.dev',
      phone: '+91 91234 56780',
      linkedin: 'https://www.linkedin.com/in/meera-nair',
      github: 'https://github.com/meera-nair',
      resumeFileName: 'Meera_Nair_Resume.pdf',
      resumeScore: 80,
      matchedSkills: ['react', 'javascript', 'css', 'html'],
      answers: { 1: 1, 2: 0, 3: 2, 4: 3, 5: 2 },
      quizScore: 100,
      correctCount: 5,
      totalQuestions: 5,
      status: 'pending',
      appliedAt: '2026-10-27T09:40:00.000Z',
    },
    {
      id: 2,
      userId: 4,
      roleId: 1,
      name: 'Karthik Raja',
      email: 'karthik@shortlist.dev',
      phone: '+91 99887 76655',
      linkedin: 'https://www.linkedin.com/in/karthik-raja',
      github: 'https://github.com/karthik-raja',
      resumeFileName: 'Karthik_Raja_CV.pdf',
      resumeScore: 60,
      matchedSkills: ['react', 'javascript', 'git'],
      answers: { 1: 1, 2: 0, 3: 2, 4: 3, 5: 0 },
      quizScore: 80,
      correctCount: 4,
      totalQuestions: 5,
      status: 'accepted',
      appliedAt: '2026-10-28T14:05:00.000Z',
    },
    {
      id: 3,
      userId: 5,
      roleId: 1,
      name: 'Divya Subramanian',
      email: 'divya@shortlist.dev',
      phone: '+91 90000 11122',
      linkedin: 'https://www.linkedin.com/in/divya-subramanian',
      github: 'https://github.com/divya-subramanian',
      resumeFileName: 'Divya_S_Resume.pdf',
      resumeScore: 100,
      matchedSkills: ['react', 'javascript', 'css', 'html', 'git'],
      answers: { 1: 1, 2: 0, 3: 2, 4: 1, 5: 0 },
      quizScore: 60,
      correctCount: 3,
      totalQuestions: 5,
      status: 'pending',
      appliedAt: '2026-10-29T11:20:00.000Z',
    },
    {
      id: 4,
      userId: 6,
      roleId: 1,
      name: 'Arjun Patel',
      email: 'arjun@shortlist.dev',
      phone: '+91 97777 33445',
      linkedin: 'https://www.linkedin.com/in/arjun-patel',
      github: 'https://github.com/arjun-patel',
      resumeFileName: 'Arjun_Patel.txt',
      resumeScore: 40,
      matchedSkills: ['html', 'css'],
      answers: { 1: 1, 2: 0, 3: 0, 4: 1, 5: 0 },
      quizScore: 40,
      correctCount: 2,
      totalQuestions: 5,
      status: 'rejected',
      appliedAt: '2026-10-30T16:45:00.000Z',
    },
    {
      id: 5,
      userId: 5,
      roleId: 2,
      name: 'Divya Subramanian',
      email: 'divya@shortlist.dev',
      phone: '+91 90000 11122',
      linkedin: 'https://www.linkedin.com/in/divya-subramanian',
      github: 'https://github.com/divya-subramanian',
      resumeFileName: 'Divya_S_Resume.pdf',
      resumeScore: 60,
      matchedSkills: ['sql', 'python', 'excel'],
      answers: { 6: 1, 7: 2, 8: 3, 9: 0, 10: 0 },
      quizScore: 80,
      correctCount: 4,
      totalQuestions: 5,
      status: 'pending',
      appliedAt: '2026-10-31T08:30:00.000Z',
    },
  ],
}

const canStore = () => typeof localStorage !== 'undefined'

function load() {
  if (canStore()) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // Unreadable or blocked storage: fall back to the seed data.
    }
  }
  return structuredClone(seed)
}

// The live "database". Mutate it, then call saveDb().
export const db = load()

export function saveDb() {
  if (!canStore()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage full or blocked: the app keeps working in memory for this session.
  }
}

export function resetDb() {
  Object.keys(db).forEach((key) => delete db[key])
  Object.assign(db, structuredClone(seed))
  saveDb()
}

export function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
