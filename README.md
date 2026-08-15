# AI-TaskFLo

TaskFLo is a full-stack daily productivity app for managing tasks, AI-assisted day plans, a Kanban board, and personal analytics — all behind authenticated user accounts.

---

## Features

### Authentication & profile
- User **registration** and **login** with JWT-based auth
- **Forgot / reset password** flow
- **Profile** updates (name, email) and password change
- Protected routes for the main app shell

### Task management
- Create, edit, delete, and complete tasks
- Fields: title, description, priority, due date, completion status, and **tags**
- Filter tasks by today, this week, or priority on the Dashboard
- Shared task state across pages via React Context

### AI daily planner
- Generate a timed day schedule from a goal, available hours, focus mode, and task count
- Focus modes: **Balanced**, **Deep Work**, **Light**
- Load saved plans by selected date (navbar date picker)
- Review generated blocks with priority, duration, and suggested time slots

### Task board (Kanban)
- Columns: **To Do**, **In Progress**, **Done**
- Drag-and-drop status updates
- Search and category/tag filtering
- Sort by due date

### Analytics
- Productivity overview from live task data
- Charts for trends, categories, and completion insights (Recharts)

### App shell
- Sidebar navigation and navbar with shared **selected date**
- Responsive layout with modular CSS + Tailwind utilities

---

## Tech stack

### Frontend (`FrontEnd/`)
| Area | Technology |
|------|------------|
| UI library | React 19 |
| Build tool | Vite 7 |
| Routing | React Router DOM 7 |
| HTTP client | Axios |
| Forms & validation | React Hook Form + Yup |
| Drag and drop | @dnd-kit/react |
| Charts | Recharts |
| Dates | date-fns |
| Icons | Lucide React |
| Styling | Tailwind CSS 4 + custom component CSS |
| Notifications | react-toastify |
| State | React Context (`AppShellContext`) + custom hooks |

### Backend (`BackEnd/`)
| Area | Technology |
|------|------------|
| Runtime | Node.js (ES modules) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| AI planning | OpenAI API |
| Validation | validator |
| Logging | Winston |
| Dev | Nodemon, ESLint, Prettier |

### Architecture overview
```
TaskFLo/
├── FrontEnd/          # React SPA (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── ...
└── BackEnd/           # Express API
    ├── controllers/
    ├── models/
    ├── routes/
    ├── services/      # OpenAI planner service
    ├── middleware/
    └── config/
```

### Main API surface
| Prefix | Purpose |
|--------|---------|
| `/api/user` | Auth, profile, password |
| `/api/tasks` | CRUD tasks + status updates |
| `/api/planner` | Generate / fetch daily plans |
| `/api/board` | Board / timer helpers |
| `/health` | Health check |

---

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key (for plan generation)

### Backend
```bash
cd BackEnd
npm install
```

Create a `.env` file in `BackEnd/` (typical keys):
```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```

Start the API:
```bash
npm start
```

Server defaults to `http://localhost:4000`.

### Frontend
```bash
cd FrontEnd
npm install
```

Create a `.env` file in `FrontEnd/`:
```env
VITE_API_URL=http://localhost:4000/api
```

Start the dev server:
```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## App routes

| Path | Description |
|------|-------------|
| `/login` | Sign in |
| `/signup` | Create account |
| `/forgot-password` | Request reset |
| `/reset-password/:token` | Set new password |
| `/` | Dashboard (tasks + day plan) |
| `/plans` | AI planner form & timeline |
| `/taskboard` | Kanban board |
| `/analytics` | Charts & insights |
| `/profile` | Account settings |

---

## Scripts

### Frontend
- `npm run dev` — start Vite (via nodemon)
- `npm run build` — production build
- `npm run preview` — preview build
- `npm run lint` — ESLint

### Backend
- `npm start` — run API with nodemon
- `npm run lint` / `lint:fix` — ESLint
- `npm run format:check` / `format:fix` — Prettier

---

## License

ISC
