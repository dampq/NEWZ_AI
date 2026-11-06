# Development and deployment

## Local development / Codespaces
Use Node 22 or newer. Run `npm ci`. Copy `.env.example` to `.env.local` and fill in your own values. Run `npm run dev -- --port 3000`.

For production, run `npm run build` then `npm start`. `PORT` defaults to 3000. The Node server serves both frontend and API; static hosting alone is insufficient.

## Supabase setup
1. Create a Supabase project. In Authentication > Providers, enable Email; keep email confirmation enabled.
2. In the SQL Editor run `supabase/schema.sql`. This creates private per-user bookmark storage with row-level security.
3. Copy the project URL and **publishable** key (or legacy anon key) into `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never use a secret or service-role key in a VITE variable.
4. In Authentication > URL Configuration set Site URL to your Render URL, and allow that URL with `/` as a redirect. Add your development URL if testing locally. Confirmation and password-reset emails return users here.
5. Supabase's default email service restricts delivery and may only send to project-team addresses. Configure custom SMTP in Supabase for teacher/public signup and reliable confirmation/reset emails. Follow the email provider's domain-verification steps.

## Render hosting
1. Push this repository to GitHub. In Render choose **New > Blueprint**, connect the repository, and select `render.yaml`. Alternatively create a Node Web Service with build command `npm ci && npm run build`, start command `npm start`, and health path `/health`.
2. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and server-only `GEMINI_API_KEY` in Render's environment settings. These values do not transfer from Codespaces or Codex. Optional `NEWZ_AI_MODEL` defaults to `gemini-2.5-flash`.
3. Deploy, then put the resulting `https://…onrender.com` URL into Supabase's URL configuration. Supabase public settings are compiled at build time: rebuild after changing them.
4. Verify public news loads, sign up, confirm email, log in, save a story, log out and back in, reset a password, and ask AI to summarize headlines with sources. Share the Render URL with your teacher.

Render Free may sleep when idle, causing a slow first request; a paid always-on service avoids this. Supabase may also pause inactive free projects. Hosting and provider quotas depend on their plans.

## Security and validation
Passwords are handled by Supabase Auth, never stored in this app. Gemini keys remain on the server. AI requires a verified Supabase session. The app allows five AI requests per minute per user per server process; this is a basic single-instance limit, not a distributed quota. Set provider budget/quota limits before sharing widely. Bookmarks are private under database RLS policies. Public news is available without login.

Run `npm test` and `npm run build`. Automated tests mock providers; live authentication, email delivery, database policies and Gemini answers must also be checked against your configured services. Never commit `.env.local` or credentials.
