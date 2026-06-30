# Overwatch Dating

Next.js + Supabase dating MVP for Overwatch players.

## Stack

- Next.js App Router with TypeScript
- Supabase Auth with email + password
- Supabase Postgres for profiles, heroes, conversations, messages, blocks, and reports
- Supabase Realtime for live message inserts

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and publishable key.

3. In Supabase SQL Editor, run [supabase/schema.sql](/D:/projects/SRdating/supabase/schema.sql).

4. Manually seed the `heroes` table with your Overwatch hero rows. Each row should include:
   - `slug`
   - `name`
   - `image_url`

5. Start the app:

   ```bash
   npm run dev
   ```

## What You Need For Supabase

Before writing the database, you need:

- A Supabase project
- Your `Project URL`
- Your `publishable key`
- A `.env.local` file in this project
- The SQL schema from [supabase/schema.sql](/D:/projects/SRdating/supabase/schema.sql)

Put these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Legacy note:

- If your Supabase project still only exposes an older `anon` key, the app currently accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` as a fallback.

In Supabase Auth settings:

- enable the `Email` provider
- enable `Email + Password`
- for local development, disable `Confirm Email` if you do not want signup emails
- if you keep email confirmation enabled, set:
  - Site URL: `http://localhost:3000`
  - Redirect URL: `http://localhost:3000/auth/callback`

## How To Write The Database In Supabase

### 1. Create the tables and policies

1. Open your Supabase dashboard.
2. Go to `SQL Editor`.
3. Create a new query.
4. Open [supabase/schema.sql](/D:/projects/SRdating/supabase/schema.sql) from this repo.
5. Copy the whole file into the SQL Editor.
6. Run the query.

That SQL file creates:

- enum types for `platform`, `role`, and `gamemode`
- the `profiles` table
- the `heroes` table
- the `profile_favorite_heroes` join table
- the `conversations` table
- the `messages` table
- the `blocks` table
- the `reports` table
- triggers for `updated_at`
- the auto-create-profile trigger for new auth users
- row level security policies

### 2. Verify the database was created

After running the schema:

1. Go to `Table Editor`.
2. Confirm these tables exist:
   - `profiles`
   - `heroes`
   - `profile_favorite_heroes`
   - `conversations`
   - `messages`
   - `blocks`
   - `reports`
3. Go to `Authentication > Providers` and make sure email auth is enabled.
4. If you want signup to work instantly without inbox confirmation during development, disable `Confirm Email`.

### 3. Add your Overwatch heroes manually

You said you want to add heroes manually. The app reads from the `heroes` table, so insert rows there.

Minimum required columns:

- `slug`
- `name`
- `image_url`

Example SQL:

```sql
insert into public.heroes (slug, name, image_url)
values
  ('ana', 'Ana', 'https://your-image-url/ana.png'),
  ('mercy', 'Mercy', 'https://your-image-url/mercy.png'),
  ('reinhardt', 'Reinhardt', 'https://your-image-url/reinhardt.png');
```

You can run that in `SQL Editor`, or add rows manually from `Table Editor > heroes`.

### 4. How the app uses the database

When the app is running:

- Supabase Auth creates the user account
- if `Confirm Email` is disabled, signup creates a session immediately
- if `Confirm Email` is enabled, Supabase sends a confirmation email before first login
- the trigger in `schema.sql` automatically creates a blank row in `profiles`
- the user fills out their profile in `/profile/me`
- selected heroes are saved into `profile_favorite_heroes`
- chats are stored in `conversations` and `messages`
- block/report actions write to `blocks` and `reports`

## Database Notes

- Do not manually insert rows into `profiles` for normal users. Let Supabase Auth create the user first.
- If you change the structure of the database later, update `supabase/schema.sql` too, so the repo stays accurate.
- If you want to wipe and rebuild locally in Supabase, delete the tables in Supabase first or use a fresh project, then run `schema.sql` again.
- If the hero picker shows nothing, the `heroes` table is empty or the hero rows are missing required values.
- If signup keeps asking for email confirmation, turn off `Confirm Email` in Supabase while developing locally.

## Product Rules Implemented

- Each user gets one editable profile.
- Profiles store `name`, `discord`, `platform`, `role`, `gamemode`, `bio`, and favorite heroes.
- Users browse a grid of complete profiles.
- Any signed-in user can open a conversation with another user.
- Each user can send up to 10 messages per conversation.
- Chat prompts users to continue on Discord once a message limit is reached.
- Users can block and report other users.

## Main Routes

- `/` landing + magic-link sign-in
- `/profile/me` profile editor
- `/browse` discovery grid
- `/profile/[id]` public player profile
- `/messages` conversation list
- `/messages/[conversationId]` chat thread
