# WhatsApp Clone

A full-stack WhatsApp web clone built in phases as a portfolio/learning project.

## Live Demo
🌐 [whats-up-web-qysq.vercel.app](https://whats-up-web-qysq.vercel.app)

## Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Zustand, Socket.io-client
- **Backend:** Node.js, Express, Socket.io, Prisma ORM
- **Database:** PostgreSQL
- **Deployment:** Vercel (frontend) + Railway (backend + DB)

## Phases

| Phase | Status | Features |
|-------|--------|----------|
| 1.0 — Core messaging | ✅ Live | Auth, real-time chat, delivery status |
| 2.0 — Rich features | 🔜 Next | Groups, media, reactions, read receipts |
| 3.0 — AI integration | 🔜 Planned | Smart replies, summarization, translation |
| 4.0 — Polish | 🔜 Planned | Push notifications, search, E2E encryption |

## Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL

### Run locally
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/whatsapp-clone
cd whatsapp-clone
npm install
npx prisma generate
npx prisma db push

# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:web
\`\`\`

### Environment variables

**apps/server/.env**
\`\`\`
DATABASE_URL=postgresql://postgres:password@localhost:5432/whatsapp_clone
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000
PORT=4000
\`\`\`

**apps/web/.env.local**
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:4000
\`\`\`