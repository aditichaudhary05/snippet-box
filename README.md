# SnippetBox

A minimal, blazing-fast code snippet manager for developers. Save, search, and reuse code snippets instantly.

**Live App:** [snippetbox-web.vercel.app](https://snippetbox-web.vercel.app)

## Features

- Rich code editor with syntax highlighting for 50+ languages
- Instant fuzzy search across all snippets
- Organize snippets with tags and collections
- Favorite snippets for quick access
- Dark theme with glassmorphism UI
- Command palette for keyboard-driven navigation
- Responsive design (desktop + mobile)
- JWT authentication with secure session handling

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Zustand, React Router, Framer Motion |
| Backend | Node.js, Express, PostgreSQL (pg) |
| Auth | JWT, bcryptjs |
| Database | Neon PostgreSQL |
| Hosting | Vercel (frontend), Render (backend) |

## Project Structure

```
SnippetBox/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── api.js          # Axios instance with interceptors
│   │   ├── store.js        # Zustand state management
│   │   └── utils.js        # Utility functions
│   └── vite.config.js
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   ├── middleware/          # Auth & error middleware
│   ├── db.js               # PostgreSQL connection pool
│   ├── index.js            # Server entry point
│   └── init-db.js          # Database schema & seed data
└── vercel.json             # Vercel deployment config
```

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)

### Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/aditichaudhary05/snippet-box.git
   cd snippet-box
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Create `.env` from the example:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/SnippetBox
   JWT_SECRET=your_random_secret_at_least_32_chars
   CLIENT_URL=http://localhost:5173
   PORT=3001
   NODE_ENV=development
   ```

5. Initialize the database:
   ```bash
   npm run init-db
   ```

6. Start the backend (terminal 1):
   ```bash
   npm run dev
   ```

7. Install client dependencies (terminal 2):
   ```bash
   cd ../client
   npm install
   ```

8. Start the frontend:
   ```bash
   npm run dev
   ```

9. Open [http://localhost:5173](http://localhost:5173)

### Demo Credentials

- **Email:** demo@snippetbox.dev
- **Password:** demo123

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| PUT | `/api/auth/password` | Change password |
| GET | `/api/snippets` | List snippets (with filters) |
| POST | `/api/snippets` | Create snippet |
| GET | `/api/snippets/:id` | Get snippet |
| PUT | `/api/snippets/:id` | Update snippet |
| DELETE | `/api/snippets/:id` | Delete snippet |
| POST | `/api/snippets/:id/favorite` | Toggle favorite |
| POST | `/api/snippets/:id/copy` | Increment copy count |
| GET | `/api/snippets/languages` | Get languages list |
| GET | `/api/tags` | List tags |
| POST | `/api/tags` | Create tag |
| DELETE | `/api/tags/:id` | Delete tag |
| GET | `/api/collections` | List collections |
| POST | `/api/collections` | Create collection |
| GET | `/api/search` | Search snippets |
| GET | `/api/stats` | Get dashboard stats |
| GET | `/api/health` | Health check |

## Deployment

### Frontend (Vercel)

1. Connect GitHub repo on [vercel.com](https://vercel.com)
2. Set root directory to `client`
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
4. Deploy

### Backend (Render)

1. Connect GitHub repo on [render.com](https://render.com)
2. Set build command: `cd server && npm install`
3. Set start command: `cd server && npm start`
4. Add environment variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = your Neon PostgreSQL connection string
   - `JWT_SECRET` = a random 32+ character string
   - `CLIENT_URL` = your Vercel frontend URL
5. Deploy

## License

MIT
