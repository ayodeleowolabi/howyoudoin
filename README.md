Howyoudoin readme · MD
howUdoin?

Tests

🔗 Live demo: howudoin.onrender.com. Click Try the demo to log in with a sample student account; no sign-up needed. (It's on a free server that sleeps, so the first load can take about 30 seconds.)

A full-stack app where students submit weekly self-reviews, rating how well they understand the material from 0 to 4 and adding a reflection. I built it from my time as a classroom teacher (Teach For America), so teachers can spot students who are falling behind before the test, not after.

It began as my first full-stack app at General Assembly. Later I came back to it as a QA project: I did an exploratory test pass, wrote up 12 bugs (including two critical access-control flaws), fixed them, and put 55 automated tests in CI so they stay fixed. I also redesigned the UI.

Show Image

QA highlights
	
🐞 Exploratory testing	Bug report with 12 defects plus 1 security hardening item, each with severity, repro steps, root cause and fix
🔌 API tests	43 Jest + Supertest tests: auth, route protection, CRUD, validation, mass assignment, and cross-user authorization
🎭 E2E tests	12 Playwright scenarios × 2 viewports (desktop + mobile) = 24 runs, using accessible, role-based locators
⚙️ CI	GitHub Actions runs both suites against a MongoDB service container on every push and PR, and uploads an HTML report
✅ Regression-proof	Every bug ID in the report maps to a named test. Reintroducing the access-control bug fails 4 tests.

The most serious finding: any logged-in student could open, edit or delete another student's private review just by changing the ID in the URL (an IDOR / broken access control flaw). Every review route now checks that you own the review and returns a 404 if you don't.

Features
Sign up and log in with bcrypt-hashed passwords, server-side sessions, session regeneration at login, and clear error messages
Weekly reviews (full CRUD): choose a week, pick a 0–4 confidence level on a color-coded scale, and write a reflection
Dashboard with this week's objective, the number of reviews submitted and the latest rating
Parent/guardian contact info (full CRUD)
Privacy built in: students can only ever see their own data
Friendly 404 and error pages, empty states, accessible forms (labels, fieldsets, focus styles), and a responsive layout
Reviews	New review	Mobile dashboard
Show Image	Show Image	Show Image
Tech stack
Layer	Tools
Server	Node.js, Express
Database	MongoDB, Mongoose
Views	EJS, custom CSS
Auth	bcrypt, express-session
Testing	Jest, Supertest, Playwright, mongodb-memory-server
CI	GitHub Actions
Running locally
bash
npm install
cp .env.example .env    # then fill in MONGODB_URI and SESSION_SECRET
npm run dev             # http://localhost:3000
Deployment

The app is deployed on Render with MongoDB Atlas. The render.yaml blueprint sets everything up:

Sessions are stored in MongoDB (connect-mongo), so logins survive restarts, and cookies are Secure, HttpOnly and SameSite=Lax in production.
A /healthz endpoint is used for Render's health checks.
When SHOW_DEMO_LOGIN=true, a demo account is created on startup if it doesn't exist yet. Run npm run seed:demo to reset it to the sample data.
Every merge to main auto-deploys.
Running the tests

The tests start their own throwaway in-memory MongoDB, so no setup is needed.

bash
npm run test:api                    # Jest + Supertest
npx playwright install chromium     # first time only
npm run test:e2e                    # Playwright (starts the app automatically)
npm run test:all                    # both

To use a real MongoDB instead, set MONGODB_TEST_URI=mongodb://127.0.0.1:27017.

Project structure
app.js                 Express app (exported for tests)
server.js              connects to MongoDB and starts the server
controllers/           auth, reviews, student information
models/                User (with embedded contact info), Review
middleware/            session user loader, login guard
views/                 EJS templates and partials
tests/api/             Jest + Supertest suites
tests/e2e/             Playwright specs, fixtures and the test server
docs/BUG_REPORT.md     exploratory test findings
Planning
Wireframes designed in Canva
ERD designed in Lucid
User stories tracked in Trello
Future updates

The roadmap below grows howUdoin? from a single-student tracker into a class- and school-wide tool. Each phase ships and gets tested before the next one starts.

Phase 1: Teacher and student accounts, class codes
Two account types chosen at sign-up: Teacher and Student
Teachers create classes, and each class gets a unique, shareable class code
Students join a class by entering its code, and can belong to several classes
Teachers set weekly objectives for each class; students see only the objectives for the classes they've joined
Students submit their weekly 0–4 rating and reflection against that class's objectives
A class overview for teachers shows every student's rating and reflection by week, with students who rate themselves 0–1 flagged for follow-up
Phase 2: Exit tickets and evidence
Teachers create exit tickets (short check-for-understanding questions) tied to a class and week
Students answer exit tickets and can attach evidence (text, a link, or a photo, replacing the earlier "photo uploads for weekly quizzes" idea)
Teachers see a per-student, per-class record of exit tickets and evidence over time
Phase 3: Departments and the school bank
Schools become the top level, and teachers belong to a school
Teachers label classes by department (Science, Math, English, Music, Art, or a custom department) and grade level
Every class code links to its school, department, subject and grade
A school bank organizes all classes by department and grade, giving a quick overview of confidence trends across the school
Planned data model
School
 └─ Department (Science, Math, English, Music, Art, ...)
     └─ Class (class code, subject, grade, teacher)
         ├─ Weekly objectives
         ├─ Exit tickets
         └─ Enrolled students
             ├─ Weekly reviews (0–4 rating + reflection)
             ├─ Exit ticket responses
             └─ Evidence
Privacy and quality plan
Access checked on the server for every route: students see only their own data; teachers see only students in their own classes
Hard-to-guess class codes that teachers can regenerate, plus the option to close a class to new students
Clear privacy wording: responses stay hidden from classmates and are visible to the student's teacher
Student data compliance review (FERPA, and COPPA for students under 13) before any real classroom use
New automated tests for every role boundary, extending the existing suites: a student can't see another student's work, a teacher can't open another teacher's class, and a student can't join or view a class without its code
Open questions
Who can view the school bank: all teachers, department heads, or a separate school admin role?
How should younger students sign in (class code plus username, or school Google accounts)?
Where should evidence photos be stored, since Render's disk resets on each deploy (for example, Cloudinary or S3)?

Built by Ayodele Owolabi. Started at General Assembly; QA pass and redesign in 2026.
