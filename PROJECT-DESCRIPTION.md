# GENERAS CORE — Project Description

> **Tracking the journey from Nursery to Infinity.**

GENERAS CORE is a comprehensive **personal portfolio and business platform** built by and for **Kagiraneza Generas**, a Full-Stack Developer, Crypto & Forex Trader, and Entrepreneur based in Kigali, Rwanda. The platform is more than a resume — it is a full business system that showcases work, converts visitors into qualified leads, and sells services (mentorship, consulting, and custom software development).

---

## 🎯 What It Is

A single, production-ready platform that combines:

- **Personal portfolio** — academic journey (Nursery → Infinity), projects showcase, skills matrix, certificates, and photo/media gallery.
- **AI-powered AI Strategist** — an embedded conversational engine (powered by Google Gemini) that transforms every visitor conversation into a project, lead, or booking. It identifies intent (portfolio / startup generator / opportunity scanner / idea validation / booking), scores leads (hot / warm / cold), and produces structured, system-level recommendations.
- **Business & lead capture engine** — collects contact details, project briefs, budgets, and timelines, then notifies the owner in real time via **Email (Resend)** and **WhatsApp (UltraMsg)**.
- **Trading dashboard** — real-time crypto/forex analytics with PnL charts (Recharts).
- **Community & monetization** — supporters/followers hub, coffee/donation support, testimonials with star ratings, comments & likes on blog posts.
- **Admin panel** — full content management and analytics: projects, blogs, testimonials, supporters, followers, skills, certificates, academic reports, mentorship, notifications, contact messages, comments moderation, lead management, and a direct AI conversation/leads dashboard.

---

## ✨ Core Features

### AI Strategist Assistant
- **Not a chatbot** — acts as business analyst, systems architect, startup advisor, and lead qualification engine.
- Converts every input into: problem understanding → system thinking → opportunity extraction → software/AI solution mapping → monetization potential → next action.
- State machine (`new_user`, `project_request`, `idea_input`, `clarification`, `booking_intent`) and mode detection for context-aware responses.
- Lead scoring: `hot` / `warm` / `cold` based on budget, intent, clarity, and business value.
- Local markdown **knowledge base** (about, services, projects, pricing, FAQ, Rwanda market, startup frameworks, cost estimation, etc.) used to ground responses.
- Stores all conversations, leads, and bookings in Supabase.

### Conversion & Notifications
- `/api/chat`, `/api/booking`, `/api/leads`, `/api/analytics` endpoints.
- Real-time owner alerts via email and WhatsApp when a hot lead or booking arrives.
- WhatsApp deep links for instant hand-off to the owner.

### Portfolio & Content
- Home, Academic Journey, Projects (filterable/searchable), Testimonials, Community, Blog, Services & Pricing, Mentorship application, Hiring page.
- Business/company landing sections (Solutions, Process, Pricing, Case Studies, Website Audit, Industries, FAQ, Demo showcase).

### Admin & Roles
- Role-based access (User / Admin / Client) via Supabase Auth.
- Dedicated Admin and Client dashboards with granular managers for every content type.

---

## 🧰 Tech Stack

| Layer      | Technology |
|------------|-----------|
| **Frontend** | React 19, React Router 7, Tailwind CSS 4, lucide-react, react-icons |
| **Build**   | Vite 8 (aggressive optimization: code splitting, manual chunks, lazy loading) |
| **Backend** | Node.js + Express (Express 5) |
| **AI**      | Google Generative AI (Gemini 2.0 Flash), OpenAI |
| **Database**| Supabase (PostgreSQL + Realtime + Storage) |
| **Email**   | Resend |
| **WhatsApp**| UltraMsg |
| **Other**   | i18next (multi-language), PWA/service worker, inline SVGs for low bandwidth |

---

## 📁 Project Structure (key areas)

```
api/                 # Serverless API functions
knowledge/           # Markdown knowledge base for the AI Strategist
src/
├── pages/           # Route components (Home, Academic, Projects, Trading,
│                    #   Testimonials, Community, Blog, Services, Hiring, Admin, ...)
├── components/
│   ├── common/      # Header, Footer, Layout, Loader, LanguageSwitcher
│   ├── AIAssistant/ # Chat window, lead form, project summary
│   ├── admin/       # Managers: projects, blogs, testimonials, supporters,
│   │                #   skills, certificates, leads, analytics, ...
│   ├── business/    # Company landing & sales sections
│   ├── trading/     # Trading charts
│   └── ...
├── context/         # AuthContext, ThemeContext
├── lib/             # Supabase client
├── hooks/           # Custom hooks (e.g., usePageTitle)
├── utils/           # Email, analytics, currency, reminder services
├── i18n/            # Internationalization setup
└── App.jsx          # Router & layout
server.js            # Express backend (AI Strategist API)
*.sql               # Supabase schema / migrations
```

---

## 🔧 Getting Started

1. **Install dependencies** — `npm install`
2. **Configure environment** — create `.env` from `.env.example` with Supabase, Gemini, Resend, and UltraMsg keys.
3. **Run locally** —
   - `npm run dev` (client + server concurrently)
   - `npm run dev:server` (API only)
4. **Build for production** — `npm run build`
5. **Lint** — `npm run lint`

---

## 🧩 Database

Schema is managed through SQL migration files:
- `database-setup.sql` — core tables
- `testimonials-schema.sql`, `supporters-*.sql`, `notifications-table.sql`
- `storage-bucket-*.sql` — file storage buckets
- RLS policy fixes (`fix-rls-*.sql`, `disable-rls-simple.sql`)

---

## 📬 Contact

- **Email**: generaskagiraneza@gmail.com
- **Location**: Kigali, Rwanda
- **WhatsApp**: +250 794 144 738

---

© 2024 Kagiraneza Generas. All rights reserved.
