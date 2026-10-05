  <a id="top"></a>

# howUdoin?

[![Tests](https://github.com/ayodeleowolabi/howyoudoin/actions/workflows/tests.yml/badge.svg)](https://github.com/ayodeleowolabi/howyoudoin/actions/workflows/tests.yml)

**A weekly check-in app that helps teachers spot students who are falling behind *before* the test, not after.**

🔗 **Live demo:** [howudoin.onrender.com](https://howudoin.onrender.com). Click **Try the demo** to log in with a sample student account, no sign-up needed. *(It runs on a free server that sleeps, so the first load can take about 30 seconds.)*

![Landing page](docs/screenshots/landing.png)

---

## Contents

1. [About the project](#about-the-project)
2. [Features](#features)
    - [Screenshots](#screenshots)
3. [QA highlights](#qa-highlights)
    - [What I tested](#what-i-tested)
    - [Most serious finding](#most-serious-finding)
4. [Tech stack](#tech-stack)
5. [Getting started](#getting-started)
6. [Running the tests](#running-the-tests)
7. [Deployment](#deployment)
8. [Project structure](#project-structure)
9. [Planning](#planning)
10. [Future updates](#future-updates)
    - [Phase 1: Teacher and student accounts, class codes](#phase-1)
    - [Phase 2: Exit tickets and evidence](#phase-2)
    - [Phase 3: Departments and the school bank](#phase-3)
    - [Planned data model](#planned-data-model)
    - [Privacy and quality plan](#privacy-and-quality-plan)
    - [Open questions](#open-questions)

---

<a id="about-the-project"></a>

## About the project

Students submit a **weekly self-review**, rating how well they understand the material from 0 to 4 and adding a short reflection. I built it from my time as a classroom teacher with Teach For America.

**How it evolved:**

- **Version 1:** my first full-stack app, built at General Assembly.
- **Version 2 (2026):** I returned to it as a QA project. I ran an exploratory test pass, documented **12 bugs** (including two critical access-control flaws), fixed them, added **55 automated tests** in CI so they stay fixed, and redesigned the UI.

[⬆ Back to top](#top)

---

<a id="features"></a>

## Features

- **Sign up and log in** with bcrypt-hashed passwords, server-side sessions, session regeneration at login, and clear error messages
- **Weekly reviews (full CRUD):** choose a week, pick a 0–4 confidence level on a color-coded scale, and write a reflection
- **Dashboard** showing this week's objective, the number of reviews submitted, and the latest rating
- **Parent/guardian contact info** (full CRUD)
- **Privacy built in:** students can only ever see their own data
- **Polished experience:** friendly 404 and error pages, empty states, accessible forms (labels, fieldsets, focus styles), and a responsive layout

<a id="screenshots"></a>

### Screenshots

| Reviews | New review | Mobile dashboard |
|---|---|---|
| ![Reviews list](docs/screenshots/reviews.png) | ![New review form](docs/screenshots/new-review.png) | ![Mobile dashboard](docs/screenshots/dashboard-mobile.png) |

[⬆ Back to top](#top)

---

<a id="qa-highlights"></a>

## QA highlights

<a id="what-i-tested"></a>

### What I tested

- 🐞 **Exploratory testing:** a [bug report](docs/BUG_REPORT.md) with 12 defects plus 1 security hardening item, each with severity, repro steps, root cause, and fix
- 🔌 **API tests:** 43 Jest + Supertest tests covering auth, route protection, CRUD, validation, mass assignment, and **cross-user authorization**
- 🎭 **End-to-end tests:** 12 Playwright scenarios × 2 viewports (desktop + mobile) = 24 runs, using accessible, role-based locators
- ⚙️ **Continuous integration:** GitHub Actions runs both suites against a MongoDB service container on every push and pull request, and uploads an HTML report
- ✅ **Regression-proof:** every bug ID in the report maps to a named test. Reintroducing the access-control bug fails 4 tests.

<a id="most-serious-finding"></a>

### Most serious finding

Any logged-in student could open, edit, or delete another student's private review just by changing the ID in the URL (an **IDOR / broken access control** flaw). Every review route now checks that you own the review and returns a 404 if you don't.

[⬆ Back to top](#top)

---

<a id="tech-stack"></a>

## Tech stack

- **Server:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Views:** EJS, custom CSS
- **Auth:** bcrypt, express-session
- **Testing:** Jest, Supertest, Playwright, mongodb-memory-server
- **CI:** GitHub Actions
- **Hosting:** Render, MongoDB Atlas

[⬆ Back to top](#top)

---

<a id="getting-started"></a>

## Getting started

```bash
npm install
cp .env.example .env    # then fill in MONGODB_URI and SESSION_SECRET
npm run dev             # http://localhost:3000
```

[⬆ Back to top](#top)

---

<a id="running-the-tests"></a>

## Running the tests

The tests start their own throwaway in-memory MongoDB, so no setup is needed.

```bash
npm run test:api                    # Jest + Supertest
npx playwright install chromium     # first time only
npm run test:e2e                    # Playwright (starts the app automatically)
npm run test:all                    # both
```

To use a real MongoDB instead, set `MONGODB_TEST_URI=mongodb://127.0.0.1:27017`.

[⬆ Back to top](#top)

---

<a id="deployment"></a>

## Deployment

The app is deployed on **Render** with **MongoDB Atlas**, and the `render.yaml` blueprint sets everything up.

- **Sessions** are stored in MongoDB (`connect-mongo`), so logins survive restarts. Cookies are `Secure`, `HttpOnly`, and `SameSite=Lax` in production.
- **Health checks:** Render uses the `/healthz` endpoint.
- **Demo account:** when `SHOW_DEMO_LOGIN=true`, a demo account is created on startup if it doesn't exist yet. Run `npm run seed:demo` to reset it to the sample data.
- **Auto-deploy:** every merge to `main` deploys automatically.

[⬆ Back to top](#top)

---

<a id="project-structure"></a>

## Project structure

```
app.js                 Express app (exported for tests)
server.js              connects to MongoDB and starts the server
controllers/           auth, reviews, student information
models/                User (with embedded contact info), Review
middleware/            session user loader, login guard
views/                 EJS templates and partials
tests/api/             Jest + Supertest suites
tests/e2e/             Playwright specs, fixtures and the test server
docs/BUG_REPORT.md     exploratory test findings
```

[⬆ Back to top](#top)

---

<a id="planning"></a>

## Planning

- **Wireframes:** designed in [Canva](https://www.canva.com/design/DAGOV3mnpwk/yO8CGHJXTir5WL6CStQ9HQ/view)
- **ERD:** designed in Lucid
- **User stories:** tracked in [Trello](https://trello.com/b/M2Wyq88u)

[⬆ Back to top](#top)

---

<a id="future-updates"></a>

## Future updates

The roadmap below grows howUdoin? from a single-student tracker into a class- and school-wide tool. Each phase ships and gets tested before the next one starts.

<a id="phase-1"></a>

### Phase 1: Teacher and student accounts, class codes

- **Two account types** chosen at sign-up: Teacher and Student
- **Class codes:** teachers create classes, and each class gets a unique, shareable code
- **Joining classes:** students join by entering a code, and can belong to several classes
- **Weekly objectives per class:** students see only the objectives for the classes they've joined
- **Check-ins per class:** students submit their weekly 0–4 rating and reflection against that class's objectives
- **Class overview for teachers:** every student's rating and reflection by week, with students who rate themselves 0–1 flagged for follow-up

<a id="phase-2"></a>

### Phase 2: Exit tickets and evidence

- **Exit tickets:** teachers create short check-for-understanding questions tied to a class and week
- **Evidence:** students answer exit tickets and can attach text, a link, or a photo
- **Student records:** teachers see each student's exit tickets and evidence over time, per class

<a id="phase-3"></a>

### Phase 3: Departments and the school bank

- **Schools** become the top level, and teachers belong to a school
- **Departments and grades:** teachers label classes by department (Science, Math, English, Music, Art, or a custom department) and grade level
- **Linked class codes:** every code connects to its school, department, subject, and grade
- **School bank:** all classes organized by department and grade, giving a quick overview of confidence trends across the school

<a id="planned-data-model"></a>

### Planned data model

```
School
 └─ Department (Science, Math, English, Music, Art, ...)
     └─ Class (class code, subject, grade, teacher)
         ├─ Weekly objectives
         ├─ Exit tickets
         └─ Enrolled students
             ├─ Weekly reviews (0–4 rating + reflection)
             ├─ Exit ticket responses
             └─ Evidence
```

<a id="privacy-and-quality-plan"></a>

### Privacy and quality plan

- **Server-side access checks on every route:** students see only their own data, and teachers see only students in their own classes
- **Secure class codes:** hard to guess, can be regenerated, and classes can be closed to new students
- **Clear privacy wording:** responses stay hidden from classmates and are visible to the student's teacher
- **Compliance review:** FERPA, and COPPA for students under 13, before any real classroom use
- **Tests for every role boundary,** extending the existing suites: a student can't see another student's work, a teacher can't open another teacher's class, and a student can't join or view a class without its code

<a id="open-questions"></a>

### Open questions

- Who can view the school bank: all teachers, department heads, or a separate school admin role?
- How should younger students sign in: class code plus username, or school Google accounts?
- Where should evidence photos be stored, since Render's disk resets on each deploy (for example, Cloudinary or S3)?

[⬆ Back to top](#top)

---

Built by **Ayodele Owolabi**. Started at General Assembly; QA pass and redesign in 2026.
