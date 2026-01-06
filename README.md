# UNO

A multiplayer UNO card game built with Next.js, NestJS, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: NestJS 11, Socket.io
- **Database**: PostgreSQL, Prisma ORM
- **Auth**: NextAuth with Google OAuth
- **Monorepo**: Nx

## Prerequisites

- Node.js 18+
- PostgreSQL
- Google OAuth credentials (for authentication)

## Local Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL

Create a PostgreSQL database for the project.

```bash
createdb uno
```

### 3. Configure Environment Variables

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/uno"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Auth
JWT_SECRET="your-jwt-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Backend
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000/api"
```

### 4. Run Database Migrations

```bash
npx nx prisma:migrate:deploy backend
```

### 5. Generate Prisma Client

```bash
npx nx prisma:generate backend
```

### 6. Seed Database

Seeds the UNO card deck into the database.

```bash
npx nx seed backend
```

### 7. Start the Application

Run both frontend and backend in separate terminals:

**Backend** (port 8000):

```bash
npx nx dev backend
```

**Frontend** (port 3000):

```bash
npx nx dev app
```

Visit [http://localhost:3000](http://localhost:3000) to play.

## Available Commands

| Command                                                     | Description                             |
| ----------------------------------------------------------- | --------------------------------------- |
| `npx nx dev app`                                            | Start frontend dev server               |
| `npx nx dev backend`                                        | Start backend dev server                |
| `npx nx build app`                                          | Build frontend                          |
| `npx nx build backend`                                      | Build backend                           |
| `npx nx test app`                                           | Run frontend tests                      |
| `npx nx test backend`                                       | Run backend tests                       |
| `npx nx lint app`                                           | Lint frontend                           |
| `npx nx lint backend`                                       | Lint backend                            |
| `npx nx prisma:generate backend`                            | Generate Prisma client                  |
| `npx nx prisma:migrate:dev backend --name=<migration_name>` | Create and apply migration              |
| `npx nx prisma:migrate:deploy backend`                      | Apply pending migrations                |
| `npx nx prisma:migrate:reset backend`                       | Reset database and apply all migrations |
| `npx nx seed backend`                                       | Seed UNO cards                          |
