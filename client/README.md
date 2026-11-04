# Spotrz — React + TypeScript frontend

A small sports match dashboard using your existing Express REST API and WebSocket server.

## Features

- Current/live, upcoming and completed match sections.
- Select a match to load its commentary in the right-hand panel.
- REST loads the existing commentary timeline.
- WebSocket subscribes to the selected match and appends `commentary_created` events.
- Duplicate commentary is prevented using the database record ID.
- WebSocket reconnects with capped exponential backoff.
- Responsive brutalist UI using Tailwind utilities plus custom CSS.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if needed.

Set `.env` values to match your backend host and port:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Backend contract expected

The frontend expects:

- `GET /matches` -> `{ "data": Match[] }`
- `GET /matches/:matchId/commentary?limit=100` -> `{ "data": Commentary[] }`
- WebSocket `ws://localhost:8000/ws`
- Client subscription: `{ "type": "subscribe", "matchId": 1 }`
- Client unsubscription: `{ "type": "unsubscribe", "matchId": 1 }`
- Server event: `{ "type": "commentary_created", "matchId": 1, "data": Commentary }`

Match fields expected: `id`, `sport`, `homeTeam`, `awayTeam`, `status`, `startTime`, `homeScore`, `awayScore`.

Commentary fields expected: `id`, `matchId`, `minute`, `sequence`, `period`, `eventType`, `actor`, `team`, `message`, `tags`, `createdAt`.

## Important integration checks

1. Ensure Express allows the Vite origin `http://localhost:5173` through CORS.
2. Ensure the matches route returns the `{ data: [...] }` envelope.
3. Ensure the WebSocket broadcaster sends `type: "commentary_created"` with `matchId` and `data`.
4. Ensure the API uses the same property names as `src/types/sports.ts`. Adjust the types/mapping if your API serializes different names.

## Notes

- This starter intentionally does not include authentication or an admin interface.
- Match cards are selected from the three status sections. The selected match drives the commentary panel.
- The current implementation uses one WebSocket connection per selected match. If you later want a persistent app-wide socket, move the connection into a provider/context.
- Tailwind is configured and available; most of the distinctive visual treatment is in `src/styles.css` so the layout stays easy to tune.
