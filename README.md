# Smart Freight Dispatch System

An AI-augmented freight dispatch platform that matches incoming cargo transport requests to the optimal vehicle and driver combination — using a deterministic scoring algorithm as the core decision engine, with LLMs at the edges for natural language input parsing and plain-language explanation of results.

## Demo

_Link and GIF to be added after deployment._

## Problem

A freight company managing a heterogeneous fleet (vans, trucks, refrigerated trucks, flatbeds) currently relies on dispatchers manually matching ad-hoc jobs to available vehicles and drivers — a slow, error-prone process. This system automates that match in seconds while keeping a human in the loop for confirmation.

## Architecture

![AWS Architecture](docs/freight-dispatch-aws-architecture.png)

React frontend (S3 + CloudFront) → Express backend (ECS Fargate + ALB) → PostgreSQL (RDS + pgvector).

## Design philosophy: algorithm core, AI augmentation

The matching/scoring engine is deterministic and authoritative. The LLM is used only at the edges — to parse free-text requests into structured data, and to explain the algorithm's output in natural language — never to make the actual assignment decision. This keeps the core behavior fast, predictable, and fully testable.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Amazon RDS) + pgvector |
| LLM | OpenAI API (structured output / function calling) |
| Routing/ETA | Google Maps Directions API |
| SMS | AWS SNS |
| Auth | JWT, role-based (Admin / Dispatcher) |
| Compute | Amazon ECS Fargate + ALB |
| Static hosting | Amazon S3 + CloudFront |
| CI/CD | GitHub Actions |

## Features

- Natural language request intake (LLM parsing with human confirmation)
- Deterministic vehicle/driver matching with weighted scoring (proximity, cost, overtime risk, idle time)
- AI-generated plain-language explanations for each ranked match
- Real-time ETA via Google Maps Directions API
- Role-based access: Admin (fleet management) / Dispatcher (jobs)
- Booking confirmation with derived availability tracking
- SMS notification to assigned driver on booking confirmation
- RAG-based policy/route assistant (secondary feature)

## Data model

![ER Diagram](docs/freight-dispatch-er-diagram.png)

## Getting started (local setup)

```bash
# 1. Clone
git clone <repo-url>
cd freight-dispatch

# 2. Backend
cd backend
cp ../.env.example .env   # fill in your values
npm install
npm run migrate           # requires DATABASE_URL set in .env
npm run dev               # starts on :4000

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev               # starts on :5173, proxies /api to :4000
```

## Testing

```bash
# Backend unit tests (matching algorithm)
cd backend && npm test

# Backend lint
cd backend && npm run lint

# Frontend lint + type-check
cd frontend && npm run lint && npm run build
```

## Known limitations & future improvements

- No live GPS integration — vehicle locations are manually set/simulated
- No multi-stop or backhaul route optimization
- Seeded/synthetic data only — not sourced from a real company
- LLM parser not 100% reliable on ambiguous input (handled by always surfacing parsed output for dispatcher confirmation)
- Single-region AWS deployment

## License

MIT
