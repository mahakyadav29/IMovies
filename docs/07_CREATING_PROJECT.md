# Task 07: Creating the Project

## 1. Project Initialization
The **IMovies** project was initialized as a clean monorepo workspace containing separate `server` (Node.js/Express) and `client` (React/Vite) applications with unified root scripts.

## 2. Directory Layout Setup
The initial structure was generated with the following layout:

```text
IMovies/
├── client/              # React 18 + Vite frontend
├── server/              # Node.js + Express backend
├── docs/                # Project documentation for 19 Kanban tasks
├── package.json         # Root scripts runner
└── .gitignore           # Git ignore rules for node_modules, .env, build output
```

## 3. Scaffolding Commands Executed

### Root Workspace Setup
```bash
# Initialize root package.json
npm init -y
```

### Server Initialization
```bash
cd server
npm init -y
npm install express mongoose jsonwebtoken bcryptjs dotenv cors express-rate-limit socket.io morgan
```

### Client Initialization (Vite + React)
```bash
cd ../client
# Generated with React template
npm install react react-dom react-router-dom axios react-toastify socket.io-client bootstrap bootstrap-icons
npm install -D vite @vitejs/plugin-react
```

## 4. Root Helper Scripts
In the root `package.json`, unified convenience commands were configured so that evaluators can run both parts from one place:
- `npm run server`: Starts the backend API on port 5000 with nodemon/watch mode.
- `npm run client`: Starts the Vite development server on port 5173.
- `npm run seed`: Seeds the database with sample movies, theatres, shows, and admin/customer accounts.
- `npm test`: Runs automated backend unit and integration tests.
