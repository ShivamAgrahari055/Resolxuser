# ResolveX — College Grievance Redressal Portal

ResolveX is a web portal for MNNIT Allahabad students to submit complaints
(hostel, mess, academics, facilities, other) and staff to review, assign,
investigate, escalate, and resolve them. Every important action is recorded in
a tamper-evident, hash-linked audit ledger (SHA-256).

**Tech stack:** Next.js + TypeScript · Tailwind CSS · MongoDB + Mongoose ·
Node.js crypto (SHA-256) · bcrypt · Motion / GSAP for the landing page.

---

## 1. What you need before running (Prerequisites)

| Tool | Required version | Why | Check it works |
|---|---|---|---|
| Node.js | 20.x or newer (v24 tested) | Runs Next.js | Open a terminal → `node --version` |
| npm | 10.x or newer | Installs packages (comes with Node) | `npm --version` |
| Git | any recent | To get/update the code and save history | `git --version` |
| MongoDB Atlas | free tier account | Stores all data (no local install needed) | — |

> If any command above prints "not recognized", install the tool first:
> - Node.js: https://nodejs.org → download the **LTS** installer → Next → Next → Finish.
> - Git: https://git-scm.com/download/win → default options are fine.
>
> You do **not** need to install MongoDB on your computer. We use **MongoDB Atlas**
> (a free cloud database). That is the easiest and recommended path below.

---

## 2. Get a free MongoDB database (one-time, ~5 minutes)

### Step 2.1 — Create an Atlas account
1. Go to **https://www.mongodb.com/cloud/atlas** and click **Sign up** (email or Google).
2. Once logged in, answer the small setup questions or skip them.

### Step 2.2 — Create a free cluster
1. Click **"Create"** (or "Build a Database").
2. Choose **M0 FREE** (Sandbox) — costs nothing.
3. Provider: **AWS** (any is fine), Region: pick one near you (e.g. `mumbai` / `singapore`).
4. Cluster name: leave as `Cluster0`, then click **Create**.
5. Wait 1–3 minutes until the cluster shows **"Ready"**.

### Step 2.3 — Create a database user (this is your DB username & password)
1. When prompted, open **"Database Access"** → **"Add New Database User"**.
2. **Username:** `resolxuser`
3. **Password:** click **Autogenerate** and **copy it somewhere safe**
   (e.g., `MyStr0ngPass9`).
   - Avoid `@`, `:`, `/` in the password — they break the connection string.
   - If your generated password has them, just create your own like `MyStr0ngPass9`.
4. Under "Authentication method" keep **Password**.
5. Role: leave the default **"Read and write to any database"**. Click **Add User**.

### Step 2.4 — Allow your computer's IP to connect
1. Go to **"Network Access"** (left sidebar) → **"Add IP Address"**.
2. For development, click **"ALLOW ACCESS FROM ANYWHERE"** (`0.0.0.0/0`) → Confirm.
   - This is the simplest for a beginner project. It is acceptable here because
     your DB user has a strong password; you can restrict the IP later for a real deployment.

### Step 2.5 — Copy your connection string
1. Go to **"Database"** (left sidebar) → your cluster → click **"Connect"**.
2. Choose **"Drivers"** → select **Node.js** → version "Generic".
3. You will see something like:
   ```
   mongodb+srv://resolxuser:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Copy it. ⚠️ **Two edits before using it:**
   - Replace `<db_password>` with your real password from Step 2.3.
   - Insert your **database name** right after `mongodb.net/` — we use `resolx`.
     ```
     mongodb+srv://resolxuser:MyStr0ngPass9@cluster0.xxxxx.mongodb.net/resolx?retryWrites=true&w=majority
     ```
   - **Special characters note:** if your password contains characters like
     `@ # % !` you must URL-encode them (`@` → `%40`, `#` → `%23`, `%` → `%25`).
     Rule of thumb: use only letters, digits, `-`, `_` in the password and skip
     encoding entirely. The database name (`resolx`) does **not** need to exist
     beforehand — MongoDB creates it automatically on first write.

Hold on to this string. You will paste it into `.env.local` in Step 3.2.

---

## 3. Set up the project

### Step 3.1 — Get the code
```bash
git clone <your-repository-url>          # if you have a repo
# — or —
# if the code was shared as a ZIP, extract it and open that folder instead
cd webster_e3
```

### Step 3.2 — Create your environment file
The project reads settings from a file named `.env.local` (never committed to git).
Create it in the project root by copying the provided template:
```bash
copy .env.example .env.local             # Windows (PowerShell): copy or Copy-Item
# macOS / Linux: cp .env.example .env.local
```
Now open `.env.local` in any text editor (VS Code / Notepad) and fill in:

```env
MONGODB_URI=TheAtLASStringYouBuiltInStep2.5
AUTH_SECRET=SomeLongRandomString
```

- `MONGODB_URI` — paste **your** edited Atlas string.
- `AUTH_SECRET` — a long random used to sign login sessions. Generate one by
  opening a terminal and running:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Copy the output and paste it as the value.

> **Do not commit `.env.local` to git.** It contains your database password.
> It is listed in `.gitignore` automatically, so a normal `git add` will skip it.

### Step 3.3 — Install dependencies
```bash
npm install
```
This downloads every package listed in `package.json`. Expect 1–3 minutes.

---

