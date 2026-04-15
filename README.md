# Sahajayoga Chakra & Nadi Guidance Tool

A production-style full-stack monorepo for a spiritually respectful Sahajayoga guidance application.

## What this project includes
- React 18 + Vite frontend
- Node.js + Express.js backend
- MongoDB + Mongoose models
- JWT-based admin authentication
- Rule-based scoring engine
- Anonymous session-based result history
- Seed data for chakras, nadis, questions, remedies, mantras, content blocks, and a super admin

## Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

## Frontend setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Public API
- GET /api/questions
- GET /api/questions/:id
- GET /api/chakras
- GET /api/nadis
- GET /api/content/:key
- POST /api/submit
- GET /api/result/:sessionId

## Admin API
Includes login, question CRUD, option CRUD, chakra/nadi management, remedy/mantra/content management, analytics, and result history.

## Notes
- The scoring engine lives in `backend/services/scoringEngine.js`.
- Questionnaire seed content lives in `backend/seed/seedData.js`.
- The current admin pages are functional list-style management pages and a solid base for richer editing workflows.
