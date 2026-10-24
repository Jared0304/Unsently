# Unsently

Unsently is a small, self-hosted anonymous note-sharing app. It has three
tabs: **Home**, **Notes**, and **About**. Notes can include optional names, an
image (or a camera capture on mobile), and an authorized music preview. Notes
are editable and deletable by the browser that created them. The About page can
be edited by the first browser that saves it.

The app is designed as a quiet paper-and-ink space: warm paper, dark doodle
outlines, pastel accents, handwritten headings, imperfect borders, restrained
motion, and no social or engagement features.

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS 3.4
- Express 4
- SQLite via `better-sqlite3`
- `sharp` for image validation and re-encoding
- Fonts bundled locally with Fontsource: Caveat, Lora, Nunito

## Requirements

- Node.js **22 or newer** (`better-sqlite3` 13 requires Node 22+)
- npm
- A C++ build toolchain is only needed if a prebuilt native binary is not
  available for your platform. The project was built and tested on Node 24.

## Quick start

```bash
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

### Development

```bash
npm run dev
```

This starts the API on `http://localhost:8787` and Vite on
`http://localhost:5173`. Open `http://localhost:5173`.

### Production-style local run

```bash
npm run build
npm start
```

Open `http://localhost:8787`. `npm start` expects `dist/` and `dist-server/` to
exist, so run the build first. `npm run preview` does both.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | API watcher + Vite dev server |
| `npm run build` | Type-check the frontend, build `dist/`, compile the API to `dist-server/` |
| `npm start` | Run the compiled API and serve the built frontend |
| `npm run preview` | `npm run build && npm start` |

## Configuration

Environment variables are read from `.env` at server start.

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8787` | API and production static-server port |
| `DATA_DIR` | `./data` | Directory for the SQLite database and uploaded images |
| `NODE_ENV` | `development` | Set to `production` on a real deployment |

The owner cookie is marked `Secure` when `NODE_ENV=production`. Therefore, a
production deployment must be served over HTTPS. If you are testing a
production build over plain HTTP on localhost, leave `NODE_ENV` unset or set it
to `development`.

## Data and backups

At startup the app creates:

- `data/unsently.db` — SQLite database (WAL mode)
- `data/uploads/` — re-encoded WebP uploads

Both are ignored by git. To reset a development instance, stop the server and
delete the `data/` directory. To back up a live instance, copy the whole data
directory while the app is stopped (or use a SQLite-aware backup).

## Ownership and anonymity

There are no accounts, passwords, emails, or public user IDs.

- On the first write, the server creates a random 256-bit owner token and stores
  it in an `HttpOnly`, `SameSite=Lax` cookie named `unsently_owner`.
- The database stores only a SHA-256 hash of that token. The raw token stays in
  the browser cookie.
- Note APIs never return the owner hash. Ownership is checked on the server for
  edit and delete requests.
- Clearing cookies or using another browser loses the ability to edit or delete
  that browser's notes. There is no recovery flow.
- The About page is a single row. The first successful About save claims it for
  that browser. Other browsers can read it but receive `403` when they try to
  save. Clearing the owner cookie also loses ownership of About.
- The same owner cookie can own any number of notes and the About page.

### What anonymity means here

Anonymity means the app does not ask for an account, does not display a public
owner identity, and shows “Anonymous” when no sender name is provided. It does
**not** mean the content is encrypted or private. The Home feed is public to
anyone who can reach the server. Server operators and hosting providers can
read the database and, depending on the reverse proxy and hosting setup, may
have request logs. Do not use this for sensitive personal information.

There is no moderation or approval step. If you deploy publicly, review your
legal and content-moderation obligations.

## Notes, images, and music

### Notes

- Note text: up to 5,000 characters.
- Sender/recipient names: optional, up to 80 characters each.
- Customization: paper color, ink color, handwriting/serif/sans font, and a
  small doodle. Reset returns to the default design.
- The Notes tab includes a live preview and a “My notes” tray for editing
  published notes without creating duplicates.
- Deletion asks for confirmation.

### Images

- Upload limit: **8 MB**.
- MIME allowlist: JPEG, PNG, WebP, AVIF, HEIC/HEIF.
- Files are decoded and re-encoded to WebP with `sharp`, resized to at most
  2400 × 2400, and saved under a generated UUID filename. Re-encoding strips
  metadata by default.
- The server generates all filenames and serves uploads from `/uploads/`.
- The camera button uses the browser's native file picker with
  `capture="environment"`. The OS/browser handles camera permission and promise
  fallback. If the device does not support capture, the normal picker is used.
- Images open in a keyboard-accessible lightbox. Backdrop click and Escape
  close it, focus is trapped inside it, and focus returns to the trigger.

### Music

- Music search is proxied server-side through the public iTunes Search API. No
  Apple developer key is required and no search results are hardcoded.
- Only HTTPS preview and artwork URLs on Apple/iTunes hosts are accepted and
  stored. The app does not download or rehost audio.
- Playback uses authorized preview URLs, shows cover art and track title, and
  has play/pause controls.
- Only one preview plays at a time. The UI stops playback after **20 seconds**
  even though iTunes previews may be longer.
- Preview failures show a small “Preview unavailable.” message instead of
  breaking the feed.
- Search availability depends on Apple's API and is currently queried against
  the US storefront.

## API overview

All endpoints are same-origin and require the owner cookie only for mutations
that need ownership.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/notes` | Public feed, newest first |
| `GET` | `/api/notes/mine` | Notes owned by the current cookie |
| `POST` | `/api/notes` | Create a note (multipart form) |
| `PATCH` | `/api/notes/:id` | Update an owned note (multipart form) |
| `DELETE` | `/api/notes/:id` | Delete an owned note |
| `GET` | `/api/about` | About text/image and whether this browser can edit |
| `PUT` | `/api/about` | Save the About page (multipart form) |
| `GET` | `/api/music/search?q=` | Proxy iTunes song search |

