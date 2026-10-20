# TickIT frontend

Angular client for TickIT, a ticketing platform for fiber installation cases. It talks to the [Spring Boot backend](https://github.com/yassine-krichen/tickit-ticketing-backend) over REST with a JWT.

![Angular](https://img.shields.io/badge/Angular-11-DD0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-4.1-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-PolyForm%20Strict-blue)

## Context

Built during my internship at Sofrecom Tunisie (Orange Group), February to June 2025, for an FTTH installation team that tracked requests through email and files. This repository is the web client; the history here covers April to May 2025. The server side, the audit ledger, the RAG assistant and the notification channel are in the backend repository.

## What it does

Agents sign in, see their tickets on a dashboard, open one to follow its case through its treatment steps, and read AI-suggested fixes next to the ticket.

**Dashboard** — Paged ticket list with search, a filter drawer (status, priority, type), assignee and priority badges, and KPI tiles fed by `/tickets/stats/all`.

**Ticket details** — Header, description, metadata, activity timeline with comments, a case tracker showing the treatment steps, and the treatment act history read from the backend ledger.

**AI recommendations** — A panel that displays the resolution suggestion returned by the backend for the open ticket.

**Create and edit** — One reactive form for creating and updating tickets, with type and step validated against the backend's allowed combinations.

**Auth** — Login and signup forms, an HTTP interceptor that attaches the JWT, and a route guard that redirects unauthenticated users to `/auth/login`.

**i18n** — English and French strings through `ngx-translate`.

## Structure

```
src/app/
  core/       services (auth, ticket, activity, treatment act, user), guard, interceptor, models
  features/   auth, dashboard, ticket-details, ticket-create-update  (lazy routes per feature)
  shared/     pipes, date utilities
```

Decisions:

- **Feature modules with lazy routes** over one flat module, so the dashboard does not load the details or form code until needed.
- **Services own HTTP, components own presentation**: components never build URLs; they call typed methods on `TicketService` and friends.
- **Server-side filtering and paging** over client-side filtering, since the ticket list is unbounded.

## Tech stack

| Technology | Role |
| --- | --- |
| Angular 11, TypeScript 4.1, RxJS 6 | Application framework |
| Bootstrap 5 (CDN) | Layout and components |
| `@ngx-translate` | English and French |
| `jwt-decode` | Reads the user's roles from the token |
| Karma, Jasmine, Protractor | Unit and e2e test setup from the Angular CLI |

## Getting started

```bash
git clone https://github.com/yassine-krichen/tickit-ticketing-frontend.git
cd tickit-ticketing-frontend
npm install
npm start          # http://localhost:4200
```

The API base URL is `apiUrl` in `src/environments/environment.ts` (default `http://localhost:8080`); run the backend first.

```bash
npm run build      # production build into dist/
npm test           # Karma unit tests
```

## Limits

This branch has no WebSocket client, so live notifications are not wired into the UI here. The Angular version is 11 because the project started from that CLI template.

## License

**Source-available, not open source.** TickIT is published under the
[PolyForm Strict License 1.0.0](LICENSE) so you can read the code, run it, and learn
from it for personal, research, or evaluation use.

You may **not** use it commercially, redistribute it, rebrand it, or publish modified
versions without written permission. Copyright (c) 2025 Yassine Krichen. All rights
not granted by the license are reserved.

For commercial licensing or collaboration: krichenyassine22@gmail.com

Built by [Yassine Krichen](https://github.com/yassine-krichen)
