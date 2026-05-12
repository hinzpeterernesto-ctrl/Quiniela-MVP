# Quiniela Mundial 2026 — MVP

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus keys de Supabase

# 3. Crear schema en Supabase
# Ir a Supabase Dashboard → SQL Editor
# Pegar y ejecutar el contenido de: supabase/schema.sql

# 4. Correr en desarrollo
npm run dev
```

## Estructura

```
src/
├── app/
│   ├── (auth)/           # login, register
│   ├── (app)/            # dashboard, matches, groups, profile
│   ├── auth/callback/    # OAuth callback
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # shadcn components
│   ├── navigation/       # sidebar, bottom nav
│   ├── match/            # match cards, prediction form
│   ├── leaderboard/      # standings table
│   └── providers.tsx
├── contexts/
│   └── auth-context.tsx
├── lib/
│   ├── supabase/         # server, client, middleware
│   └── utils.ts
└── types/
    └── database.ts
```

## Variables de entorno

| Variable | Dónde encontrarla |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
