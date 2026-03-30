# Tourinker

Sayanabha loves to travel. He also loves to journal. The problem is, somewhere between
catching a 5am train in Jaisalmer and eating the best thali of his life in a dhaba with
no name, the details get fuzzy. The ink runs out. The phone dies. The moment passes.

So he built Tourinker.

A travel journal that lives in his pocket, never runs out of ink, and -- on days when
he can barely string a sentence together after 14 hours of buses -- rewrites his barely
coherent notes into something worth reading years from now.

That is the whole idea. Write badly. Let the AI fix it. Remember everything.


## What it does

Tourinker lets you log every day of a trip. You write raw, unfiltered notes about where
you went, what you ate, how your feet hurt, what that stranger said on the train. Then
Gemini 2.5 Flash reads it and turns it into a clean, personal diary entry that actually
sounds like you, not a travel brochure.

If Gemini is having a moment, Groq steps in as backup. You will never stare at a
spinning loader and lose your entry.

You also get:

- A full trip timeline with photos, mood, and location per day
- Automatic weather logging (no API key nonsense, just your coordinates and a date)
- Cost tracking by category so you know exactly how much of your budget went to food
- A map view of every place you pinned during a trip
- A public share link so friends and family can follow along without needing an account
- Offline draft saving so a bad hotel wifi cannot take your journal entry hostage
- Full text search across every trip and entry you have ever written
- Entry templates for days when even starting feels hard


## Tech stack

Built entirely on free tiers because paying for a personal travel journal is silly.

- Next.js 15 with App Router
- Supabase for database, auth, and image storage
- Gemini 2.5 Flash as the primary AI model
- Groq with llama-3.1-8b-instant as the fallback
- Open-Meteo for weather (genuinely free, no key required)
- Nominatim for reverse geocoding (same deal)
- Leaflet with OpenStreetMap for the map view
- Tailwind CSS and shadcn/ui for the interface
- Netlify for deployment


## Running it locally

You will need Node 20+ and accounts on Supabase, Google AI Studio, and Groq.
All free.

Clone the repo and install dependencies:
```bash
git clone https://github.com/Sayanabha/tourinker.git
cd tourinker
npm install
```

Create a `.env.local` file at the root:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the two SQL migration files in `supabase/migrations/` through the Supabase SQL
editor in order: `001_trips.sql` first, then `002_rls.sql`.

Then:
```bash
npm run dev
```

Open `localhost:3000`. Sign in with a magic link. Start logging.


## Project structure

The short version: `app/` has all the pages, `components/` has everything rendered,
`hooks/` has all the data and state logic, `lib/` has the AI clients and utilities,
and `supabase/migrations/` has the database schema.

The longer version is in the codebase, which is honestly readable.


## The name

Tourinker. Tour + Inker. As in, someone who inks their tours. Someone who was mid-trip
in Hampi, running low on notebook pages, and thought there had to be a better way.

There is now.


## Author

Sayanabha -- traveler, journalist, occasional over-packer.