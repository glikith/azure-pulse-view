# 🔵 Azure Pulse View

> A real-time monitoring dashboard for Azure infrastructure — track resource health, usage metrics, and alerts from a single unified view.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Overview

Azure Pulse View is a monitoring dashboard that surfaces Azure resource data in a clean, interactive UI. Built with React, TypeScript, and Supabase, it pulls infrastructure metrics and displays them through charts and status panels — giving you visibility into your cloud environment without digging through the Azure portal.

---

## Features

| Feature | Description |
|---|---|
| 📊 Live Metrics Dashboard | Recharts-powered visualizations for resource usage, availability, and trends |
| 🔔 Alert Tracking | View and manage active alerts across resources in one place |
| 🗂 Resource Overview | Grouped views of Azure resources with status indicators |
| 🔐 Auth + Row-Level Access | Supabase auth with per-user data isolation |
| 🌗 Theme Support | Light/dark mode via `next-themes` |

---

## Tech Stack

```
Frontend     → React 18 + TypeScript
Build Tool   → Vite
Styling      → Tailwind CSS + shadcn/ui (Radix UI)
State        → Redux Toolkit + React Query
Backend      → Supabase (PostgreSQL + Auth + Realtime)
Charts       → Recharts
Routing      → React Router v6
Validation   → Zod + React Hook Form
Testing      → Vitest + Playwright
```

---

## Project Structure

```
src/
├── components/     # Reusable UI components (shadcn/ui + custom)
├── pages/          # Route-level views
├── store/          # Redux slices
├── hooks/          # Custom React hooks
├── lib/            # Supabase client, utilities
supabase/
└── migrations/     # DB schema migrations
```

---

## Roadmap

- [ ] Azure API integration for live data polling
- [ ] Cost analysis panel
- [ ] Multi-subscription support
- [ ] Alert notification webhooks
- [ ] Export reports as PDF/CSV

---

## Team

| Name | Roll Number |
|---|---|
| C Pravin Sai | 2420030777 |
| G Likith | 2420030056 |
| J Hemanth | 2420039805 |
| Renesh | 2420030346 |

---