## 4. Create the first accounts (seeding)

The app ships with a seed script that creates:
| Role | Email | Password |
|---|---|---|
| Student | `student@resolx.local` | Student@123 |
| Staff | `staff@resolx.local` | Staff@123 |

> Change these in `src/db/seed.ts` **before real use** — they exist for demos only.

```bash
npm run seed        # run once after installing dependencies
```
You should see:
```
Seeded 2 users: 1 student, 1 staff.
```
If you seed twice you'll get duplicate emails — drop the `users` collection
(the seed script prints how) or change the emails.

---

## 5. Run the app

```bash
npm run dev
```
Then open **http://localhost:3000** in your browser.

You should see the landing page. Try:
- `/login` → log in with a seeded account above.
  - Student → `/app/student` — your grievances dashboard.
  - Staff → `/app/staff` — the staff work queue.
- `/api/health` → should return `{"ok":true,"db":true}` if the database connects.

To stop the server, press **Ctrl + C** in the terminal.

Build for production later:
```bash
npm run build
npm start
```

---

## 6. Quick verification checklist

Run these one by one — each confirms an important part works:

1. `node --version` → 20 or higher ✓
2. `npm install` finished with no error ✓
3. `.env.local` exists in the root folder (next to `package.json`), has your real
   password inside `MONGODB_URI` ✓
4. `npm run seed` → printed "Seeded 2 users" ✓
5. `npm run dev` → "Ready in X ms", no red error in terminal ✓
6. Browser → http://localhost:3000/api/health → `{"ok":true,"db":true}` ✓
7. `/login` with `student@resolx.local` / `Student@123` → lands on dashboard ✓

---

## 7. Common errors and what to do

| Error message (or symptom) | Cause | Fix |
|---|---|---|
| `MongooseServerSelectionError` or bad auth in terminal | Wrong `MONGODB_URI` or password | Re-copy the string from Atlas; check `<db_password>` was replaced; the password has no `@`/`:`/`/`; database name `resolx` follows `mongodb.net/` |
| Same error but mentions `0.0.0.0` | Your IP isn't allowed by Atlas | Step 2.4 → add `0.0.0.0/0` or your real IP |
| `must be configured on replica set` / transaction errors | Reached a single-node DB (e.g. local `mongod`) | Use the Atlas cluster from Step 2 — feature upgrades need a replica set |
| `MODULE_NOT_FOUND: .env.local` or secret errors | File missing or typo'd name | Confirm the file is named exactly `.env.local` (hidden files may need "view hidden files" enabled), in the project root |
| Authentication fails in-session but server runs normally | `AUTH_SECRET` missing | Step 3.2 — set the secret |
| `Seeded 2 users` but second run errors `E11000 duplicate key` | You ran the seed twice | Drop your users data in MongoDB Atlas ("Browse collections" → drop `users`) or change the emails |
| Browser shows `429 / too many requests` on login | Built-in rate limiting | Wait ~15 minutes, then try again |
| Port `3000` already in use | Another node process | Run `npm run dev -- -p 3001` instead |
| Slow first request, dev page feels sluggish | Hot-code-reloading download | Only affects dev mode; the production (`npm run build && npm start`) flow is unaffected |

---

## 8. What lives where (project tour)

```
webster_e3/
├─ .env.example          ← template to copy into .env.local
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                 ← public landing (immersive)
│  │  ├─ login/page.tsx           ← shared login screen
│  │  ├─ app/student/…            ← student area (protected)
│  │  ├─ app/staff/…              ← staff area (protected, incl. audit verify)
│  │  └─ api/…                    ← route handlers (auth, grievances, audit)
│  ├─ db/
│  │  ├─ connect.ts               ← cached Mongoose connection
│  │  ├─ models/                  ← User, Grievance, AuditEvent schemas
│  │  └─ seed.ts                  ← initial data script
│  ├─ lib/
│  │  ├─ auth.ts                  ← login, session, requireRole helpers
│  │  ├─ workflow.ts              ← state machine + transition table
│  │  ├─ ledger.ts                ← hash-chain logic (canonical json, sha256)
│  │  └─ validate.ts              ← input schemas
│  └─ components/                 ← shared UI
├─ middleware.ts                  ← coarse route guard (real checks still live in /lib/auth)
```

**Functionality map (what happens when you click)**
- Student submits → form → `POST /api/grievances` → stored as `SUBMITTED` → audit event #1
- Staff transitions → `POST /api/grievances/[id]/transition` → checks   role + status rules → updates the doc + writes the next audit event in one DB transaction
- Anyone (staff) can run `/app/staff/audit/verify` → recalculates the hash chain → reports any tampering, reordering, or missing event

---

## 9. Scripts available

```bash
npm run dev     # launch the dev server on port 3000
npm run build   # create a production build
npm start       # run the production build
npm run seed    # insert starter accounts (uses same MONGODB_URI)
npm run lint    # eslint check
npx tsc --noEmit    # type check only (no build)
```

---

## 10. Where to go next

- Deploy: the easiest path is **Vercel** (free tier). After pushing to GitHub,
  import the project on vercel.com and paste the same env variables into
  Project → Settings → Environment Variables.
- Verify the audit chain: log in as staff → `/app/staff/audit/verify`.
- Read `src/lib/workflow.ts` to see the exact list of allowed status transitions.