Note form fields: `text`, `senderName`, `recipientName`, `paper`, `ink`, `font`,
`doodle`, `music` (JSON string or empty), `image` (optional file), and
`removeImage` (`true` when removing an existing image). The About form uses
`text`, `image`, and `removeImage`.

## Database

The app creates the schema automatically. A documented reference schema is in
[`docs/schema.sql`](docs/schema.sql).

SQLite is used in WAL mode. Ownership is enforced in the API layer; SQLite has no
row-level security. Keep the data directory outside the web root and never serve
the database or uploads directory as generic files.

## Security notes

- Ownership checks run server-side on every edit/delete/save request.
- The owner token is random, `HttpOnly`, `SameSite=Lax`, and `Secure` in
  production. Only its SHA-256 hash is stored.
- Helmet sets security headers, including a Content Security Policy that allows
  local assets plus Apple artwork/audio hosts. No third-party JavaScript is
  loaded.
- Uploads are size-limited, MIME-filtered, decoded, and re-encoded before being
  served with generated names.
- Request bodies are bounded (`express.json` limit and multer field/file
  limits).
- There is no built-in rate limiting. For a public deployment, add rate limits
  at the reverse proxy or application layer, use TLS, keep dependencies patched,
  and monitor disk usage.
- This is a single-instance, local-disk design. It is not a distributed
  multi-tenant service.

## Deployment outline

1. Use Node 22+ and install production dependencies.
2. Set `NODE_ENV=production` and a persistent `DATA_DIR`.
3. Run `npm run build`, then `npm start` behind an HTTPS reverse proxy.
4. Ensure the proxy forwards the original host/protocol headers (the server
   trusts the proxy in production) and sets an appropriate request body limit.
5. Back up the data directory and monitor disk space for uploads.
6. Add rate limiting, logging, and moderation appropriate to your audience.

## Accessibility and responsiveness

- Three navigation targets on desktop and a bottom tab bar on mobile.
- Keyboard-operable controls, visible focus rings, labeled form fields, and
  dialog focus trapping/restoration.
- Lightboxes close with Escape, backdrop click, or the close button.
- Reduced-motion media query disables non-essential animation.
- Loading skeletons, empty states, retry states, upload errors, and music
  failure messages are included.
- Unsaved note/about edits trigger a discard confirmation when navigating away,
  and the browser's unload warning is enabled while edits are dirty.

## Project layout

```text
server/                 Express API, SQLite, ownership, uploads, music proxy
src/components/         Pages, note card, editor, design controls, dialogs
src/hooks/              Shared single-audio preview player
src/lib/                API client, types, design tokens, formatting
public/                 Paper texture, favicon, robots.txt
docs/schema.sql         Reference database schema
data/                   Runtime database/uploads (ignored, created on start)
```

## Known limitations

- Ownership is cookie-bound and cannot be recovered.
- There is one shared About page, claimed by its first editor.
- The feed is public and unmoderated by design.
- SQLite and local disk uploads suit a single instance; scaling out requires a
  different database and object storage.
- iTunes preview availability varies by track, region, and Apple's service.

The initial About text is a neutral app description seeded on first start. It is
intended to be replaced through the About editor.
