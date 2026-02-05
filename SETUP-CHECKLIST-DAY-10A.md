# Day 10A Setup Checklist (15 minutes)

**Goal:** Get all account/API keys set up so Claude can start coding infrastructure.

---

## What You Do (Before Claude Codes)

### 1. Sentry Setup (5 minutes)

```
1. Open browser → https://sentry.io/auth/login/
2. Sign up or log in
3. Click "Create Project" button (top right or center screen)
4. Select: Next.js
5. Platform: Next.js
6. Create Project
7. You'll see a screen with a DSN that looks like:
   https://xxx@xxx.ingest.sentry.io/12345
8. Copy the entire DSN string
9. Open .env.local in your editor
10. Add this line:
    NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/12345
11. Save .env.local
```

**Expected result:** `.env.local` has `NEXT_PUBLIC_SENTRY_DSN=` line

---

### 2. Resend Setup (5 minutes)

```
1. Open browser → https://resend.com
2. Sign up or log in
3. You'll see a dashboard
4. Look for "API Keys" or "Settings" section (usually left sidebar)
5. Click "Create API Key" or you'll see one already generated
6. Copy the API key (starts with "re_" usually)
7. Open .env.local
8. Add this line:
    RESEND_API_KEY=re_xxxxxxxxxxxx
9. Save .env.local
```

**Expected result:** `.env.local` has `RESEND_API_KEY=` line

---

### 3. Verify Supabase Keys Already in `.env.local` (1 minute)

Open `.env.local` and make sure these three lines already exist (from Session 2):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
```

If they're missing, grab them from Supabase Studio → Settings → API.

---

### 4. Final `.env.local` State

Your `.env.local` should now have these 5 lines (at minimum):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/12345
RESEND_API_KEY=re_xxxxxxxxxxxx
```

---

## What Claude Will Do (Immediately After Setup)

1. Install npm packages: `adhan`, `hijri-converter`, `@sentry/nextjs`
2. Write 3 utility libs: `api-rates.ts`, `api-logger.ts`, `instrumentation.ts`
3. Write 3 SQL migrations for Supabase
4. Write 3 nav components + nav config
5. Write Dashboard page + 8 stub pages
6. Build + verify 0 errors

---

## After Setup Complete

Tell Claude (in this chat):

> ✅ Setup complete. Sentry DSN in `.env.local`, Resend API key in `.env.local`, Supabase keys verified. Ready to code.

Then Claude will immediately start:
1. npm install adhan hijri-converter @sentry/nextjs
2. Building all infrastructure files
3. Creating all component files
4. Running full build verification
