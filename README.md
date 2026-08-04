# Bracket Studio

Sito ufficiale di Bracket Studio, costruito con Next.js.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- Tailwind CSS
- Motion (animazioni)
- [Sanity](https://www.sanity.io) come CMS (cartella `studio/`)
- next-intl per l'internazionalizzazione

## Sviluppo

```bash
npm install
npm run dev
```

Il sito è disponibile su [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Struttura

- `app/` — route e pagine (App Router)
- `components/` — componenti UI condivisi
- `lib/` — utility e configurazione
- `i18n/` / `messages/` — internazionalizzazione
- `studio/` — Sanity Studio (CMS)
